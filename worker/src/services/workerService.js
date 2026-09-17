const Solicitud = require('../models/Solicitud');
const { ESTADOS, REDIS } = require('../utils/constantes');
const { generarRespuesta } = require('./reglasService');

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
    } catch (err) {
      console.warn('[worker] no se pudo actualizar heartbeat:', err.message);
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

  return { ejecutarCiclo, procesarSolicitud, mantenerHeartbeat };
}

module.exports = { crearWorkerService };