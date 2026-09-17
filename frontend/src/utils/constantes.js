export const ESTADOS = Object.freeze({
  PENDIENTE: 'PENDIENTE',
  EN_COLA: 'EN COLA',
  PROCESANDO: 'PROCESANDO',
  RESPONDIDA: 'RESPONDIDA',
  ERROR: 'ERROR',
});

export const CATEGORIAS = Object.freeze([
  'Información',
  'Soporte',
  'Documento',
  'Consulta',
  'Actualización',
]);

export const PRIORIDADES = Object.freeze(['Baja', 'Media', 'Alta']);

export const ETIQUETAS_ESTADO = Object.freeze({
  [ESTADOS.PENDIENTE]: 'Pendiente',
  [ESTADOS.EN_COLA]: 'En cola',
  [ESTADOS.PROCESANDO]: 'Procesando',
  [ESTADOS.RESPONDIDA]: 'Respondida',
  [ESTADOS.ERROR]: 'Error',
});

export const VERSIONES_ESTADO = Object.freeze(['PENDIENTE', 'EN COLA', 'PROCESANDO', 'RESPONDIDA']);