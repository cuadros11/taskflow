const Redis = require('ioredis');
const { crearRegistroFallos } = require('../utils/registroFallos');

function crearClients(url) {
  const cliente = new Redis(url, { maxRetriesPerRequest: 3, lazyConnect: false });
  const suscriptor = new Redis(url, {
    maxRetriesPerRequest: 3,
    enableReadyCheck: false,
  });
  const publicador = new Redis(url, { maxRetriesPerRequest: 3 });

  const registrarErrores = (instancia, nombre) => {
    const registro = crearRegistroFallos(`[redis][${nombre}]`);

    instancia.on('error', (err) => registro.fallo(err));
    instancia.on('ready', () => registro.ok());
  };

  registrarErrores(cliente, 'cliente');
  registrarErrores(suscriptor, 'suscriptor');
  registrarErrores(publicador, 'publicador');

  return { cliente, suscriptor, publicador };
}

module.exports = { crearClients };
