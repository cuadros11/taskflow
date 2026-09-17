function errorHandler(err, req, res, next) {
  let status = err.statusCode || 500;
  let mensaje = err.message || 'Error interno del servidor';

  if (err.name === 'ValidationError') {
    status = status === 500 ? 400 : status;
    mensaje = Object.values(err.errors)
      .map((e) => e.message)
      .join(', ');
  }

  if (err.name === 'CastError') {
    status = 400;
    mensaje = 'Identificador con formato inválido';
  }

  if (err.code === 11000) {
    status = 409;
    mensaje = 'Ya existe un registro con los datos proporcionados';
  }

  if (status >= 500) {
    console.error('[error]', err);
  }

  res.status(status).json({ mensaje });
}

module.exports = errorHandler;