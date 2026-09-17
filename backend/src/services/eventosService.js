const { REDIS } = require('../utils/constantes');

function escucharEventos({ suscriptor, io, obtenerContadores }) {
  suscriptor.subscribe(REDIS.CANAL_EVENTOS).catch((err) => {
    console.error('[eventos] no se pudo suscribir al canal:', err.message);
  });

  suscriptor.on('message', async (canal, mensaje) => {
    if (canal !== REDIS.CANAL_EVENTOS) return;
    try {
      const evento = JSON.parse(mensaje);
      const contadores = await obtenerContadores().catch(() => null);

      io.emit(evento.tipo, { ...evento, contadores });
      io.emit('monitor-actualizado', contadores);

      console.log('[eventos] emitido:', evento.tipo);
    } catch (err) {
      console.error('[eventos] error al procesar mensaje:', err.message);
    }
  });

  console.log('[eventos] escuchando canal', REDIS.CANAL_EVENTOS);
}

module.exports = { escucharEventos };