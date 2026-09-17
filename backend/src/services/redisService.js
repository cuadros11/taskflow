const { REDIS } = require('../utils/constantes');

function crearRedisService({ cliente, publicador }) {
  async function encolarSolicitud(id) {
    await cliente.rpush(REDIS.COLA, String(id));
  }

  async function contarCola() {
    try {
      return await cliente.llen(REDIS.COLA);
    } catch (err) {
      return 0;
    }
  }

  async function cacheGet(llave) {
    const valor = await cliente.get(llave);
    return valor ? JSON.parse(valor) : null;
  }

  async function cacheSet(llave, dato, ttl = REDIS.CACHE_TTL) {
    await cliente.set(llave, JSON.stringify(dato), 'EX', ttl);
  }

  async function cacheDel(llave) {
    await cliente.del(llave);
  }

  async function publicarEvento(tipo, data) {
    await publicador.publish(
      REDIS.CANAL_EVENTOS,
      JSON.stringify({ tipo, data, timestamp: new Date().toISOString() })
    );
  }

  async function latencia() {
    const inicio = Date.now();
    await cliente.ping();
    return Date.now() - inicio;
  }

  return { encolarSolicitud, contarCola, cacheGet, cacheSet, cacheDel, publicarEvento, latencia };
}

module.exports = { crearRedisService };