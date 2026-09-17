# TASKFLOW — Arquitectura del proyecto

## 1. Descripción general

**TASKFLOW** es un sistema Full Stack para la gestión y procesamiento de solicitudes.

El proyecto integra:

- **Vue 3** para el frontend.
- **Node.js + Express.js** para el backend y la API REST.
- **MongoDB** para la persistencia de la información.
- **Redis** para caché y manejo de una cola de solicitudes.
- **Worker Node.js** para el procesamiento asíncrono.
- **Docker** para contenerizar los servicios.
- **Docker Compose** para ejecutar y conectar todos los servicios.
- **Git y GitHub** para control de versiones y trabajo colaborativo.

El objetivo es separar las responsabilidades de cada componente y permitir que las solicitudes sean recibidas, almacenadas, enviadas a una cola y procesadas de manera independiente.

---

# 2. Arquitectura general

La arquitectura de TASKFLOW está basada en una separación por capas y servicios.

```text
                         ┌─────────────────────────┐
                         │         USUARIO         │
                         │       Navegador Web     │
                         └────────────┬────────────┘
                                      │
                                      ▼
                         ┌─────────────────────────┐
                         │       FRONTEND          │
                         │          Vue 3          │
                         │                         │
                         │ Views / Components      │
                         │ Router / Store          │
                         │ Services / Composables  │
                         └────────────┬────────────┘
                                      │
                                HTTP / REST
                                      │
                                      ▼
                         ┌─────────────────────────┐
                         │        BACKEND          │
                         │     Node.js + Express   │
                         │                         │
                         │ Routes / Controllers    │
                         │ Services / Validación   │
                         └───────┬─────────┬───────┘
                                 │         │
                    ┌────────────┘         └────────────┐
                    ▼                                   ▼
          ┌──────────────────┐                 ┌──────────────────┐
          │     MongoDB      │                 │      Redis       │
          │                  │                 │                  │
          │ Persistencia     │                 │ Caché            │
          │ Solicitudes      │                 │ Cola             │
          │ Respuestas       │                 │                  │
          └──────────────────┘                 └────────┬─────────┘
                                                        │
                                                        ▼
                                              ┌──────────────────┐
                                              │      WORKER      │
                                              │    Node.js       │
                                              │                  │
                                              │ Procesamiento    │
                                              │ de solicitudes   │
                                              └────────┬─────────┘
                                                       │
                                                       ▼
                                                  MongoDB
```

### Regla principal

El frontend **no se conecta directamente a MongoDB ni a Redis**.

La comunicación debe realizarse así:

```text
Vue → Express → MongoDB / Redis
```

El Worker se comunica directamente con MongoDB y Redis porque forma parte de la infraestructura interna del sistema.

---

# 3. Arquitectura del frontend Vue 3

La estructura base del frontend propuesta para el proyecto es:

```text
/src
├── assets
├── components
├── views
├── composables
├── store
├── router
├── services
├── layouts
├── styles
├── plugins
├── utils
├── App.vue
└── main.js
```

Esta organización permite separar recursos, componentes reutilizables, vistas, lógica reutilizable, estado, rutas, comunicación con la API, layouts, estilos, plugins y utilidades.

---

## 3.1 `/assets`

Contiene recursos estáticos de la aplicación:

- imágenes
- iconos
- fuentes
- recursos visuales

También puede contener recursos relacionados con estilos globales cuando sea necesario.

---

## 3.2 `/components`

Contiene componentes reutilizables.

Ejemplos para TASKFLOW:

```text
/components
├── Buttons
├── Tables
├── Headers
├── Requests
├── Status
├── StatCard
├── RequestCard
└── RequestForm
```

Algunos componentes posibles:

- botones
- tablas
- encabezados
- tarjetas
- indicadores de estado
- formularios
- filtros
- tarjetas de estadísticas
- paneles de respuesta

La idea es evitar repetir código visual en diferentes pantallas.

---

## 3.3 `/views`

Contiene las pantallas principales de la aplicación.

Propuesta:

```text
/views
├── DashboardView.vue
├── NewRequestView.vue
├── RequestsView.vue
├── RequestDetailView.vue
└── MonitorView.vue
```

Cada View representa una pantalla o página asociada a una ruta.

---

## 3.4 `/composables`

Contiene lógica reutilizable mediante Composition API.

Ejemplos:

```text
/composables
├── useRequests.js
├── useFetch.js
└── useRequestStatus.js
```

Puede utilizarse para:

- consultar solicitudes
- manejar estados
- reutilizar lógica de formularios
- controlar peticiones
- manejar filtros

---

## 3.5 `/store`

Contiene el estado global de la aplicación.

Puede utilizarse Pinia u otra solución definida por el equipo.

Ejemplo:

```text
/store
└── requestStore.js
```

Puede almacenar:

- solicitud seleccionada
- filtros
- información del Dashboard
- estados compartidos
- información necesaria entre diferentes Views

---

## 3.6 `/router`

Contiene la configuración de Vue Router.

Ejemplo:

```text
/router
└── index.js
```

Rutas propuestas:

```text
/
├── dashboard
├── solicitudes
├── solicitudes/nueva
├── solicitudes/:id
└── monitor
```

---

## 3.7 `/services`

Contiene la comunicación con el backend.

Ejemplo:

```text
/services
└── requestService.js
```

El servicio puede centralizar operaciones como:

```text
GET     /solicitudes
GET     /solicitudes/:id
POST    /solicitudes
PUT     /solicitudes/:id
DELETE  /solicitudes/:id
```

El frontend utilizará Axios u otra herramienta definida por el proyecto para consumir Express.

---

## 3.8 `/layouts`

Contiene las plantillas generales de la aplicación.

Ejemplo:

```text
/layouts
└── MainLayout.vue
```

Puede incluir:

- menú
- encabezado
- navegación
- área principal
- pie de página

---

## 3.9 `/styles`

Contiene los estilos globales.

Ejemplo:

```text
/styles
├── variables.scss
└── main.scss
```

Aquí se pueden definir:

- tipografías
- tamaños
- variables visuales
- estilos generales
- estilos responsive

---

## 3.10 `/plugins`

Contiene configuraciones globales.

Ejemplo:

```text
/plugins
├── axios.js
└── quasar.js
```

Axios puede utilizarse para configurar la comunicación con la API.

La URL base deberá adaptarse al entorno donde se ejecute TASKFLOW.

---

## 3.11 `/utils`

Contiene funciones auxiliares.

Ejemplo:

```text
/utils
├── formatDate.js
└── validateRequest.js
```

Puede contener funciones para:

- validar información
- formatear fechas
- transformar datos
- validar formularios

---

# 4. Arquitectura del backend

El backend utiliza:

```text
Node.js
    +
Express.js
```

Su función es actuar como intermediario entre Vue y los servicios internos.

Una organización posible es:

```text
/backend
├── routes
├── controllers
├── services
├── models
├── middlewares
├── config
└── app.js
```

## Responsabilidades

### Routes

Define las rutas de la API.

### Controllers

Recibe las peticiones y coordina las operaciones.

### Services

Contiene la lógica de negocio.

### Models

Representa la información almacenada en MongoDB.

### Middlewares

Permite implementar validaciones, manejo de errores u otras funciones transversales.

---

# 5. API REST

La API permitirá que Vue interactúe con TASKFLOW.

| Método | Endpoint | Función |
|---|---|---|
| GET | `/solicitudes` | Consultar solicitudes |
| GET | `/solicitudes/:id` | Consultar una solicitud |
| POST | `/solicitudes` | Registrar solicitud |
| PUT | `/solicitudes/:id` | Actualizar solicitud |
| DELETE | `/solicitudes/:id` | Eliminar solicitud |

El frontend solamente consume estos servicios.

---

# 6. Arquitectura de Docker

TASKFLOW se ejecutará mediante diferentes contenedores.

La propuesta contempla cinco servicios principales:

```text
┌─────────────────────────────────────────────────┐
│                 Docker Compose                  │
│                                                 │
│  ┌───────────┐   ┌───────────┐                 │
│  │ Frontend  │   │  Backend  │                 │
│  │   Vue 3   │──▶│ Node +    │                 │
│  │           │   │ Express   │                 │
│  └───────────┘   └─────┬─────┘                 │
│                        │                        │
│             ┌──────────┴──────────┐             │
│             ▼                     ▼             │
│      ┌─────────────┐       ┌─────────────┐      │
│      │  MongoDB    │       │    Redis    │      │
│      │             │       │ Cache/Queue │      │
│      └─────────────┘       └──────┬──────┘      │
│                                   │             │
│                                   ▼             │
│                            ┌─────────────┐      │
│                            │   Worker    │      │
│                            │   Node.js   │      │
│                            └─────────────┘      │
└─────────────────────────────────────────────────┘
```

---

# 7. Servicios de Docker

## 7.1 Frontend

Contiene la aplicación Vue 3.

Responsabilidades:

- mostrar la interfaz
- capturar información
- enviar solicitudes a Express
- consultar información
- mostrar estados y respuestas

---

## 7.2 Backend

Contiene Node.js + Express.

Responsabilidades:

- recibir peticiones HTTP
- validar datos
- consultar MongoDB
- utilizar Redis
- enviar solicitudes a la cola
- responder al frontend

---

## 7.3 MongoDB

Es la base de datos principal.

Almacena:

- solicitudes
- estados
- respuestas
- fechas
- errores
- información relacionada con el procesamiento

Se recomienda utilizar un volumen Docker para conservar los datos cuando el contenedor sea detenido o recreado.

---

## 7.4 Redis

Redis tendrá dos responsabilidades.

### Caché

Permite almacenar temporalmente información consultada frecuentemente.

Flujo:

```text
Vue
 ↓
Express
 ↓
¿Existe información en Redis?
 ↓
 ├── Sí → CACHE HIT → devolver información
 │
 └── No → CACHE MISS
          ↓
       MongoDB
          ↓
       Redis
          ↓
       devolver información
```

### Cola

Redis también almacenará temporalmente las solicitudes pendientes de procesamiento.

```text
Nueva solicitud
      ↓
   MongoDB
      ↓
  Redis Queue
      ↓
    Worker
```

---

# 8. Worker

El Worker es un proceso independiente.

No atiende directamente las peticiones del usuario.

Su función es procesar las solicitudes que llegan a la cola.

Flujo:

```text
1. Esperar solicitud en Redis
2. Obtener ID de solicitud
3. Consultar solicitud en MongoDB
4. Cambiar estado a PROCESANDO
5. Identificar categoría
6. Aplicar regla de respuesta
7. Generar respuesta
8. Guardar respuesta en MongoDB
9. Cambiar estado a RESPONDIDA
10. Actualizar o invalidar caché
```

Si ocurre un error:

```text
Solicitud
   ↓
Worker
   ↓
Error
   ↓
MongoDB
   ↓
Estado = ERROR
```

---

# 9. Docker Compose

Docker Compose permitirá definir y ejecutar todos los servicios del proyecto desde un único archivo.

Conceptualmente:

```text
docker-compose.yml

services:
    frontend
    backend
    worker
    mongoserver
    redisserver
```

Cada servicio tendrá su propia responsabilidad.

```text
frontend
   ↓
backend
   ↓
┌───────────────┐
│               │
▼               ▼
MongoDB       Redis
                 ↓
               Worker
```

---

# 10. Comunicación entre contenedores

Los contenedores se comunican utilizando los nombres de los servicios definidos en Docker Compose.

Ejemplo conceptual:

```text
Backend → mongoserver
Backend → redisserver
Worker  → mongoserver
Worker  → redisserver
```

No se debe utilizar `localhost` para que un contenedor acceda a otro contenedor.

Dentro de Docker:

```text
MongoDB → mongoserver:27017
Redis    → redisserver:6379
```

El puerto publicado al equipo anfitrión es diferente del puerto interno del contenedor.

---

# 11. Persistencia de MongoDB

MongoDB debe utilizar un volumen:

```text
mongo-data
```

Conceptualmente:

```text
MongoDB Container
       │
       ▼
   /data/db
       │
       ▼
 Docker Volume
       │
       ▼
   mongo-data
```

Esto permite conservar la información aunque el contenedor sea detenido o recreado.

---

# 12. Flujo completo de datos

## 12.1 Registro de una solicitud

```text
Usuario
  ↓
Vue
  ↓
Formulario
  ↓
requestService
  ↓
Express
  ↓
Validación
  ↓
MongoDB
  ↓
Solicitud guardada
  ↓
Redis Queue
  ↓
Respuesta a Vue
  ↓
Estado: EN COLA
```

---

## 12.2 Procesamiento

```text
Redis Queue
     ↓
   Worker
     ↓
MongoDB
     ↓
PROCESANDO
     ↓
Identificar categoría
     ↓
Aplicar regla
     ↓
Generar respuesta
     ↓
MongoDB
     ↓
RESPONDIDA
```

---

## 12.3 Consulta de una solicitud

```text
Usuario
   ↓
Vue
   ↓
Express
   ↓
Redis
   │
   ├── CACHE HIT
   │       ↓
   │    Respuesta
   │
   └── CACHE MISS
           ↓
        MongoDB
           ↓
         Redis
           ↓
       Respuesta
```

---

# 13. Estados de una solicitud

Una solicitud podrá manejar estados como:

```text
PENDIENTE
    ↓
EN COLA
    ↓
PROCESANDO
    ↓
RESPONDIDA
```

En caso de error:

```text
PROCESANDO
    ↓
ERROR
```

Los estados permiten visualizar el ciclo de vida de cada solicitud.

---

# 14. Generación de respuestas

Para el taller no es necesario utilizar inteligencia artificial.

La respuesta puede generarse mediante reglas predefinidas.

Ejemplo:

```text
Categoría
   ↓
Buscar regla
   ↓
Generar respuesta
   ↓
Guardar respuesta
```

Categorías sugeridas:

| Categoría | Ejemplo |
|---|---|
| Información | Solicitud de información general |
| Soporte | Problema de acceso o funcionamiento |
| Documento | Solicitud de certificado o documento |
| Consulta | Consulta sobre el estado de un proceso |
| Actualización | Solicitud de modificación de información |

También debe existir una respuesta genérica para solicitudes que no coincidan con una regla.

---

# 15. Pantallas del sistema

TASKFLOW tendrá como mínimo las siguientes pantallas.

---

## 15.1 Dashboard

### Objetivo

Mostrar una visión general del estado del sistema.

### Elementos

- encabezado
- menú lateral
- tarjetas de indicadores
- total de solicitudes
- solicitudes pendientes
- solicitudes en cola
- solicitudes procesando
- solicitudes respondidas
- solicitudes con error
- botón "Nueva solicitud"
- resumen de solicitudes recientes

### Distribución conceptual

```text
┌─────────────────────────────────────────────┐
│ TASKFLOW                         Usuario    │
├─────────────┬───────────────────────────────┤
│ Dashboard   │  Total   Pendientes   Cola    │
│ Solicitudes │  ─────   ──────────   ────    │
│ Nueva       │                               │
│ Monitor     │  Procesando  Respondidas      │
│             │  ─────────   ───────────      │
│             │                               │
│             │ Solicitudes recientes         │
│             │ ─────────────────────────     │
└─────────────┴───────────────────────────────┘
```

---

# 15.2 Nueva solicitud

### Objetivo

Permitir registrar una solicitud.

### Campos

- categoría
- título
- descripción
- prioridad
- botón cancelar
- botón enviar

### Flujo

```text
Formulario
    ↓
Validar
    ↓
Enviar
    ↓
Express
    ↓
MongoDB
    ↓
Redis Queue
```

---

# 15.3 Listado de solicitudes

### Objetivo

Mostrar las solicitudes registradas.

### Elementos

- buscador
- filtros
- tabla o tarjetas
- ID
- título
- categoría
- prioridad
- estado
- fecha
- acción "Ver detalle"

Ejemplo:

```text
┌──────┬──────────────┬─────────┬────────────┬─────────────┐
│ ID   │ Solicitud    │ Categor.│ Prioridad  │ Estado      │
├──────┼──────────────┼─────────┼────────────┼─────────────┤
│ 001  │ Certificado  │ Doc.    │ Alta       │ RESPONDIDA  │
│ 002  │ Acceso       │ Soporte │ Media      │ EN COLA     │
│ 003  │ Información  │ Info.   │ Baja       │ PROCESANDO  │
└──────┴──────────────┴─────────┴────────────┴─────────────┘
```

---

# 15.4 Detalle de solicitud

### Objetivo

Mostrar toda la información de una solicitud.

### Información

- ID
- título
- descripción
- categoría
- prioridad
- estado
- fecha de creación
- fecha de procesamiento
- respuesta
- mensaje de error, si existe

Cuando esté respondida:

```text
┌──────────────────────────────────────┐
│ Solicitud #001                       │
├──────────────────────────────────────┤
│ Título: Solicitud de certificado     │
│ Categoría: Documento                 │
│ Prioridad: Alta                      │
│ Estado: RESPONDIDA                   │
│                                      │
│ RESPUESTA                            │
│ ------------------------------------ │
│ Texto de la respuesta generada       │
└──────────────────────────────────────┘
```

---

# 15.5 Monitor de procesamiento

### Objetivo

Mostrar el funcionamiento de los servicios.

Puede incluir:

- estado de MongoDB
- estado de Redis
- estado de Express
- estado del Worker
- solicitudes en cola
- solicitudes procesando
- solicitudes respondidas
- errores

Ejemplo:

```text
┌────────────────────────────────────────────┐
│ MONITOR TASKFLOW                           │
├────────────────────────────────────────────┤
│ Express       ✓ Disponible                 │
│ MongoDB       ✓ Disponible                 │
│ Redis         ✓ Disponible                 │
│ Worker        ✓ Disponible                 │
├────────────────────────────────────────────┤
│ En cola:        5                           │
│ Procesando:     2                           │
│ Respondidas:   25                           │
│ Errores:        1                           │
└────────────────────────────────────────────┘
```

---

# 16. Diseño responsive

Las pantallas deberán adaptarse como mínimo a:

```text
┌──────────────────┐
│     MÓVIL        │
│                  │
│ menú             │
│ contenido        │
│ tarjetas         │
│ formularios      │
└──────────────────┘

        ↓

┌─────────────────────────────┐
│          TABLET             │
│                             │
│ menú │ contenido            │
│      │ tarjetas             │
└─────────────────────────────┘

        ↓

┌──────────────────────────────────────┐
│               ESCRITORIO             │
│ menú │          contenido            │
│      │ tarjetas / tablas / paneles   │
└──────────────────────────────────────┘
```

Los aprendices deberán garantizar que los elementos no se desborden y que las tablas, formularios y tarjetas sean utilizables en diferentes tamaños de pantalla.

---

# 17. Relación entre pantallas y API

| Pantalla | Operaciones principales |
|---|---|
| Dashboard | Consultar estadísticas |
| Nueva solicitud | POST solicitud |
| Listado | GET solicitudes |
| Detalle | GET solicitud |
| Monitor | Consultar estados y estadísticas |

---

# 18. Flujo de arquitectura completo

El flujo principal del sistema puede resumirse así:

```text
                     USUARIO
                        │
                        ▼
                  ┌───────────┐
                  │   VUE 3   │
                  └─────┬─────┘
                        │
                     Axios
                        │
                        ▼
                ┌──────────────┐
                │   EXPRESS    │
                │      API     │
                └──────┬───────┘
                       │
             ┌─────────┴─────────┐
             ▼                   ▼
       ┌───────────┐       ┌───────────┐
       │  MONGODB  │       │   REDIS   │
       │           │       │           │
       │ Datos     │       │ Cache     │
       │ Solicitud │       │ Queue     │
       └───────────┘       └─────┬─────┘
                                 │
                                 ▼
                          ┌─────────────┐
                          │   WORKER    │
                          │   Node.js   │
                          └──────┬──────┘
                                 │
                                 ▼
                            MONGODB
                                 │
                                 ▼
                         Solicitud procesada
                                 │
                                 ▼
                              VUE 3
                                 │
                                 ▼
                              USUARIO
```

---

# 19. Arquitectura dentro de Docker Compose

```text
                         HOST
                          │
                   Docker Compose
                          │
       ┌──────────────────┼──────────────────┐
       │                  │                  │
       ▼                  ▼                  ▼
 ┌───────────┐      ┌───────────┐      ┌───────────┐
 │ Frontend  │      │  Backend  │      │   Worker  │
 │   Vue 3   │─────▶│ Express   │      │  Node.js  │
 └───────────┘      └─────┬─────┘      └─────┬─────┘
                           │                  │
                 ┌─────────┴──────────────────┤
                 │                            │
                 ▼                            ▼
          ┌─────────────┐              ┌─────────────┐
          │  mongoserver│              │ redisserver │
          │   MongoDB   │              │    Redis    │
          └─────────────┘              └─────────────┘
```

Todos los servicios forman parte de la misma aplicación distribuida.

---

# 20. Reglas de arquitectura

Los aprendices deberán respetar las siguientes reglas:

1. Vue no debe conectarse directamente a MongoDB.
2. Vue no debe conectarse directamente a Redis.
3. Express debe actuar como API.
4. MongoDB debe encargarse de la persistencia.
5. Redis debe utilizarse para caché y cola.
6. El Worker debe ser un proceso independiente.
7. Los contenedores deben comunicarse mediante nombres de servicio.
8. MongoDB debe utilizar un volumen.
9. Las responsabilidades deben estar separadas.
10. Los componentes Vue reutilizables deben ubicarse en `/components`.
11. Las pantallas deben ubicarse en `/views`.
12. La comunicación con Express debe centralizarse en `/services`.
13. La navegación debe administrarse mediante `/router`.
14. La lógica reutilizable debe ubicarse en `/composables`.
15. El código debe mantenerse bajo control de versiones con Git.
16. El proyecto debe documentarse en GitHub.

---

# 21. Resultado esperado

Al finalizar, el equipo deberá disponer de un sistema donde:

```text
Usuario
   ↓
Vue
   ↓
Express
   ↓
MongoDB
   ↓
Redis Queue
   ↓
Worker
   ↓
Generación de respuesta
   ↓
MongoDB
   ↓
Vue
   ↓
Usuario
```

Y deberá poder demostrar:

- registro de solicitudes
- almacenamiento en MongoDB
- envío a Redis
- procesamiento mediante Worker
- generación de respuestas
- actualización de estados
- consulta mediante Vue
- utilización de caché
- persistencia mediante volumen Docker
- comunicación entre contenedores
- ejecución completa mediante Docker Compose
- organización del frontend según la arquitectura Vue 3
- control de versiones mediante Git y GitHub

---


---

# 21. Comunicación en tiempo real con Socket.IO

TASKFLOW utilizará **REST + Socket.IO** con responsabilidades diferentes:

- **REST/HTTP:** registrar solicitudes, consultar datos, obtener detalles y ejecutar operaciones CRUD.
- **Socket.IO:** informar al navegador, en tiempo real, que una solicitud cambió de estado o que cambió la información del monitor.
- **Redis:** mantener la caché y la cola de procesamiento.
- **Worker:** procesar las solicitudes de forma independiente.
- **MongoDB:** conservar la información de manera persistente.

> Socket.IO no reemplaza a REST, Redis ni al Worker. Complementa la arquitectura proporcionando comunicación en tiempo real entre el backend y el frontend.

## 21.1 Arquitectura actualizada

```text
                              TASKFLOW
                                 │
                    ┌────────────┴────────────┐
                    │                         │
                 HTTP/REST              WebSocket
                    │                     Socket.IO
                    ▼                         ▼
             ┌────────────────────────────────────┐
             │              FRONTEND               │
             │                VUE 3                │
             └────────────────┬───────────────────┘
                              │
                              ▼
             ┌────────────────────────────────────┐
             │               BACKEND              │
             │         NODE.JS + EXPRESS         │
             │             + SOCKET.IO            │
             └───────────────┬────────────────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
              ▼              ▼              ▼
        ┌──────────┐   ┌──────────┐   ┌────────────┐
        │ MONGODB  │   │  REDIS   │   │ REDIS QUEUE│
        │Persistencia│ │  CACHE   │   │            │
        └──────────┘   └──────────┘   └─────┬──────┘
                                             │
                                             ▼
                                      ┌──────────────┐
                                      │    WORKER    │
                                      │ Procesamiento│
                                      └──────┬───────┘
                                             │
                                             ▼
                                         MONGODB
                                             │
                                             │ evento
                                             ▼
                                      Socket.IO
                                             │
                                             ▼
                                           Vue 3
```

## 21.2 ¿Cuándo se utiliza Socket.IO?

Ejemplo:

```text
Usuario registra solicitud
        ↓
Vue → POST /api/solicitudes
        ↓
Express
        ↓
MongoDB guarda solicitud
        ↓
Redis coloca solicitud en cola
        ↓
Socket.IO emite "solicitud-encolada"
        ↓
Vue actualiza la interfaz
        ↓
Worker toma la solicitud
        ↓
Socket.IO emite "solicitud-procesando"
        ↓
Worker genera respuesta
        ↓
MongoDB actualiza solicitud
        ↓
Socket.IO emite "solicitud-respondida"
        ↓
Vue muestra la respuesta automáticamente
```

El usuario no necesita actualizar manualmente la página para observar los cambios.

## 21.3 Eventos Socket.IO sugeridos

| Evento | Emisor | Receptor | Propósito |
|---|---|---|---|
| `solicitud-creada` | Express | Vue | Informar que se creó una solicitud |
| `solicitud-encolada` | Express | Vue | Informar que ingresó a Redis Queue |
| `solicitud-procesando` | Worker/Backend | Vue | Informar que inició el procesamiento |
| `solicitud-respondida` | Worker/Backend | Vue | Informar que existe una respuesta |
| `solicitud-error` | Worker/Backend | Vue | Informar un error de procesamiento |
| `cola-actualizada` | Backend/Worker | Vue | Actualizar indicadores de la cola |
| `monitor-actualizado` | Backend/Worker | Vue | Actualizar el monitor en tiempo real |

## 21.4 Estructura adicional del frontend

La arquitectura Vue 3 se amplía con la configuración de Socket.IO:

```text
/src
├── /assets
├── /components
├── /views
├── /composables
│   └── useSocket.js
├── /store
├── /router
├── /services
├── /layouts
├── /styles
├── /plugins
│   ├── axios.js
│   └── socket.js
├── /utils
├── App.vue
└── main.js
```

### `/plugins/socket.js`

Responsabilidad:

- Crear/configurar la conexión Socket.IO.
- Definir la URL del backend.
- Configurar reconexión.
- Exponer la conexión para el resto de la aplicación.

### `/composables/useSocket.js`

Responsabilidad:

- Escuchar eventos Socket.IO.
- Registrar y retirar listeners.
- Facilitar el uso de Socket.IO desde las vistas o componentes.

Flujo recomendado:

```text
Socket.IO
    ↓
useSocket.js
    ↓
Pinia / Store
    ↓
Vue Components
    ↓
Actualización visual
```

## 21.5 Reglas de implementación

- Vue no debe conectarse directamente con Redis.
- Vue no debe conectarse directamente con MongoDB.
- Socket.IO debe estar implementado en Node.js/Express.
- El Worker no necesita una conexión directa con el navegador.
- Cuando el Worker cambia información importante, el backend debe emitir el evento correspondiente mediante Socket.IO.
- REST continúa siendo el mecanismo principal para operaciones de datos.
- Socket.IO se utilizará principalmente para notificaciones y actualización de información en tiempo real.
- La aplicación debe manejar desconexión y reconexión del socket.
- Los eventos deben tener nombres claros y documentados.

## 21.6 Dashboard y Monitor en tiempo real

Socket.IO tendrá especial utilidad en:

**Dashboard**

- Total de solicitudes.
- Solicitudes pendientes.
- Solicitudes en cola.
- Solicitudes procesándose.
- Solicitudes respondidas.
- Solicitudes con error.

**Monitor**

- Nueva solicitud.
- Entrada a la cola.
- Inicio del procesamiento.
- Finalización.
- Error.
- Actualización de contadores.

---

# 22. Historias de Usuario y criterios de aceptación

Las siguientes Historias de Usuario (HUS) definen el alcance funcional mínimo que deberá desarrollar el equipo.

Cada HU debe convertirse en tareas dentro de GitHub Projects y relacionarse con una rama, commits y, cuando corresponda, un Pull Request.

> **Importante:** Los criterios de aceptación indican qué debe poder demostrarse para considerar terminada una HU. No son instrucciones de código; el equipo debe decidir cómo implementarlos respetando la arquitectura definida.

---

## HU-01 — Registrar una solicitud

**Como** usuario de TASKFLOW  
**Quiero** registrar una nueva solicitud  
**Para** que el sistema pueda almacenarla y procesarla.

### Criterios de aceptación

- [ ] Debe existir una pantalla para registrar una solicitud.
- [ ] El formulario debe permitir ingresar título.
- [ ] El formulario debe permitir ingresar descripción.
- [ ] Debe permitir seleccionar una categoría.
- [ ] Debe permitir seleccionar una prioridad.
- [ ] Los campos obligatorios deben validarse antes de enviar.
- [ ] Si existen datos inválidos, se debe informar claramente al usuario.
- [ ] Al enviar correctamente, Vue debe realizar una petición al backend Express.
- [ ] Express debe validar la información recibida.
- [ ] La solicitud debe almacenarse en MongoDB.
- [ ] La solicitud debe quedar inicialmente con un estado controlado por el sistema.
- [ ] El usuario debe recibir confirmación del registro.
- [ ] Después del registro, la solicitud debe continuar hacia el proceso de cola.

### Evidencia esperada

Demostrar desde Vue el registro de una solicitud y verificar que la información haya sido almacenada en MongoDB.

---

## HU-02 — Consultar listado de solicitudes

**Como** usuario  
**Quiero** consultar mis solicitudes  
**Para** conocer su estado y evolución.

### Criterios de aceptación

- [ ] Debe existir una pantalla de listado de solicitudes.
- [ ] Debe mostrar como mínimo ID, título, categoría, prioridad, estado y fecha.
- [ ] Las solicitudes deben obtenerse mediante la API de Express.
- [ ] No se debe realizar conexión directa desde Vue hacia MongoDB.
- [ ] Debe existir una opción para consultar el detalle.
- [ ] Debe permitir identificar visualmente el estado de cada solicitud.
- [ ] Debe permitir realizar búsqueda o filtrado.
- [ ] Si no existen solicitudes, debe mostrarse un mensaje apropiado.
- [ ] Si ocurre un error al consultar, debe mostrarse un mensaje controlado.

### Evidencia esperada

Registrar varias solicitudes y demostrar que aparecen correctamente en el listado.

---

## HU-03 — Consultar detalle y respuesta

**Como** usuario  
**Quiero** consultar el detalle de una solicitud  
**Para** conocer la información registrada y la respuesta generada.

### Criterios de aceptación

- [ ] Debe existir una pantalla de detalle.
- [ ] Debe mostrar el ID de la solicitud.
- [ ] Debe mostrar título y descripción.
- [ ] Debe mostrar categoría.
- [ ] Debe mostrar prioridad.
- [ ] Debe mostrar estado.
- [ ] Debe mostrar fecha de creación.
- [ ] Debe mostrar fecha de procesamiento cuando exista.
- [ ] Si la solicitud está respondida, debe mostrar la respuesta generada.
- [ ] Si la solicitud tiene error, debe mostrar información controlada sobre el error.
- [ ] La información debe obtenerse mediante Express.
- [ ] La pantalla debe funcionar correctamente en diferentes tamaños de pantalla.

### Evidencia esperada

Consultar una solicitud procesada y demostrar que el usuario puede visualizar su respuesta.

---

## HU-04 — Enviar una solicitud a la cola

**Como** sistema  
**Quiero** enviar las solicitudes registradas a una cola Redis  
**Para** procesarlas de manera asíncrona.

### Criterios de aceptación

- [ ] Una solicitud registrada correctamente debe llegar a la cola.
- [ ] Redis debe utilizarse como mecanismo de cola.
- [ ] La cola debe contener una referencia identificable de la solicitud.
- [ ] La solicitud debe mostrar un estado que indique que está en cola.
- [ ] El Worker debe poder obtener solicitudes desde la cola.
- [ ] Si el Worker está detenido, las solicitudes deben permanecer pendientes en la cola.
- [ ] Al iniciar nuevamente el Worker, las solicitudes pendientes deben poder procesarse.
- [ ] El equipo debe poder demostrar el funcionamiento de la cola durante la presentación.

### Evidencia esperada

Detener el Worker, registrar varias solicitudes y demostrar que permanecen en cola. Luego iniciar el Worker y demostrar su procesamiento.

---

## HU-05 — Procesar una solicitud mediante el Worker

**Como** sistema  
**Quiero** procesar las solicitudes mediante un Worker independiente  
**Para** separar el procesamiento de la atención de las peticiones del usuario.

### Criterios de aceptación

- [ ] Debe existir un Worker independiente del backend.
- [ ] El Worker debe consultar la cola Redis.
- [ ] Debe obtener la solicitud correspondiente desde MongoDB.
- [ ] Debe cambiar el estado a `PROCESANDO`.
- [ ] Debe ejecutar el proceso de generación de respuesta.
- [ ] Debe guardar el resultado en MongoDB.
- [ ] Debe cambiar el estado a `RESPONDIDA` cuando el procesamiento termine correctamente.
- [ ] El Worker no debe depender de que el usuario mantenga abierta la pantalla para procesar la solicitud.
- [ ] Si ocurre un error, la solicitud debe poder pasar a `ERROR`.

### Evidencia esperada

Mostrar en vivo el cambio:

```text
EN COLA → PROCESANDO → RESPONDIDA
```

---

## HU-06 — Generar respuesta automática

**Como** sistema  
**Quiero** generar una respuesta según la categoría de la solicitud  
**Para** responder de manera automática y controlada.

### Criterios de aceptación

- [ ] El sistema debe manejar como mínimo cinco categorías.
- [ ] Cada categoría debe tener una regla o respuesta predefinida.
- [ ] El Worker debe identificar la categoría de la solicitud.
- [ ] Debe seleccionar la regla correspondiente.
- [ ] Debe generar una respuesta.
- [ ] La respuesta debe almacenarse en MongoDB.
- [ ] La respuesta debe estar asociada a la solicitud correcta.
- [ ] Si la categoría no coincide con una regla, debe utilizarse una respuesta genérica.
- [ ] El usuario debe poder consultar posteriormente la respuesta desde Vue.
- [ ] No es obligatorio utilizar inteligencia artificial para esta HU.

### Categorías sugeridas

| Categoría | Ejemplo de solicitud |
|---|---|
| Información | Solicitar información general |
| Soporte | Reportar un problema |
| Documento | Solicitar un documento |
| Consulta | Consultar el estado de un proceso |
| Actualización | Solicitar modificación de información |

### Evidencia esperada

Registrar solicitudes de diferentes categorías y demostrar que cada una recibe una respuesta correspondiente a su regla.

---

## HU-07 — Gestionar estados de la solicitud

**Como** usuario  
**Quiero** conocer el estado de mi solicitud  
**Para** saber en qué etapa del proceso se encuentra.

### Criterios de aceptación

- [ ] El sistema debe manejar estados definidos.
- [ ] Como mínimo debe contemplar:
  - `PENDIENTE`
  - `EN COLA`
  - `PROCESANDO`
  - `RESPONDIDA`
  - `ERROR`
- [ ] El estado debe almacenarse en MongoDB.
- [ ] El estado debe actualizarse durante el procesamiento.
- [ ] Vue debe mostrar visualmente el estado.
- [ ] Cada estado debe tener una representación visual diferenciable.
- [ ] El estado `ERROR` debe utilizarse cuando el procesamiento no pueda completarse.
- [ ] No se deben mostrar estados contradictorios entre el backend y el frontend.

### Evidencia esperada

Demostrar el ciclo completo de una solicitud y observar los cambios de estado.

---

## HU-08 — Consultar información mediante caché

**Como** usuario  
**Quiero** que las consultas frecuentes puedan utilizar caché  
**Para** obtener información de manera más eficiente.

### Criterios de aceptación

- [ ] Redis debe utilizarse como caché.
- [ ] El backend debe consultar primero la caché cuando corresponda.
- [ ] Si la información existe en Redis, debe identificarse como `CACHE HIT`.
- [ ] Si la información no existe, debe identificarse como `CACHE MISS`.
- [ ] Ante un `CACHE MISS`, el backend debe consultar MongoDB.
- [ ] Después de consultar MongoDB, la información podrá almacenarse en Redis.
- [ ] Debe existir un tiempo de expiración (TTL) para la información almacenada en caché.
- [ ] La información debe mantenerse consistente con MongoDB.
- [ ] El equipo debe poder demostrar la diferencia entre `CACHE HIT` y `CACHE MISS`.

### Evidencia esperada

Realizar una primera consulta y demostrar `CACHE MISS`. Repetir la consulta y demostrar `CACHE HIT`.

---

## HU-09 — Consultar el monitor del sistema

**Como** usuario  
**Quiero** consultar el estado general del procesamiento  
**Para** conocer el funcionamiento de los servicios de TASKFLOW.

### Criterios de aceptación

- [ ] Debe existir una pantalla de monitor.
- [ ] Debe mostrar información sobre el backend.
- [ ] Debe mostrar información sobre MongoDB.
- [ ] Debe mostrar información sobre Redis.
- [ ] Debe mostrar información sobre el Worker.
- [ ] Debe mostrar cantidad de solicitudes en cola.
- [ ] Debe mostrar solicitudes en procesamiento.
- [ ] Debe mostrar solicitudes respondidas.
- [ ] Debe mostrar solicitudes con error.
- [ ] La información debe obtenerse mediante servicios del backend.
- [ ] La interfaz debe diferenciar visualmente los estados disponibles y no disponibles.

### Evidencia esperada

Mostrar el monitor con los servicios ejecutándose y modificar el estado del Worker para demostrar que el sistema puede detectar o reflejar el cambio, según la implementación elegida.

---

## HU-10 — Mantener la información después de reiniciar Docker

**Como** usuario  
**Quiero** que mis solicitudes permanezcan almacenadas  
**Para** no perder la información cuando se reinicien los servicios.

### Criterios de aceptación

- [ ] MongoDB debe utilizar un volumen Docker.
- [ ] Las solicitudes almacenadas deben conservarse después de reiniciar los contenedores.
- [ ] Los datos no deben depender únicamente del almacenamiento interno temporal del contenedor.
- [ ] Después del reinicio, Vue debe poder consultar nuevamente las solicitudes.
- [ ] El equipo debe poder demostrar la persistencia durante la presentación.

### Evidencia esperada

Registrar una solicitud, detener/reiniciar los servicios y demostrar que la solicitud continúa almacenada.

---

## HU-11 — Manejar errores de procesamiento

**Como** usuario  
**Quiero** recibir información clara cuando una solicitud no pueda procesarse  
**Para** conocer que ocurrió un problema.

### Criterios de aceptación

- [ ] El sistema debe contemplar errores de validación.
- [ ] El sistema debe contemplar errores de comunicación.
- [ ] El Worker debe manejar errores durante el procesamiento.
- [ ] Una solicitud que no pueda procesarse debe poder quedar en estado `ERROR`.
- [ ] El error debe registrarse de forma controlada.
- [ ] El usuario no debe recibir mensajes técnicos innecesarios.
- [ ] La aplicación no debe quedar bloqueada por una solicitud con error.
- [ ] Las demás solicitudes deben poder continuar su procesamiento.

### Evidencia esperada

Provocar o simular un error controlado y demostrar que la solicitud pasa a `ERROR` sin detener todo el sistema.

---

## HU-12 — Utilizar arquitectura organizada en Vue 3

**Como** equipo de desarrollo  
**Quiero** organizar el frontend según una arquitectura definida  
**Para** facilitar el mantenimiento, reutilización y crecimiento del proyecto.

### Criterios de aceptación

- [ ] Debe existir `/components` para componentes reutilizables.
- [ ] Debe existir `/views` para las pantallas.
- [ ] Debe existir `/composables` para lógica reutilizable.
- [ ] Debe existir `/store` para el estado global cuando sea necesario.
- [ ] Debe existir `/router` para las rutas.
- [ ] Debe existir `/services` para la comunicación con Express.
- [ ] Debe existir `/layouts` para las plantillas generales.
- [ ] Debe existir `/styles` para estilos globales.
- [ ] Debe existir `/plugins` para configuraciones globales.
- [ ] Debe existir `/utils` para funciones auxiliares.
- [ ] La estructura debe mantenerse organizada y documentada.
- [ ] No se debe concentrar toda la lógica de la aplicación en un único componente.

---

## HU-13 — Ejecutar el sistema mediante Docker Compose

**Como** equipo de desarrollo  
**Quiero** ejecutar los servicios mediante Docker Compose  
**Para** disponer de un entorno reproducible.

### Criterios de aceptación

- [ ] Debe existir un archivo de Docker Compose.
- [ ] Debe definir el servicio del frontend.
- [ ] Debe definir el servicio del backend.
- [ ] Debe definir el servicio del Worker.
- [ ] Debe definir el servicio de MongoDB.
- [ ] Debe definir el servicio de Redis.
- [ ] Los servicios deben poder iniciarse mediante Docker Compose.
- [ ] Los servicios deben poder comunicarse entre sí.
- [ ] MongoDB debe tener persistencia mediante volumen.
- [ ] Los servicios internos deben utilizar los nombres de servicio para comunicarse.
- [ ] El equipo debe documentar los puertos necesarios para acceder desde el equipo anfitrión.

### Evidencia esperada

Ejecutar el proyecto con Docker Compose y demostrar que los cinco servicios están funcionando e integrados.

---

## HU-14 — Implementar diseño responsive

**Como** usuario  
**Quiero** utilizar TASKFLOW desde diferentes dispositivos  
**Para** acceder al sistema desde computador, tablet o móvil.

### Criterios de aceptación

- [ ] Dashboard debe adaptarse a diferentes resoluciones.
- [ ] Formulario de solicitud debe adaptarse a pantallas pequeñas.
- [ ] Listado de solicitudes debe ser usable en móvil.
- [ ] Detalle de solicitud debe ser usable en móvil.
- [ ] Monitor debe adaptarse a diferentes tamaños.
- [ ] No debe existir desplazamiento horizontal innecesario.
- [ ] Los botones deben ser utilizables en dispositivos táctiles.
- [ ] La información debe conservar una jerarquía visual clara.

---

## HU-15 — Gestionar el proyecto mediante Git y GitHub

**Como** equipo de desarrollo  
**Quiero** utilizar Git y GitHub  
**Para** controlar los cambios y trabajar colaborativamente.

### Criterios de aceptación

- [ ] El proyecto debe tener un repositorio GitHub.
- [ ] Debe existir una rama principal protegida según las reglas definidas por el equipo.
- [ ] El desarrollo debe realizarse mediante ramas de trabajo.
- [ ] Cada aprendiz debe realizar aportes identificables mediante commits.
- [ ] Las funcionalidades deben estar relacionadas con Issues.
- [ ] Las tareas deben organizarse en GitHub Projects.
- [ ] Cada aprendiz debe crear al menos una rama de funcionalidad.
- [ ] Cada aprendiz debe participar al menos en un Pull Request.
- [ ] Cada aprendiz debe realizar al menos una revisión de código a un compañero.
- [ ] Los cambios aprobados deben integrarse a la rama definida por el equipo.
- [ ] El README debe documentar cómo ejecutar el proyecto.

### Flujo esperado

```text
Issue
  ↓
Task / GitHub Project
  ↓
Branch
  ↓
Development
  ↓
Commit
  ↓
Push
  ↓
Pull Request
  ↓
Code Review
  ↓
Correcciones
  ↓
Merge
  ↓
Cerrar Issue
```

---


---

## HU-16 — Actualización de estados en tiempo real

**Como** usuario de TASKFLOW  
**Quiero** recibir automáticamente los cambios de estado de mis solicitudes  
**Para** conocer el avance del procesamiento sin actualizar manualmente la página.

### Criterios de aceptación

- [ ] El frontend Vue debe establecer una conexión Socket.IO con el backend.
- [ ] El backend debe disponer de un servidor Socket.IO integrado con Node.js/Express.
- [ ] Al crear una solicitud se debe poder emitir el evento `solicitud-creada`.
- [ ] Al ingresar una solicitud a la cola se debe emitir `solicitud-encolada`.
- [ ] Al iniciar el Worker se debe emitir `solicitud-procesando`.
- [ ] Al finalizar correctamente se debe emitir `solicitud-respondida`.
- [ ] Si ocurre un error se debe emitir `solicitud-error`.
- [ ] Dashboard y Monitor deben actualizar sus indicadores sin recargar la página.
- [ ] El frontend debe actualizar el estado correspondiente de la solicitud.
- [ ] Debe existir manejo básico de desconexión y reconexión.
- [ ] Socket.IO no debe reemplazar las operaciones REST de consulta y persistencia.

### Evidencia esperada

Demostrar una solicitud que pase por:

```text
PENDIENTE
   ↓
EN COLA
   ↓
PROCESANDO
   ↓
RESPONDIDA
```

y comprobar que los cambios aparecen en Vue automáticamente, sin actualizar el navegador.


# 23. Definition of Done — Definición de terminado

Una Historia de Usuario solamente podrá considerarse **FINALIZADA** cuando:

- [ ] La funcionalidad esté desarrollada.
- [ ] Cumpla todos sus criterios de aceptación.
- [ ] El frontend y backend estén integrados cuando corresponda.
- [ ] La funcionalidad haya sido probada.
- [ ] No existan errores críticos conocidos.
- [ ] El código esté en una rama de trabajo.
- [ ] Exista al menos un commit relacionado.
- [ ] Se haya realizado Push al repositorio.
- [ ] Se haya creado Pull Request cuando corresponda.
- [ ] Se haya realizado revisión de código.
- [ ] Las correcciones solicitadas hayan sido atendidas.
- [ ] El cambio esté integrado según el flujo Git definido.
- [ ] La Issue pueda cerrarse.
- [ ] La documentación se encuentre actualizada cuando la funcionalidad modifique la arquitectura o el funcionamiento del sistema.

---

# 24. Reto final de integración

Al finalizar las HUS, el equipo deberá demostrar el siguiente escenario completo:

```text
1. Usuario abre TASKFLOW
          ↓
2. Vue muestra Dashboard
          ↓
3. Usuario registra solicitud
          ↓
4. Vue → Express
          ↓
5. Express valida
          ↓
6. MongoDB almacena
          ↓
7. Redis recibe solicitud en cola
          ↓
8. Socket.IO informa EN COLA
          ↓
9. Vue actualiza el estado sin refrescar
          ↓
10. Worker obtiene solicitud
          ↓
11. Socket.IO informa PROCESANDO
          ↓
11. Worker identifica categoría
          ↓
12. Genera respuesta
          ↓
13. MongoDB almacena respuesta
          ↓
14. Estado = RESPONDIDA
          ↓
15. Vue consulta la solicitud
          ↓
16. Usuario visualiza respuesta
          ↓
17. Se demuestra CACHE HIT
          ↓
18. Se detiene Worker
          ↓
19. Se registran nuevas solicitudes
          ↓
20. Las solicitudes permanecen EN COLA
          ↓
21. Se inicia Worker
          ↓
22. Las solicitudes son procesadas
          ↓
23. Se reinician contenedores
          ↓
24. Se demuestra persistencia de MongoDB
```

Este escenario representa la integración de las Historias de Usuario y debe ser utilizado como guía para la demostración final del proyecto.