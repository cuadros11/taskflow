const { Router } = require('express');
const { crearMonitorController } = require('../controllers/monitorController');

function crearMonitorRoutes(servicios) {
  const router = Router();
  const controller = crearMonitorController(servicios);

  router.get('/', controller.obtener);

  return router;
}

module.exports = { crearMonitorRoutes };