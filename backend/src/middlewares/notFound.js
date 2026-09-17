function notFound(req, res) {
  res.status(404).json({ mensaje: `Ruta ${req.method} ${req.originalUrl} no encontrada` });
}

module.exports = notFound;