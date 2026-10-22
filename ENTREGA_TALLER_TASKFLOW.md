# Taller Docker Compose — TASKFLOW

## Documento de solución y evidencias

| Campo | Información |
|---|---|
| Programa | Tecnólogo en Análisis y Desarrollo de Software — Código 228118 |
| Competencia | Implementar la solución de software de acuerdo con los requisitos de operación y modelos de referencia |
| Actividad de aprendizaje | Configurar los servicios requeridos del software |
| Equipo | Nicolás Cuadros — Nicolás Arias |
| Repositorio GitHub | https://github.com/cuadros11/taskflow |
| Fecha de evidencias | 13/10/2026 (entorno Docker Compose) |

---

## 1. Contextualización y solución

TASKFLOW es una aplicación web que permite registrar solicitudes de usuarios, almacenarlas de forma persistente, enviarlas a una cola de procesamiento y atenderlas de manera asíncrona mediante un Worker independiente que genera respuestas automáticas según reglas por categoría.

La solución separa frontend, backend, persistencia, caché, cola y procesamiento en **cinco servicios Docker** orquestados con Docker Compose:

```text
Vue 3 → Express (+ Socket.IO) → MongoDB / Redis (caché + cola) → Worker → MongoDB → (eventos) → Vue 3
```

Problemas del contexto que resuelve:

- **Demoras y acumulación:** el procesamiento es asíncrono; el registro nunca bloquea la atención de las demás solicitudes.
- **Pérdida de trazabilidad:** cada solicitud tiene un estado controlado (`PENDIENTE → EN COLA → PROCESANDO → RESPONDIDA` o `ERROR`) y fechas de creación y procesamiento.
- **Desconocimiento del estado:** Dashboard y Monitor muestran contadores en tiempo real vía Socket.IO, sin recargar la página.

---

## 2. Objetivos — cómo se cumple cada uno

| Objetivo | Cumplimiento |
|---|---|
| Arquitectura distribuida | 5 servicios independientes comunicados por red Docker interna |
| Interfaz Vue.js con componentes y vistas | 5 vistas y componentes reutilizables (`/components`, `/views`, `/layouts`) |
| API REST con Node.js + Express | Rutas, controladores, servicios, middlewares de validación y manejo de errores |
| Persistencia en MongoDB | Modelo `Solicitud` con estados, respuestas y fechas; volumen Docker `mongo-data` |
| Caché y cola con Redis | Caché de listado con TTL 60 s y cola `taskflow:cola` (RPUSH/BLPOP) |
| Worker independiente | Contenedor separado que consume la cola y genera respuestas |
| Flujo asíncrono | Registro → encolado → Worker → respuesta → notificación en tiempo real |
| Respuestas automáticas por reglas | 5 categorías + respuesta genérica (sin inteligencia artificial) |
| Contenerización y orquestación | `docker-compose.yml` con frontend, backend, worker, mongoserver y redisserver |
| Git y GitHub | Repositorio público con ramas, commits descriptivos y Pull Requests |
| Pruebas | Las 8 pruebas obligatorias documentadas (sección 9 de este documento) |

---

## 3. Tecnologías y responsabilidades

| Tecnología | Responsabilidad en TASKFLOW |
|---|---|
| Vue 3 + Vite | Interfaz, vistas, componentes, formularios y visualización de estados |
| Pinia / Vue Router | Estado global y navegación entre pantallas |
| Node.js + Express | API REST, validaciones, manejo de errores y servidor Socket.IO |
| MongoDB | Persistencia de solicitudes, estados, respuestas y fechas |
| Redis | Caché de consultas frecuentes y cola de solicitudes pendientes |
| Worker Node.js | Consumo de la cola, aplicación de reglas y generación de respuestas |
| Socket.IO | Notificación en tiempo real de cambios de estado y del monitor |
| Docker / Docker Compose | Contenerización y orquestación de los cinco servicios |
| Git / GitHub | Control de versiones y trabajo colaborativo |

---

## 4. Estados de las solicitudes

| Estado | Color | Descripción |
|---|---|---|
| PENDIENTE | Amarillo | Solicitud creada, aún no encolada |
| EN COLA | Azul | Almacenada en Redis, esperando al Worker |
| PROCESANDO | Morado | El Worker está atendiendo la solicitud |
| RESPONDIDA | Verde | Procesada, con respuesta generada |
| ERROR | Rojo | Falla controlada durante el procesamiento |

Ciclo demostrado en vivo: `PENDIENTE → EN COLA → PROCESANDO → RESPONDIDA` (o `PROCESANDO → ERROR`).

---

## 5. Generación de respuestas (sin IA)

El Worker identifica la categoría y aplica una regla predefinida (`worker/src/services/reglasService.js`):

| Categoría | Regla aplicada | Respuesta entregada |
|---|---|---|
| Información | Información general | Horario de atención y canales de consulta |
| Soporte | Soporte técnico | Recomendaciones técnicas y escalamiento |
| Documento | Entrega de documento | Procedimiento y requisitos del documento |
| Consulta | Estado del proceso | Estado del trámite y tiempos estimados |
| Actualización | Actualización de información | Confirmación de la actualización |
| (cualquiera) | **Respuesta genérica** | Derivación al equipo humano cuando no hay regla |

Además existe el marcador `[SIMULAR ERROR]` en título o descripción para provocar un error controlado (prueba 7).

---

## 6. Modelo de información (Solicitud)

Definido en `backend/src/models/Solicitud.js`:

| Campo | Tipo | Propósito |
|---|---|---|
| `_id` | ObjectId | Identificador único |
| `titulo` | String (máx. 120) | Asunto de la solicitud |
| `descripcion` | String (máx. 2000) | Detalle del usuario |
| `categoria` | Enum | Información, Soporte, Documento, Consulta, Actualización |
| `prioridad` | Enum | Baja, Media, Alta |
| `estado` | Enum | PENDIENTE, EN COLA, PROCESANDO, RESPONDIDA, ERROR |
| `respuesta` | String | Respuesta generada por el Worker |
| `errorMensaje` | String | Detalle del error cuando el estado es ERROR |
| `fechaCreacion` | Date | Registro (timestamps) |
| `fechaProcesamiento` | Date | Inicio del procesamiento |
| `fechaRespuesta` | Date | Finalización del procesamiento |
| `fechaActualizacion` | Date | Última modificación (timestamps) |

---

## 7. Frontend (Vue 3)

Rutas (`frontend/src/router/index.js`):

| Ruta | Vista | Pantalla |
|---|---|---|
| `/dashboard` | `DashboardView.vue` | Indicadores y acceso a nueva solicitud |
| `/solicitudes/nueva` | `NewRequestView.vue` | Formulario con categoría, título, descripción y prioridad |
| `/solicitudes` | `RequestsView.vue` | Listado con búsqueda, filtros y estado visual |
| `/solicitudes/:id` | `RequestDetailView.vue` | Detalle, respuesta y mensaje de error |
| `/monitor` | `MonitorView.vue` | Estado de servicios y contadores |

Estructura organizada según la arquitectura: `/components` (StatCard, StatusBadge, Buttons, Tables, Requests…), `/composables` (useRequests, useFetch, useRequestStatus, useSocket), `/store` (Pinia), `/services` (comunicación con Express), `/layouts` (MainLayout con menú responsive tipo drawer), `/plugins` (axios, socket), `/styles` y `/utils`.

---

## 8. Backend (API REST) — `http://localhost:3000`

| Método | Endpoint | Función |
|---|---|---|
| GET | `/api/solicitudes` | Listado con caché Redis (`X-Cache: HIT` / `MISS`) |
| GET | `/api/solicitudes/:id` | Detalle incluyendo respuesta o error |
| POST | `/api/solicitudes` | Valida, guarda en MongoDB y encola en Redis |
| PUT | `/api/solicitudes/:id` | Actualiza (bloqueada en PROCESANDO/RESPONDIDA) |
| DELETE | `/api/solicitudes/:id` | Elimina (bloqueada en PROCESANDO/RESPONDIDA) |
| GET | `/api/monitor` | Estado de servicios y contadores |
| GET | `/api/health` | Health check |

Organización: `routes → controllers → services → models`, con middlewares de validación (`validarSolicitud`), manejo de errores centralizado (`errorHandler`, `AppError`) y `asyncHandler`.

**Caché:** `GET /api/solicitudes` consulta primero Redis (TTL 60 s). MISS → MongoDB → guarda en Redis; HIT → responde desde Redis. El caché se invalida al crear, actualizar, eliminar y cuando el Worker responde o falla.

**Tiempo real:** el Worker publica eventos en el canal Redis `taskflow:eventos`; el backend los reenvía por Socket.IO (`solicitud-creada`, `solicitud-encolada`, `solicitud-procesando`, `solicitud-respondida`, `solicitud-error`, `monitor-actualizado`).

---

## 9. Worker (procesamiento asíncrono)

`worker/src/services/workerService.js` — ciclo: heartbeat en Redis → `BLPOP taskflow:cola` → consultar solicitud en MongoDB → estado `PROCESANDO` → aplicar regla de la categoría → guardar respuesta → estado `RESPONDIDA` → invalidar caché → publicar evento. Ante cualquier falla: estado `ERROR` con `errorMensaje` y el resto de la cola continúa procesándose.

El heartbeat (`taskflow:worker:heartbeat`, TTL 15 s) permite al Monitor detectar si el Worker está activo o detenido.

---

## 10. Docker Compose

Cinco servicios (`docker-compose.yml`):

| Servicio | Imagen/Dockerfile | Puerto host | Función |
|---|---|---|---|
| frontend | `./frontend` (nginx + build Vite) | 8081 → 80 | Interfaz Vue 3 |
| backend | `./backend` | 3000 → 3000 | API + Socket.IO |
| worker | `./worker` | — | Consumo de la cola |
| mongoserver | `mongo:7` | 27017 | Persistencia (volumen `mongo-data`) |
| redisserver | `redis:7-alpine` | 6379 | Caché + cola |

- Comunicación interna por **nombres de servicio** (`mongoserver:27017`, `redisserver:6379`), nunca `localhost`.
- Healthchecks en MongoDB y Redis; backend y worker esperan servicios sanos.
- MongoDB con volumen named `mongo-data` para persistencia entre reinicios.

**Evidencia de configuración — servicios en ejecución:**

```text
SERVICE       STATUS                   PORTS
backend       Up (healthy)             0.0.0.0:3000->3000/tcp
frontend      Up                       0.0.0.0:8081->80/tcp
mongoserver   Up (healthy)             0.0.0.0:27017->27017/tcp
redisserver   Up (healthy)             0.0.0.0:6379->6379/tcp
worker        Up
```

> ⬜ **Captura 00 — Docker configuración:** pantallazo de `docker compose ps` en terminal y, si se desea, del archivo `docker-compose.yml` abierto en el editor. Guardar como `evidencias/00-docker-servicios.png`.

---

## 11. Pruebas obligatorias (ejecutadas el 13/10/2026)

### Prueba 1 — Registro

**Criterio:** registrar desde Vue y comprobar el almacenamiento en MongoDB.

**Procedimiento:** formulario `Nueva solicitud` → título, descripción, categoría `Documento`, prioridad `Alta` → botón *Enviar solicitud* (o vía API):

```bash
curl -s -X POST http://localhost:3000/api/solicitudes \
  -H "Content-Type: application/json" \
  -d '{"titulo":"Solicitud de certificado de estudios - entrega taller",
       "descripcion":"Necesito solicitar el certificado de estudios del tecnologo.",
       "categoria":"Documento","prioridad":"Alta"}'
```

**Resultado real:**

```json
{"_id":"6aceceb243d8db9b0fe1eb69","titulo":"Solicitud de certificado de estudios - entrega taller",
 "estado":"EN COLA","respuesta":null,"fechaCreacion":"2026-10-14T00:37:06.441Z"}
```

HTTP 201, estado inicial `EN COLA` y documento persistido en MongoDB (total de documentos: 30 tras las pruebas).

> ⬜ **Captura 01 — Registro:** formulario con los datos diligenciados y mensaje de confirmación. Guardar como `evidencias/01-registro.png`.

### Prueba 2 — Respuesta

**Criterio:** procesar una solicitud y comprobar que aparece una respuesta.

**Resultado real** (`GET /api/solicitudes/6aceceb243d8db9b0fe1eb69` tras ~1 s):

```json
{"estado":"RESPONDIDA",
 "respuesta":"[Entrega de documento]\n\nHola, su solicitud \"Solicitud de certificado de estudios - entrega taller\" fue atendida.\n\nEl documento solicitado ha sido generado y está disponible para descarga...",
 "fechaProcesamiento":"2026-10-14T00:37:06.465Z","fechaRespuesta":"2026-10-14T00:37:06.477Z"}
```

> ⬜ **Captura 02 — Respuesta:** pantalla de detalle mostrando la respuesta generada. Guardar como `evidencias/02-respuesta.png`.

### Prueba 3 — Cola

**Criterio:** detener el Worker, registrar cinco solicitudes y comprobar que permanecen en cola.

```bash
docker compose stop worker
node scripts/crear-solicitudes.mjs 5
docker compose exec redisserver redis-cli LLEN taskflow:cola
```

**Resultado real:**

```text
[1/5] ... -> EN COLA (Información)
[2/5] ... -> EN COLA (Soporte)
[3/5] ... -> EN COLA (Documento)
[4/5] ... -> EN COLA (Consulta)
[5/5] ... -> EN COLA (Actualización)

LLEN taskflow:cola -> 5
monitor: {"servicios":{"worker":false},"contadores":{"enCola":5,"respondida":22,"error":1}}
```

Con el Worker detenido, el heartbeat expira en ≤15 s y el Monitor lo reporta como no disponible (`worker: false`), mientras las 5 solicitudes permanecen `EN COLA`.

> ⬜ **Captura 03 — Cola:** Monitor con `worker: no disponible` y `enCola: 5` (o listado mostrando 5 solicitudes EN COLA). Guardar como `evidencias/03-cola.png`.

### Prueba 4 — Recuperación

**Criterio:** iniciar nuevamente el Worker y comprobar que procesa las pendientes.

```bash
docker compose start worker
```

**Resultado real:**

```text
LLEN taskflow:cola -> 0
monitor: {"servicios":{"worker":true},"contadores":{"enCola":0,"respondida":27,"error":1}}
```

Las 5 solicitudes encoladas pasaron a `RESPONDIDA` (22 → 27) automáticamente al recuperar el Worker.

> ⬜ **Captura 04 — Recuperación:** mismas solicitudes mostradas como RESPONDIDA tras `docker compose start worker`. Guardar como `evidencias/04-recuperacion.png`.

### Prueba 5 — Caché

**Criterio:** demostrar una consulta `CACHE MISS` y una posterior `CACHE HIT`.

```bash
curl -s -D - -o /dev/null http://localhost:3000/api/solicitudes   # 1a vez
curl -s -D - -o /dev/null http://localhost:3000/api/solicitudes   # 2a vez
```

**Resultado real:**

```text
1a consulta: HTTP/1.1 200 OK  /  X-Cache: MISS   (MongoDB → Redis, TTL 60 s)
2a consulta: HTTP/1.1 200 OK  /  X-Cache: HIT    (respuesta desde Redis)
```

> ⬜ **Captura 05 — Caché:** respuestas `MISS` y `HIT` visibles (DevTools del navegador o terminal). Guardar como `evidencias/05-cache.png`.

### Prueba 6 — Persistencia

**Criterio:** reiniciar servicios y comprobar que la información persiste en MongoDB.

```bash
docker compose restart mongoserver
docker compose exec mongoserver mongosh taskflow --eval "db.solicituds.countDocuments()"
```

**Resultado real:** tras el reinicio, `total=30` documentos y el Monitor sigue reportando los mismos contadores (27 respondidas, 2 errores). Los datos viven en el volumen `mongo-data`, no en el contenedor.

> ⬜ **Captura 06 — Persistencia:** listado de solicitudes visible después del reinicio. Guardar como `evidencias/06-persistencia.png`.

### Prueba 7 — Error

**Criterio:** provocar un error controlado y comprobar el estado `ERROR`.

```bash
# título o descripción con el marcador [SIMULAR ERROR]
```

**Resultado real** (`GET /api/solicitudes/6acecf6d43d8db9b0fe1eb99`):

```json
{"estado":"ERROR","respuesta":null,
 "errorMensaje":"Error controlado: se simuló una falla durante el procesamiento (marque una solicitud con [SIMULAR ERROR])."}
```

El resto de solicitudes continuó procesándose normalmente (la cola no se bloqueó).

> ⬜ **Captura 07 — Error:** detalle de la solicitud en estado ERROR con su mensaje. Guardar como `evidencias/07-error.png`.

### Prueba 8 — Responsive

**Criterio:** comprobar la interfaz en diferentes tamaños de pantalla.

**Procedimiento:** abrir `http://localhost:8081` y usar el modo dispositivo del navegador (móvil ~375 px, tablet ~768 px, escritorio). Dashboard, formulario, listado, detalle y monitor se adaptan sin desbordes horizontales; en pantallas pequeñas el menú se convierte en drawer.

> ⬜ **Captura 08 — Responsive:** misma vista en tamaño móvil y escritorio. Guardar como `evidencias/08-responsive-movil.png` y `evidencias/08-responsive-desktop.png`.

---

## 12. Reto de integración final (guía de la demostración en vivo)

1. Abrir `http://localhost:8081` → Dashboard con contadores.
2. Registrar una solicitud desde `Nueva solicitud`.
3. Verificar en el listado que pasa a `EN COLA` (y en Monitor `enCola` en 1).
4. Detener el Worker: `docker compose stop worker`.
5. Registrar varias solicitudes y comprobar en Monitor que permanecen `EN COLA` y `worker: no disponible`.
6. Iniciar el Worker: `docker compose start worker` — observar en pantalla el cambio `EN COLA → PROCESANDO → RESPONDIDA` **sin recargar** (eventos Socket.IO).
7. Abrir el detalle y mostrar la respuesta generada.
8. Demostrar caché: dos consultas seguidas mostrando `X-Cache: MISS` y `X-Cache: HIT`.
9. Reiniciar servicios: `docker compose restart` y verificar que las solicitudes siguen en el listado (volumen `mongo-data`).
10. Mostrar el repositorio GitHub: Issues, ramas, commits y Pull Requests.

---

## 13. Evidencias de aprendizaje

| Evidencia | Ubicación |
|---|---|
| Código fuente frontend Vue | `frontend/src/` |
| Código fuente backend Express | `backend/src/` |
| Worker | `worker/src/` |
| Configuración Docker | `docker-compose.yml`, `frontend/Dockerfile`, `backend/Dockerfile`, `worker/Dockerfile`, `frontend/nginx/default.conf` |
| Persistencia MongoDB | Modelo `Solicitud` + volumen `mongo-data` |
| Redis caché y cola | `backend/src/services/redisService.js`, canal y cola en `utils/constantes.js` |
| Pruebas documentadas | `PRUEBAS.md` y sección 11 de este documento |
| Arquitectura | `ARQUITECTURA_TASKFLOW.md` |
| README | `README.md` |
| Repositorio GitHub | https://github.com/cuadros11/taskflow |

### Checklist de capturas pendientes

Colocar las imágenes en la carpeta `evidencias/` con los nombres indicados en cada sección (00 a 08). Cada captura debe mostrar la fecha y la URL `localhost:8081` o la terminal de Docker visible.

---

## 14. Referencias del proyecto

- Repositorio: https://github.com/cuadros11/taskflow
- Documento de arquitectura: `ARQUITECTURA_TASKFLOW.md`
- Pruebas: `PRUEBAS.md`
- README con instrucciones de ejecución: `README.md`
