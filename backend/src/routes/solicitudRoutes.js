const { Router } = require('express');
const { crearSolicitudController } = require('../controllers/solicitudController');
const { crearSolicitud, actualizarSolicitud, validar } = require('../middlewares/validarSolicitud');

function crearSolicitudRoutes(servicios) {
  const router = Router();
  const controller = crearSolicitudController(servicios);

  router.get('/', controller.listar);
  router.get('/:id', controller.detalle);
  router.post('/', crearSolicitud, validar, controller.crear);
  router.put('/:id', actualizarSolicitud, validar, controller.actualizar);
  router.delete('/:id', controller.eliminar);

  return router;
}

module.exports = { crearSolicitudRoutes };