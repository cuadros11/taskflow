const { REDIS } = require('../utils/constantes');

function crearMonitorService({ solicitudes, redis, clienteRedis, mongoose }) {
  async function obtenerEstado() {
    const contadores = await solicitudes.contarPorEstado();
    const enCola = await redis.contarCola();

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
      workerActivo = Boolean(await clienteRedis.exists(REDIS.WORKER_HEARTBEAT));
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
      contadores: { ...contadores, enCola },
    };
  }

  return { obtenerEstado };
}

module.exports = { crearMonitorService };