const ESTADOS = Object.freeze({
  PENDIENTE: 'PENDIENTE',
  EN_COLA: 'EN COLA',
  PROCESANDO: 'PROCESANDO',
  RESPONDIDA: 'RESPONDIDA',
  ERROR: 'ERROR',
});

const CATEGORIAS = Object.freeze([
  'Información',
  'Soporte',
  'Documento',
  'Consulta',
  'Actualización',
]);

const PRIORIDADES = Object.freeze(['Baja', 'Media', 'Alta']);

const REDIS = Object.freeze({
  COLA: 'taskflow:cola',
  CACHE_SOLICITUDES: 'taskflow:solicitudes',
  CACHE_TTL: 60,
  WORKER_HEARTBEAT: 'taskflow:worker:heartbeat',
  CANAL_EVENTOS: 'taskflow:eventos',
});

module.exports = { ESTADOS, CATEGORIAS, PRIORIDADES, REDIS };