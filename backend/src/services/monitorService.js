const { REDIS } = require('../utils/constantes');

function crearMonitorService({ solicitudes, redis, clienteRedis, mongoose }) {
  async function obtenerEstado() {
    const contadores = await solicitudes.contarPorEstado();
    // Largo real de la cola de Redis (dato de diagnóstico). El conteo de
    // "EN COLA" viene del estado real en MongoDB y ya viene en `contadores`.
    const colaRedis = await redis.contarCola();

    const mongodbActivo = mongoose.connection.readyState === 1;

    let redisActivo = false;
    let redisLatencia = null;
    try {
      redisLatencia = await redis.latencia();
      redisActivo = true;
    } catch (err) {
      redisActivo = false;
    }

    let workerActivo = false;
    try {
      const heartbeat = await clienteRedis.get(REDIS.WORKER_HEARTBEAT);
      // El heartbeat solo cuenta si su marca de tiempo es reciente (ventana
      // de 2× el intervalo de latido de 5 s del worker): si el worker muere
      // sin poder borrar la clave, se detecta igual en ~10 s.
      const ventanaMs = Number(process.env.HEARTBEAT_VENTANA_MS || 10000);
      workerActivo = Boolean(heartbeat && Date.now() - Number(heartbeat) < ventanaMs);
    } catch (err) {
      workerActivo = false;
    }

    return {
      servicios: {
        express: true,
        mongodb: mongodbActivo,
        redis: redisActivo,
        worker: workerActivo,
      },
      redis: { activo: redisActivo, latenciaMs: redisLatencia },
      contadores: { ...contadores, colaRedis },
    };
  }

  return { obtenerEstado };
}

module.exports = { crearMonitorService };