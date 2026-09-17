const mongoose = require('mongoose');
const { ESTADOS, CATEGORIAS, PRIORIDADES } = require('../utils/constantes');

const solicitudSchema = new mongoose.Schema(
  {
    titulo: {
      type: String,
      required: [true, 'El título es obligatorio'],
      trim: true,
      maxlength: 120,
    },
    descripcion: {
      type: String,
      required: [true, 'La descripción es obligatoria'],
      trim: true,
      maxlength: 2000,
    },
    categoria: {
      type: String,
      required: [true, 'La categoría es obligatoria'],
      enum: CATEGORIAS,
    },
    prioridad: {
      type: String,
      required: true,
      enum: PRIORIDADES,
      default: 'Media',
    },
    estado: {
      type: String,
      enum: Object.values(ESTADOS),
      default: ESTADOS.PENDIENTE,
    },
    respuesta: { type: String, default: null },
    errorMensaje: { type: String, default: null },
    fechaProcesamiento: { type: Date, default: null },
    fechaRespuesta: { type: Date, default: null },
  },
  {
    timestamps: { createdAt: 'fechaCreacion', updatedAt: 'fechaActualizacion' },
    versionKey: false,
  }
);

module.exports = mongoose.model('Solicitud', solicitudSchema);