require('dotenv').config();

const { conectarMongoDB } = require('./config/db');
const { crearClienteRedis } = require('./config/redis');
const { crearWorkerService } = require('./services/workerService');

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

  async function ciclo() {
    if (detenido) return;
    try {
      await worker.ejecutarCiclo();
    } catch (err) {
      console.error('[worker] error de ciclo:', err.message);
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }
    setTimeout(ciclo, INTERVALO_MS);
  }

  setInterval(() => worker.mantenerHeartbeat().catch(() => {}), 5000);

  setTimeout(ciclo, 0);

  const cerrar = async () => {
    detenido = true;
    console.log('\n[worker] cerrando...');
    redis.quit();
    process.exit(0);
  };

  process.on('SIGINT', cerrar);
  process.on('SIGTERM', cerrar);
}

iniciar().catch((err) => {
  console.error('[worker] fallo al iniciar:', err);
  process.exit(1);
});