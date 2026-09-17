#!/usr/bin/env node
/*
 * TASKFLOW - Script de demostración
 * Registra N solicitudes contra la API para probar la cola, la recuperación
 * y las reglas de respuesta sin usar el navegador.
 *
 * Uso:
 *   node scripts/crear-solicitudes.mjs [cantidad] [--base URL] [--error]
 *
 * Opciones:
 *   cantidad   Número de solicitudes a crear (default: 5)
 *   --base URL  URL de la API (default: http://localhost:3000)
 *   --error     Agrega una solicitud con el marcador [SIMULAR ERROR]
 *
 * Ejemplo (prueba de cola):
 *   docker compose stop worker
 *   node scripts/crear-solicitudes.mjs 5
 *   docker compose start worker
 */

const BASE = process.argv.includes('--base')
  ? process.argv[process.argv.indexOf('--base') + 1]
  : 'http://localhost:3000';

const cantidadArg = process.argv.find((a) => /^\d+$/.test(a));
const cantidad = cantidadArg ? Number(cantidadArg) : 5;
const conError = process.argv.includes('--error');

const CATEGORIAS = ['Información', 'Soporte', 'Documento', 'Consulta', 'Actualización'];
const PRIORIDADES = ['Baja', 'Media', 'Alta'];

function cuerpo(categoria, i) {
  return {
    titulo: `Demo ${i + 1} - ${categoria}`,
    descripcion: `Solicitud de demostración para la categoría ${categoria} generada por el script de pruebas.`,
    categoria,
    prioridad: PRIORIDADES[i % PRIORIDADES.length],
  };
}

async function crear(datos) {
  const respuesta = await fetch(`${BASE}/api/solicitudes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos),
  });
  const json = await respuesta.json();
  if (!respuesta.ok) {
    throw new Error(`${respuesta.status} ${JSON.stringify(json)}`);
  }
  return json;
}

async function main() {
  for (let i = 0; i < cantidad; i++) {
    const datos = cuerpo(CATEGORIAS[i % CATEGORIAS.length], i);
    const creada = await crear(datos);
    console.log(`[${i + 1}/${cantidad}] ${creada._id} -> ${creada.estado} (${creada.categoria})`);
  }

  if (conError) {
    const datos = {
      titulo: 'Demo de error [SIMULAR ERROR]',
      descripcion: 'Solicitud para comprobar el estado ERROR de forma controlada.',
      categoria: 'Soporte',
      prioridad: 'Media',
    };
    const creada = await crear(datos);
    console.log(`[ERROR] ${creada._id} -> ${creada.estado} ([SIMULAR ERROR])`);
  }

  console.log(`\nSe registraron ${cantidad + (conError ? 1 : 0)} solicitudes en ${BASE}`);
}

main().catch((err) => {
  console.error('Fallo:', err.message);
  process.exit(1);
});