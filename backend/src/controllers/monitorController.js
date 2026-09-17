const asyncHandler = require('../utils/asyncHandler');

function crearMonitorController({ monitor }) {
  const obtener = asyncHandler(async (req, res) => {
    const estado = await monitor.obtenerEstado();
    res.json(estado);
  });

  return { obtener };
}

module.exports = { crearMonitorController };