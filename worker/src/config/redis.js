const Redis = require('ioredis');
const { crearRegistroFallos } = require('../utils/registroFallos');

function crearClienteRedis(url) {
  const cliente = new Redis(url, { maxRetriesPerRequest: 1 });
  const registro = crearRegistroFallos('[worker][redis]');

  cliente.on('error', (err) => registro.fallo(err));
  cliente.on('ready', () => registro.ok());

  return cliente;
}

module.exports = { crearClienteRedis };