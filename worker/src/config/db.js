const mongoose = require('mongoose');

async function conectarMongoDB(uri, opciones = {}) {
  const { reintentos = 10, esperaMs = 3000 } = opciones;
  mongoose.set('strictQuery', true);

  for (let intento = 1; intento <= reintentos; intento++) {
    try {
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
      console.log('[worker][mongo] Conexión establecida');
      return mongoose.connection;
    } catch (err) {
      if (intento >= reintentos) throw err;
      console.warn(
        `[worker][mongo] sin conexión (intento ${intento}/${reintentos}): ${err.message}. Reintentando en ${esperaMs} ms...`
      );
      await new Promise((resolver) => setTimeout(resolver, esperaMs));
    }
  }
}

module.exports = { conectarMongoDB };
