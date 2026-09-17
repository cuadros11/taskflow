const asyncHandler = require('../utils/asyncHandler');
const { REDIS } = require('../utils/constantes');

function crearSolicitudController({ solicitudes, redis }) {
  const listar = asyncHandler(async (req, res) => {
    const llave = REDIS.CACHE_SOLICITUDES;
    const cacheado = await redis.cacheGet(llave);

    if (cacheado) {
      return res.set('X-Cache', 'HIT').json({ origen: 'cache', datos: cacheado });
    }

    const datos = await solicitudes.listarSolicitudes();
    await redis.cacheSet(llave, datos);

    return res.set('X-Cache', 'MISS').json({ origen: 'mongo', datos });
  });

  const detalle = asyncHandler(async (req, res) => {
    const solicitud = await solicitudes.obtenerSolicitud(req.params.id);
    res.json(solicitud);
  });

  const crear = asyncHandler(async (req, res) => {
    const solicitud = await solicitudes.crearSolicitud(req.body);
    await redis.cacheDel(REDIS.CACHE_SOLICITUDES);
    res.status(201).json(solicitud);
  });

  const actualizar = asyncHandler(async (req, res) => {
    const solicitud = await solicitudes.actualizarSolicitud(req.params.id, req.body);
    await redis.cacheDel(REDIS.CACHE_SOLICITUDES);
    res.json(solicitud);
  });

  const eliminar = asyncHandler(async (req, res) => {
    const resultado = await solicitudes.eliminarSolicitud(req.params.id);
    await redis.cacheDel(REDIS.CACHE_SOLICITUDES);
    res.json(resultado);
  });

  return { listar, detalle, crear, actualizar, eliminar };
}

module.exports = { crearSolicitudController };