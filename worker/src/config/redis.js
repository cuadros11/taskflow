const Redis = require('ioredis');

function crearClienteRedis(url) {
  const cliente = new Redis(url, { maxRetriesPerRequest: 1 });
  cliente.on('error', (err) => {
    console.error('[worker][redis] error:', err.message);
  });
  return cliente;
}

module.exports = { crearClienteRedis };