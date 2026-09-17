require('dotenv').config();
const mongoose = require('mongoose');

const { conectarMongoDB } = require('./config/db');
const { crearClients } = require('./config/redis');
const { crearRedisService } = require('./services/redisService');
const { crearSolicitudService } = require('./services/solicitudService');
const { crearMonitorService } = require('./services/monitorService');
const { escucharEventos } = require('./services/eventosService');
const { crearApp } = require('./app');

const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/taskflow';
const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

async function iniciar() {
  const { cliente, suscriptor, publicador } = crearClients(REDIS_URL);

  await conectarMongoDB(MONGODB_URI);

  const redis = crearRedisService({ cliente, publicador });
  const solicitudesService = crearSolicitudService(redis);
  const monitor = crearMonitorService({ solicitudes: solicitudesService, redis, clienteRedis: cliente, mongoose });

  const { server, io } = crearApp({
    solicitudesService,
    redis,
    monitor,
    clienteRedis: cliente,
    mongoose,
  });

  escucharEventos({
    suscriptor,
    io,
    obtenerContadores: () => solicitudesService.contarPorEstado(),
  });

  server.listen(PORT, () => {
    console.log('========================================');
    console.log(' TASKFLOW Backend  (Express + Socket.IO)');
    console.log(`  API REST   -> http://localhost:${PORT}/api`);
    console.log('========================================');
  });

  const cerrar = async (señal) => {
    console.log(`\n[server] recibida señal ${señal}, cerrando...`);
    await mongoose.connection.close().catch(() => {});
    cliente.quit();
    suscriptor.quit();
    publicador.quit();
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(0), 3000).unref();
  };

  process.on('SIGINT', () => cerrar('SIGINT'));
  process.on('SIGTERM', () => cerrar('SIGTERM'));
}

iniciar().catch((err) => {
  console.error('[server] fallo al iniciar:', err);
  process.exit(1);
});