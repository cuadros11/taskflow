const Redis = require('ioredis');

function crearClients(url) {
  const cliente = new Redis(url, { maxRetriesPerRequest: 3, lazyConnect: false });
  const suscriptor = new Redis(url, {
    maxRetriesPerRequest: 3,
    enableReadyCheck: false,
  });
  const publicador = new Redis(url, { maxRetriesPerRequest: 3 });
  return { cliente, suscriptor, publicador };
}

module.exports = { crearClients };