const Solicitud = require('../models/Solicitud');
const { ESTADOS, REDIS } = require('../utils/constantes');
const { generarRespuesta } = require('./reglasService');
const { crearRegistroFallos } = require('../utils/registroFallos');

const registroHeartbeat = crearRegistroFallos('[worker][heartbeat]');
const registroRecuperacion = crearRegistroFallos('[worker][recuperacion]');

function crearWorkerService({ redis }) {
  async function tomarSolicitudDeCola(timeout = 5) {
    const resultado = await redis.blpop(REDIS.COLA, timeout);
    if (!resultado) return null;
    return String(resultado[1]);
  }

  async function publicarEvento(tipo, data) {
    await redis.publish(
      REDIS.CANAL_EVENTOS,
      JSON.stringify({ tipo, data, timestamp: new Date().toISOString() })
    );
  }

  async function invalidarCache() {
    try {
      await redis.del(REDIS.CACHE_SOLICITUDES);
    } catch (err) {
      console.warn('[worker] no se pudo invalidar caché:', err.message);
    }
  }

  async function mantenerHeartbeat() {
    try {
      const ttl = Number(process.env.HEARTBEAT_TTL || 15);
      await redis.set(REDIS.WORKER_HEARTBEAT, String(Date.now()), 'EX', ttl);
      registroHeartbeat.ok();
    } catch (err) {
      registroHeartbeat.fallo(err);
    }
  }

  /** Borra el heartbeat al cerrar para que el monitor lo detecte al instante. */
  async function liberarHeartbeat() {
    try {
      await redis.del(REDIS.WORKER_HEARTBEAT);
    } catch (err) {
      // Redis puede no estar disponible al cerrar: no bloquea la salida.
    }
  }

  /**
   * Recupera solicitudes huérfanas: documentos en estado "EN COLA" cuyo ID ya
   * no está en la cola de Redis (p. ej. porque la cola se perdió al reiniciar
   * Redis o el worker murió justo después del BLPOP). Se consideran solo las
   * que llevan `EDAD_MINIMA_MS` sin actualizarse para no interferir con una
   * solicitud que se acaba de crear o que el worker está procesando ahora.
   */
  async function recuperarHuerfanas() {
    try {
      const edadMinimaMs = Number(process.env.RECUPERACION_EDAD_MS || 60000);
      const limite = new Date(Date.now() - edadMinimaMs);

      const candidatas = await Solicitud.find({
        estado: ESTADOS.EN_COLA,
        fechaActualizacion: { $lt: limite },
      }).select('_id');

      if (!candidatas.length) return { revisadas: 0, reencoladas: 0 };

      const enCola = await redis.lrange(REDIS.COLA, 0, -1);
      const existentes = new Set(enCola.map(String));
      const faltantes = candidatas
        .map((solicitud) => String(solicitud._id))
        .filter((id) => !existentes.has(id));

      if (faltantes.length) {
        await redis.rpush(REDIS.COLA, ...faltantes);
        console.log(
          `[worker] recuperación: ${faltantes.length} solicitud(es) huérfana(s) volvieron a la cola`
        );
      }

      registroRecuperacion.ok();
      return { revisadas: candidatas.length, reencoladas: faltantes.length };
    } catch (err) {
      registroRecuperacion.fallo(err);
      return { revisadas: 0, reencoladas: 0, error: err.message };
    }
  }

  async function procesarSolicitud(id) {
    const solicitud = await Solicitud.findById(id);
    if (!solicitud) {
      console.warn(`[worker] solicitud ${id} no existe en MongoDB, se omite`);
      await publicarEvento('solicitud-error', {
        id,
        mensaje: 'La solicitud no existe en la base de datos',
      });
      return { omitida: true };
    }

    solicitud.estado = ESTADOS.PROCESANDO;
    solicitud.fechaProcesamiento = new Date();
    await solicitud.save();
    await publicarEvento('solicitud-procesando', { id: solicitud.id });

    try {
      const resultado = generarRespuesta(solicitud);

      solicitud.respuesta = resultado.respuesta;
      solicitud.errorMensaje = null;
      solicitud.estado = ESTADOS.RESPONDIDA;
      solicitud.fechaRespuesta = new Date();
      await solicitud.save();

      await invalidarCache();
      await publicarEvento('solicitud-respondida', {
        id: solicitud.id,
        estado: solicitud.estado,
        reglaAplicada: resultado.reglaAplicada,
        respuesta: solicitud.respuesta,
      });

      console.log(`[worker] solicitud ${solicitud.id} RESPONDIDA (${resultado.reglaAplicada})`);
      return { procesada: true, reglaAplicada: resultado.reglaAplicada };
    } catch (err) {
      solicitud.estado = ESTADOS.ERROR;
      solicitud.errorMensaje = err.message;
      solicitud.fechaRespuesta = new Date();
      await solicitud.save();

      await invalidarCache();
      await publicarEvento('solicitud-error', {
        id: solicitud.id,
        mensaje: solicitud.errorMensaje,
      });

      console.error(`[worker] solicitud ${solicitud.id} con ERROR:`, err.message);
      return { procesada: false, error: err.message };
    }
  }

  async function ejecutarCiclo() {
    await mantenerHeartbeat();
    const id = await tomarSolicitudDeCola(5);

    if (!id) {
      return null;
    }

    return procesarSolicitud(id);
  }

  return { ejecutarCiclo, procesarSolicitud, mantenerHeartbeat, recuperarHuerfanas, liberarHeartbeat };
}

module.exports = { crearWorkerService };