# TASKFLOW — Pruebas obligatorias (documentadas)

Fecha de ejecución: 16/09/2026
Entorno: Docker Compose (frontend, backend, worker, mongoserver, redisserver).

Pasos previos:

```bash
docker compose up --build -d
```

- Frontend: http://localhost:8081
- API: http://localhost:3000/api/health
- Monitor: http://localhost:8081/monitor

---

## Prueba 1 — Registro

**Criterio:** Registrar una solicitud desde Vue y comprobar su almacenamiento en MongoDB.

**Procedimiento:** En `Nueva solicitud` se completa título, descripción, categoría y prioridad y se envía.

**Verificación desde la API:**

```bash
curl -s -X POST http://localhost:3000/api/solicitudes \
  -H "Content-Type: application/json" \
  -d '{"titulo":"Solicitud de prueba","descripcion":"Descripcion de la solicitud de prueba","categoria":"Soporte","prioridad":"Alta"}'
```

**Resultado:** HTTP 201, la solicitud queda con estado `EN COLA` y se almacena en MongoDB (verificable con `docker compose exec mongoserver mongosh taskflow --eval "db.solicitudes.countDocuments()"`).

---

## Prueba 2 — Respuesta

**Criterio:** Procesar una solicitud y comprobar que aparece una respuesta.

**Procedimiento:** Tras el registro, el Worker consume la cola, aplica la regla según la categoría y genera la respuesta.

**Resultado observado (detección de una solicitud real):**

```text
creada:   EN COLA
detalle:  RESPONDIDA
respuesta: [Soporte técnico]
Hola, recibimos su solicitud de soporte: "...".
...
```

---

## Prueba 3 — Cola

**Criterio:** Detener el Worker, registrar cinco solicitudes y comprobar que permanecen en cola.

**Procedimiento:**

```bash
docker compose stop worker
# registrar 5 solicitudes (ver scripts/crear-solicitudes.mjs)
```

**Resultado observado:**

```text
monitor: enCola = 5 | worker: no disponible
redis LLEN taskflow:cola -> 5
```

Todas las solicitudes permanecen en estado `EN COLA` mientras el Worker está detenido.

---

## Prueba 4 — Recuperación

**Criterio:** Iniciar nuevamente el Worker y comprobar que procesa las solicitudes pendientes.

**Procedimiento:**

```bash
docker compose start worker
```

**Resultado observado:**

```text
monitor: enCola = 0 | redis LLEN taskflow:cola -> 0
contadores: respondida = 18 (todas las pendientes procesadas)
worker: disponible
```

---

## Prueba 5 — Caché

**Criterio:** Demostrar una consulta `CACHE MISS` y una posterior `CACHE HIT`.

**Procedimiento:**

```bash
curl -s -D - -o /dev/null http://localhost:8081/api/solicitudes
curl -s -D - -o /dev/null http://localhost:8081/api/solicitudes
```

**Resultado observado (cabeceras `X-Cache`):**

```text
1a consulta: X-Cache: MISS   (consulta a MongoDB y almacena en Redis, TTL 60 s)
2a consulta: X-Cache: HIT    (respuesta desde Redis)
```

---

## Prueba 6 — Persistencia

**Criterio:** Reiniciar los servicios y comprobar que la información persiste en MongoDB.

**Procedimiento:**

```bash
docker compose restart mongoserver
```

**Resultado:** El volumen `mongo-data` conserva las solicitudes; el contador total y las solicitudes siguen apareciendo después del reinicio.

---

## Prueba 7 — Error

**Criterio:** Provocar o simular un error controlado y comprobar el estado `ERROR`.

**Procedimiento:** Registrar una solicitud cuyo título o descripción contenga `[SIMULAR ERROR]`.

**Resultado observado:**

```text
creada:   EN COLA
detalle:  ERROR
errorMensaje: "Error controlado: se simuló una falla durante el procesamiento (marque una solicitud con [SIMULAR ERROR])."
```

El sistema continúa procesando el resto de solicitudes (no se bloquea).

---

## Prueba 8 — Responsive

**Criterio:** Comprobar la interfaz en diferentes tamaños de pantalla.

**Procedimiento:** Abrir http://localhost:8081 y usar el modo dispositivo del navegador.

**Resultado:** Dashboard, formulario, listado, detalle y monitor se adaptan a móvil/tablet/escritorio sin desbordes horizontales (menú tipo drawer en < 768 px).