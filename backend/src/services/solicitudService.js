const Solicitud = require('../models/Solicitud');
const { ESTADOS } = require('../utils/constantes');
const AppError = require('../utils/AppError');

const CAMPOS_EDITABLES = ['titulo', 'descripcion', 'categoria', 'prioridad'];

function crearSolicitudService(redis) {
  async function listarSolicitudes() {
    return Solicitud.find().sort({ fechaCreacion: -1 });
  }

  async function obtenerSolicitud(id) {
    const solicitud = await Solicitud.findById(id);
    if (!solicitud) {
      throw new AppError('Solicitud no encontrada', 404);
    }
    return solicitud;
  }

  async function crearSolicitud(datos) {
    const solicitud = await Solicitud.create({ ...datos, estado: ESTADOS.PENDIENTE });

    await redis.publicarEvento('solicitud-creada', { id: solicitud.id });

    await redis.encolarSolicitud(solicitud.id);

    solicitud.estado = ESTADOS.EN_COLA;
    await solicitud.save();

    await redis.publicarEvento('solicitud-encolada', { id: solicitud.id, estado: solicitud.estado });

    return solicitud;
  }

  async function actualizarSolicitud(id, cambios) {
    const solicitud = await obtenerSolicitud(id);
    if (solicitud.estado === ESTADOS.RESPONDIDA || solicitud.estado === ESTADOS.PROCESANDO) {
      throw new AppError(
        `No es posible editar una solicitud en estado ${solicitud.estado}`,
        409
      );
    }

    CAMPOS_EDITABLES.forEach((campo) => {
      if (cambios[campo] !== undefined) solicitud[campo] = cambios[campo];
    });

    await solicitud.save();
    return solicitud;
  }

  async function eliminarSolicitud(id) {
    const solicitud = await obtenerSolicitud(id);
    if (solicitud.estado === ESTADOS.RESPONDIDA || solicitud.estado === ESTADOS.PROCESANDO) {
      throw new AppError(
        `No es posible eliminar una solicitud en estado ${solicitud.estado}`,
        409
      );
    }
    await solicitud.deleteOne();
    return { eliminado: true };
  }

  async function contarPorEstado() {
    const agregados = await Solicitud.aggregate([
      { $group: { _id: '$estado', total: { $sum: 1 } } },
    ]);

    const contadores = {
      total: 0,
      pendiente: 0,
      enCola: 0,
      procesando: 0,
      respondida: 0,
      error: 0,
    };

    for (const item of agregados) {
      const mapa = {
        [ESTADOS.PENDIENTE]: 'pendiente',
        [ESTADOS.EN_COLA]: 'enCola',
        [ESTADOS.PROCESANDO]: 'procesando',
        [ESTADOS.RESPONDIDA]: 'respondida',
        [ESTADOS.ERROR]: 'error',
      };
      if (mapa[item._id]) contadores[mapa[item._id]] = item.total;
    }

    contadores.total = agregados.reduce((acc, item) => acc + item.total, 0);
    return contadores;
  }

  return { listarSolicitudes, obtenerSolicitud, crearSolicitud, actualizarSolicitud, eliminarSolicitud, contarPorEstado };
}

module.exports = { crearSolicitudService };