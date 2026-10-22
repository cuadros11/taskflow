require('dotenv').config();

const { conectarMongoDB } = require('./config/db');
const { crearClienteRedis } = require('./config/redis');
const { crearWorkerService } = require('./services/workerService');
const { crearRegistroFallos } = require('./utils/registroFallos');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/taskflow';
const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
const INTERVALO_MS = Number(process.env.INTERVALO_MS || 1000);

async function iniciar() {
  const redis = crearClienteRedis(REDIS_URL);
  await conectarMongoDB(MONGODB_URI);

  const worker = crearWorkerService({ redis });

  console.log('========================================');
  console.log(' TASKFLOW Worker  (procesamiento async)');
  console.log('  Escuchando cola: esperando solicitudes');
  console.log('========================================');

  let detenido = false;
  const registroCiclo = crearRegistroFallos('[worker][ciclo]');

  async function ciclo() {
    if (detenido) return;
    try {
      await worker.ejecutarCiclo();
      registroCiclo.ok();
    } catch (err) {
      registroCiclo.fallo(err);
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }
    setTimeout(ciclo, INTERVALO_MS);
  }

  setInterval(() => worker.mantenerHeartbeat().catch(() => {}), 5000);

  // Recuperación de solicitudes huérfanas: al arrancar y luego periódicamente.
  const INTERVALO_RECUPERACION_MS = Number(process.env.INTERVALO_RECUPERACION_MS || 60 * 1000);
  worker.recuperarHuerfanas();
  setInterval(() => worker.recuperarHuerfanas(), INTERVALO_RECUPERACION_MS);

  setTimeout(ciclo, 0);

  const cerrar = async () => {
    detenido = true;
    console.log('\n[worker] cerrando...');
    await worker.liberarHeartbeat();
    redis.quit().catch(() => {});
    process.exit(0);
  };

  process.on('SIGINT', cerrar);
  process.on('SIGTERM', cerrar);
}

iniciar().catch((err) => {
  console.error('[worker] fallo al iniciar:', err);
  process.exit(1);
});