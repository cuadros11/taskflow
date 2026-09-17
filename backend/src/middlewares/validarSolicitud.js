const { body, param, validationResult } = require('express-validator');
const { CATEGORIAS, PRIORIDADES } = require('../utils/constantes');

const crearSolicitud = [
  body('titulo')
    .isString()
    .withMessage('El título debe ser texto')
    .notEmpty()
    .withMessage('El título es obligatorio')
    .isLength({ max: 120 })
    .withMessage('El título no puede superar 120 caracteres'),
  body('descripcion')
    .isString()
    .withMessage('La descripción debe ser texto')
    .notEmpty()
    .withMessage('La descripción es obligatoria')
    .isLength({ min: 5, max: 2000 })
    .withMessage('La descripción debe tener entre 5 y 2000 caracteres'),
  body('categoria')
    .isIn(CATEGORIAS)
    .withMessage(`Categoría inválida. Válidas: ${CATEGORIAS.join(', ')}`),
  body('prioridad')
    .optional()
    .isIn(PRIORIDADES)
    .withMessage(`Prioridad inválida. Válidas: ${PRIORIDADES.join(', ')}`),
];

const actualizarSolicitud = [
  param('id').isMongoId().withMessage('Identificador de solicitud inválido'),
  body('titulo').optional().isString().notEmpty().withMessage('El título no puede estar vacío'),
  body('descripcion').optional().isString().notEmpty().withMessage('La descripción no puede estar vacía'),
  body('categoria').optional().isIn(CATEGORIAS).withMessage('Categoría inválida'),
  body('prioridad').optional().isIn(PRIORIDADES).withMessage('Prioridad inválida'),
];

function validar(req, res, next) {
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    return res.status(400).json({ mensaje: 'Errores de validación', errores: errores.array() });
  }
  next();
}

module.exports = { crearSolicitud, actualizarSolicitud, validar };