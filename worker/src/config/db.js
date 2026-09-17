const mongoose = require('mongoose');

async function conectarMongoDB(uri) {
  mongoose.set('strictQuery', true);
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
  console.log('[worker][mongo] Conexión establecida');
  return mongoose.connection;
}

module.exports = { conectarMongoDB };