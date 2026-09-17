# TASKFLOW

Sistema **Full Stack** para la gestión y procesamiento de solicitudes. El proyecto separa responsabilidades entre **Vue 3** (frontend), **Node.js + Express + Socket.IO** (backend/API), **MongoDB** (persistencia), **Redis** (caché y cola) y un **Worker Node.js** (procesamiento asíncrono de la cola).

```
Vue 3 → Express → MongoDB / Redis → Worker → MongoDB → (Socket.IO) → Vue 3
```

## Miembros del equipo

- **Nicolás Cuadros**
- **Nicolás Arias**

## Arquitectura

```text
┌───────────────┐
│   FRONTEND    │  Vue 3 + Vite + Pinia + Vue Router + Socket.IO client
└──────┬────────┘
       │  HTTP/REST + WebSocket
       ▼
┌───────────────┐
│    BACKEND    │  Node.js + Express + Socket.IO
└───┬───────┬───┘
    │       │
    ▼       ▼
 MongoDB   Redis (caché + cola)
    │          │
    │          ▼
    │   ┌───────────────┐
    └──▶│    WORKER     │  consume la cola, genera respuestas
        └───────┬───────┘
                │
                ▼
            MongoDB
                │
                ▼ (eventos publicados por Redis → Socket.IO → Vue)
```

## Servicios (Docker Compose)

| Servicio | Imagen/Dockerfile | Puerto host | Responsabilidad |
|---|---|---|---|
| `frontend` | `./frontend` (nginx) | **8081** | Interfaz web Vue 3 |
| `backend` | `./backend` | **3000** | API REST + Socket.IO |
| `worker` | `./worker` | — | Procesa solicitudes de la cola Redis |
| `mongoserver` | `mongo:7` | 27017 | Persistencia (volumen `mongo-data`) |
| `redisserver` | `redis:7-alpine` | 6379 | Caché + cola `taskflow:cola` |

Los contenedores se comunican mediante los nombres de servicio (`mongoserver`, `redisserver`), nunca con `localhost`.

## Cómo ejecutar

### Opción 1 — Docker Compose (recomendada)

```bash
docker compose up --build -d
```

- Frontend: http://localhost:8081
- Backend (API): http://localhost:3000/api/health
- Monitor: http://localhost:8081/monitor

Detener:

```bash
docker compose down
```

Los datos de MongoDB persisten en el volumen `mongo-data`. Se conservan aunque los contenedores se detengan o se recreeen (`docker compose down` no elimina el volumen; use `docker compose down -v` SOLO si quiere borrarlos).

### Opción 2 — Desarrollo local

Requisitos: Node.js ≥ 18, MongoDB y Redis corriendo localmente.

1. Backend

```bash
cd backend
npm install
cp .env.example .env     # ajuste MONGODB_URI / REDIS_URL si es necesario
npm run dev              # http://localhost:3000
```

2. Worker (en otra terminal)

```bash
cd worker
npm install
cp .env.example .env
npm start
```

3. Frontend (en otra terminal)

```bash
cd frontend
npm install
cp .env.example .env     # VITE_API_URL=http://localhost:3000
npm run dev              # http://localhost:5173 → proxy de /api y /socket.io al backend
```

## API REST

| Método | Endpoint | Función |
|---|---|---|
| GET | `/api/solicitudes` | Consultar solicitudes (usa caché Redis: `X-Cache: HIT`/`MISS`) |
| GET | `/api/solicitudes/:id` | Consultar una solicitud |
| POST | `/api/solicitudes` | Registrar solicitud (guardar en MongoDB + encolar en Redis) |
| PUT | `/api/solicitudes/:id` | Actualizar solicitud |
| DELETE | `/api/solicitudes/:id` | Eliminar solicitud |
| GET | `/api/monitor` | Estado de servicios y contadores |

## Estados de una solicitud

`PENDIENTE → EN COLA → PROCESANDO → RESPONDIDA`

Ante un error de procesamiento: `PROCESANDO → ERROR`.

## Respuestas automáticas (reglas)

El Worker identifica la categoría de la solicitud y aplica una regla predefinida:

| Categoría | Regla |
|---|---|
| Información | Entrega de información general |
| Soporte | Recomendaciones técnicas |
| Documento | Preparación de documento |
| Consulta | Informe de estado de proceso |
| Actualización | Confirmación de cambios |

Existe una **respuesta genérica** cuando la categoría no coincide con una regla.

## Simulación de errores (estado ERROR)

Para **probar el estado ERROR** de forma controlada (HU-11 y prueba obligatoria de errores), registre una solicitud cuyo **título o descripción** contenga el marcador:

```text
[SIMULAR ERROR]
```

El Worker detecta el marcador, lanza un error controlado y la solicitud queda en estado **ERROR** con un `errorMensaje` descriptivo, sin detener el procesamiento de las demás solicitudes.

## Pruebas obligatorias

| # | Prueba | Criterio | Cómo reproducirla |
|---|---|---|---|
| 1 | **Registro** | Registrar desde Vue y comprobar el almacenamiento en MongoDB | Formulario `Nueva solicitud` → botón `Enviar solicitud`. |
| 2 | **Respuesta** | Procesar una solicitud y comprobar que aparece una respuesta | Al crear una solicitud, el Worker la procesa y genera la respuesta (detalle de la solicitud). |
| 3 | **Cola** | Detener Worker, registrar solicitudes y comprobar que permanecen en cola | `docker compose stop worker`, crear solicitudes y ver estado **EN COLA** + `redis-cli LLEN taskflow:cola`. |
| 4 | **Recuperación** | Iniciar nuevamente el Worker y comprobar que procesa las pendientes | `docker compose start worker` y observar el cambio a **PROCESANDO → RESPONDIDA**. |
| 5 | **Caché** | Demostrar CACHE MISS y posterior CACHE HIT | `curl -s -D - http://localhost:3000/api/solicitudes` vía frontend nginx. La primera respuesta tras un cambio es `X-Cache: MISS`; las siguientes `X-Cache: HIT`. |
| 6 | **Persistencia** | Reiniciar servicios y comprobar que la información persiste | `docker compose restart` y consultar nuevamente; los datos viven en el volumen `mongo-data`. |
| 7 | **Error** | Simular un error controlado y comprobar el estado ERROR | Crear una solicitud con `[SIMULAR ERROR]` en el título o la descripción. |
| 8 | **Responsive** | Comprobar la interfaz en diferentes tamaños | Abrir http://localhost:8081 y redimensionar o usar el modo dispositivo del navegador. |

## Scripts de demostración

`scripts/crear-solicitudes.mjs` registra N solicitudes contra la API sin usar el navegador. Útil para la prueba de cola y recuperación:

```bash
docker compose stop worker
node scripts/crear-solicitudes.mjs 5            # 5 solicitudes quedan EN COLA
docker compose start worker                     # el Worker las procesa
node scripts/crear-solicitudes.mjs 1 --error    # demo del estado ERROR
```

## Eventos Socket.IO

| Evento | Emisor | Propósito |
|---|---|---|
| `solicitud-creada` | Express | Solicitud creada |
| `solicitud-encolada` | Express | Entró a la cola Redis |
| `solicitud-procesando` | Worker→Backend | Inicio de procesamiento |
| `solicitud-respondida` | Worker→Backend | Respuesta generada |
| `solicitud-error` | Worker→Backend | Error de procesamiento |
| `monitor-actualizado` | Backend | Actualiza contadores del monitor |

El Worker publica eventos en Redis; el backend los reenvía al navegador por Socket.IO, por lo que Dashboard y Monitor se actualizan **sin recargar la página**.

## Caché

El listado de solicitudes se consulta primero en Redis. Si existe → `CACHE HIT`; si no → `CACHE MISS` (consulta a MongoDB y almacena en Redis con TTL de 60 s).

## Estructura del proyecto

```text
taskflow/
├── backend/            Express + Socket.IO + MongoDB + Redis
│   └── src/{config,controllers,middlewares,models,routes,services,utils}
├── worker/             Procesador de la cola
│   └── src/{config,models,services,utils}
├── frontend/           Vue 3 (Vite, Pinia, Vue Router)
│   └── src/{assets,components,composables,layouts,plugins,router,services,store,styles,utils,views}
│   └── nginx/          Configuración del servidor web
├── docker-compose.yml
└── ARQUITECTURA_TASKFLOW.md   Documento de arquitectura
```

## Reglas de arquitectura

1. Vue **no** se conecta directamente a MongoDB ni a Redis.
2. Express actúa como API y medio entre Vue y los servicios internos.
3. MongoDB garantiza la persistencia (volumen Docker).
4. Redis se usa para caché y cola.
5. El Worker es un proceso independiente que consume la cola.
6. Los contenedores se comunican por nombres de servicio.
7. Socket.IO complementa REST para notificaciones en tiempo real.
