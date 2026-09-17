const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { Server } = require('socket.io');

const { crearSolicitudRoutes } = require('./routes/solicitudRoutes');
const { crearMonitorRoutes } = require('./routes/monitorRoutes');
const notFound = require('./middlewares/notFound');
const errorHandler = require('./middlewares/errorHandler');

function crearApp({ solicitudesService, redis, monitor, clienteRedis, mongoose }) {
  const app = express();
  const server = http.createServer(app);

  const origin = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
  const io = new Server(server, {
    cors: { origin: [origin, 'http://localhost:5173'], methods: ['GET', 'POST', 'PUT', 'DELETE'] },
  });

  app.use(helmet());
  app.use(cors({ origin: [origin, 'http://localhost:5173'] }));
  app.use(express.json());
  app.use(morgan('dev'));

  app.get('/api/health', (req, res) => res.json({ ok: true, servicio: 'TASKFLOW backend' }));

  const servicios = { solicitudes: solicitudesService, redis, monitor, clienteRedis };

  app.use('/api/solicitudes', crearSolicitudRoutes(servicios));
  app.use('/api/monitor', crearMonitorRoutes(servicios));

  app.use(notFound);
  app.use(errorHandler);

  io.on('connection', (socket) => {
    console.log('[socket.io] cliente conectado:', socket.id);
    socket.on('disconnect', () => console.log('[socket.io] cliente desconectado:', socket.id));
  });

  return { app, server, io };
}

module.exports = { crearApp };