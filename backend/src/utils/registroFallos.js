/**
 * Registro de fallos repetidos (Redis caído, mongo caído, etc.).
 *
 * Evita inundar la terminal: imprime el error la primera vez y luego como
 * máximo una vez cada `intervaloMs`, indicando cuántas veces se repitió.
 * Cuando el servicio vuelve, avisa una sola vez.
 */
function crearRegistroFallos(prefijo, opciones = {}) {
  const { intervaloMs = 15000 } = opciones;

  let mensajeActivo = null;
  let repeticiones = 0;
  let ultimaSalida = 0;

  return {
    fallo(err) {
      const mensaje = (err && err.message) || String(err);
      const ahora = Date.now();

      if (mensaje === mensajeActivo) {
        repeticiones += 1;
        if (ahora - ultimaSalida < intervaloMs) return;
        console.error(`${prefijo} ${mensaje} (repetido ${repeticiones} veces)`);
      } else {
        mensajeActivo = mensaje;
        repeticiones = 0;
        console.error(`${prefijo} ${mensaje}`);
      }

      ultimaSalida = ahora;
    },

    ok() {
      if (!mensajeActivo) return;
      console.log(`${prefijo} conexión restablecida ✓`);
      mensajeActivo = null;
      repeticiones = 0;
      ultimaSalida = 0;
    },
  };
}

module.exports = { crearRegistroFallos };
