| Denominación                               | Taller Docker Compose                                                                                  |
|--------------------------------------------|--------------------------------------------------------------------------------------------------------|
| Nombre y código del Programa de formación: | Tecnólogo en Análisis y desarrollo de software Código: 228118                                          |
| Competencia:                               | Implementar la solución de software de acuerdo con los requisitos de operación y modelos de referencia |
| Identificación de la actividad:            | Actividad Aprendizaje: <u>Configurar los servicios requeridos del software</u>                         |

**Taller Docker Compose -**

**Instrucciones:** Leer con atención la actividad propuesta por el instructor, desarrollar cada uno de los puntos propuestos y presentarla de forma digital.

1.  **Contextualización del taller**

Una organización recibe diariamente solicitudes de usuarios relacionadas con información, soporte, documentos, consultas y actualización de datos. Cuando todas las solicitudes son atendidas de manera directa y sin un mecanismo de organización, pueden presentarse demoras, acumulación de trabajo, pérdida de trazabilidad y dificultades para conocer el estado de cada solicitud.

Para atender esta situación se propone desarrollar TASKFLOW, una aplicación web que permita registrar solicitudes, almacenarlas, enviarlas a una cola de procesamiento, procesarlas de manera asíncrona y generar una respuesta. La solución deberá separar el frontend, backend, persistencia, caché, cola y procesamiento mediante diferentes servicios administrados con Docker Compose.

El proyecto busca que los aprendices comprendan cómo se integran tecnologías Full Stack y conceptos de arquitectura distribuida en una solución funcional, mientras aplican Git y GitHub como herramientas de control de versiones y trabajo colaborativo.

# **Situación problema**

Una empresa necesita mejorar el proceso de recepción y atención de solicitudes. Actualmente no existe un sistema que permita identificar con claridad qué solicitudes están pendientes, cuáles se encuentran en procesamiento y cuáles ya fueron respondidas. Además, cuando aumenta el número de solicitudes, el sistema debe evitar que el procesamiento de una solicitud bloquee la atención de las demás.

El equipo de desarrollo deberá proponer y construir una solución que permita:

- Registrar solicitudes desde una interfaz web.

- Consultar el listado y detalle de las solicitudes.

- Almacenar la información de manera persistente.

- Enviar las solicitudes a una cola para procesamiento asíncrono.

- Procesar las solicitudes mediante un Worker independiente.

- Generar respuestas automáticas según categorías o reglas previamente definidas.

- Consultar y visualizar la respuesta generada.

- Utilizar Redis como caché para consultas frecuentes.

- Demostrar qué sucede cuando el Worker se encuentra detenido y posteriormente se recupera.

- Ejecutar los servicios mediante Docker Compose.

- Gestionar el desarrollo colaborativo mediante Git y GitHub.

# **Objetivo general**

Desarrollar una aplicación web Full Stack denominada TASKFLOW para la gestión y respuesta de solicitudes, utilizando Vue.js en el frontend, Node.js con Express.js en el backend, MongoDB para la persistencia, Redis para caché y cola, un Worker para el procesamiento asíncrono y Docker Compose para administrar los servicios, aplicando Git y GitHub como herramientas de control de versiones y colaboración.

# **Objetivos específicos**

- Comprender los principios básicos de una arquitectura distribuida.

- Diseñar una interfaz web mediante Vue.js utilizando componentes y vistas.

- Construir una API REST utilizando Node.js y Express.js.

- Almacenar y consultar solicitudes y respuestas en MongoDB.

- Implementar el concepto de caché y cola utilizando Redis.

- Comprender el funcionamiento de un Worker independiente.

- Diseñar un flujo de procesamiento asíncrono de solicitudes.

- Generar respuestas automáticas a partir de categorías y reglas definidas.

- Contenerizar frontend, backend, Worker, MongoDB y Redis con Docker.

- Utilizar Docker Compose para orquestar los servicios.

- Aplicar ramas, commits, Issues, Projects, Pull Requests y Code Review mediante GitHub.

- Realizar pruebas de integración, persistencia, caché, cola, recuperación y respuesta.

# **Tecnologías y responsabilidades**

| **Tecnología** | **Responsabilidad en TASKFLOW**                                                           |
|----------------|-------------------------------------------------------------------------------------------|
| Vue.js         | Construcción de la interfaz, vistas, componentes, formularios y visualización de estados. |
| Node.js        | Entorno de ejecución del backend y del Worker.                                            |
| Express.js     | Construcción de la API REST, rutas, controladores, validaciones y respuestas HTTP.        |
| MongoDB        | Persistencia de solicitudes, estados, respuestas y fechas.                                |
| Redis          | Caché de información y cola de solicitudes pendientes de procesamiento.                   |
| Worker         | Consumo de la cola, procesamiento y generación de respuestas.                             |
| Docker         | Creación y ejecución de contenedores.                                                     |
| Docker Compose | Orquestación de los servicios y redes internas.                                           |
| Git            | Control de versiones y seguimiento de cambios.                                            |
| GitHub         | Repositorio, Issues, Project, Pull Requests y revisión colaborativa.                      |

# **Estados de las solicitudes**

| **Estado** | **Descripción**                                              | **Representación sugerida** |
|------------|--------------------------------------------------------------|-----------------------------|
| PENDIENTE  | Solicitud creada, pero aún no enviada al procesamiento.      | Amarillo                    |
| EN COLA    | Solicitud almacenada y esperando ser atendida por el Worker. | Azul                        |
| PROCESANDO | El Worker está atendiendo la solicitud.                      | Morado                      |
| RESPONDIDA | La solicitud fue procesada y tiene una respuesta.            | Verde                       |
| ERROR      | Ocurrió un problema durante el procesamiento.                | Rojo                        |

# **7. Generación de respuestas**

Para mantener el alcance del proyecto adecuado para cuatro clases, las respuestas no deberán depender de inteligencia artificial. El sistema utilizará respuestas predefinidas asociadas a categorías o reglas.

Categorías sugeridas:

| **Categoría** | **Ejemplo de solicitud**           | **Respuesta esperada de referencia**                                   |
|---------------|------------------------------------|------------------------------------------------------------------------|
| Información   | ¿Cuál es el horario de atención?   | El sistema entrega el horario definido por la organización.            |
| Soporte       | No puedo acceder al sistema.       | El sistema entrega instrucciones básicas o indica el canal de soporte. |
| Documento     | Necesito solicitar un certificado. | El sistema informa el procedimiento y los requisitos definidos.        |
| Consulta      | ¿Cuál es el estado de mi trámite?  | El sistema entrega la información disponible para la consulta.         |
| Actualización | Necesito actualizar mis datos.     | El sistema informa el procedimiento de actualización.                  |

Los aprendices deberán definir al menos cinco categorías y diseñar una respuesta para cada una. También deberán contemplar una respuesta genérica para solicitudes que no coincidan con las reglas definidas.

Ejemplo conceptual de funcionamiento:

Solicitud → Identificar categoría → Buscar regla de respuesta → Generar respuesta → Guardar respuesta → Mostrar en Vue

#  **Modelo de información**

La entidad principal será SOLICITUD. Como mínimo deberá contemplar:

| **Campo**          | **Propósito**                                   |
|--------------------|-------------------------------------------------|
| id                 | Identificador único de la solicitud.            |
| titulo             | Asunto o título de la solicitud.                |
| descripcion        | Detalle proporcionado por el usuario.           |
| categoria          | Tipo de solicitud.                              |
| prioridad          | Baja, media o alta.                             |
| estado             | Estado actual del procesamiento.                |
| respuesta          | Respuesta generada por el sistema.              |
| fechaCreacion      | Fecha y hora de registro.                       |
| fechaProcesamiento | Fecha y hora de finalización del procesamiento. |
| mensajeError       | Información del error cuando corresponda.       |

# **10. Diseño del frontend con Vue.js**

El frontend deberá utilizar componentes y vistas. Como mínimo se deberán contemplar:

- Dashboard.

- Formulario de nueva solicitud.

- Listado de solicitudes.

- Detalle de solicitud.

- Monitor de procesamiento.

Componentes sugeridos:

- Navbar.

- Sidebar o menú.

- Tarjeta de indicador (StatCard).

- Tabla o tarjetas de solicitudes.

- Formulario de solicitud.

- Selector de categoría.

- Selector de prioridad.

- Indicador de estado.

- Panel de respuesta.

- Indicador de servicios o monitor.

Criterios de interfaz:

- Diseño responsive para computador, tableta y móvil.

- Estados visuales diferenciados.

- Formularios claros y con validación visual.

- Mensajes de éxito y error.

- Navegación consistente.

- Uso coherente de tipografía, iconografía y colores.

- Los botones deben tener nombres claros y acciones comprensibles.

# **11. Pantallas sugeridas**

## 11.1 Dashboard

Debe mostrar total de solicitudes, pendientes, en cola, procesando, respondidas y errores. Debe incluir acceso a Nueva solicitud.

## 11.2 Nueva solicitud

Debe incluir categoría, título, descripción, prioridad, botón cancelar y botón enviar solicitud.

## 11.3 Mis solicitudes

Debe presentar identificador, solicitud, categoría, prioridad, estado, fecha y acción para consultar detalle.

## 11.4 Detalle y respuesta

Debe mostrar los datos de la solicitud, estado actual, fechas, respuesta generada y, si corresponde, mensaje de error.

## 11.5 Monitor

Debe permitir visualizar de forma didáctica el estado de MongoDB, Redis, Express y Worker, además de cantidad de solicitudes en cola, procesando, respondidas y errores. Puede ser una pantalla simplificada.

# **12. Backend con Express.js**

Los aprendices deberán diseñar una API REST organizada. Como mínimo deberán contemplar operaciones para:

- Registrar una solicitud.

- Consultar todas las solicitudes.

- Consultar una solicitud por identificador.

- Consultar la respuesta de una solicitud.

- Consultar indicadores o estadísticas para el Dashboard.

El backend deberá aplicar separación de responsabilidades mediante rutas, controladores, servicios y mecanismos de validación y manejo de errores, de acuerdo con el nivel de conocimiento del grupo.

# **13. Redis: caché y cola**

Redis tendrá dos funciones pedagógicas: acelerar consultas frecuentes mediante caché y administrar una cola de trabajos pendientes.

## 13.1 Caché

Los aprendices deberán identificar una consulta que pueda beneficiarse del caché. Se propone utilizar la información del listado o indicadores. La primera consulta deberá consultar la fuente persistente y almacenar temporalmente el resultado; una consulta posterior deberá poder recuperar la información desde Redis.

La prueba deberá permitir identificar:

- CACHE MISS: no existe información en caché.

- Consulta a MongoDB.

- Almacenamiento temporal en Redis.

- CACHE HIT: la información se recupera desde Redis.

## 13.2 Cola

Cada solicitud enviada a procesamiento deberá quedar registrada en una cola de Redis hasta que un Worker la consuma.

# **14. Worker y procesamiento asíncrono**

El Worker será un proceso independiente del backend. Su función será consumir las solicitudes de la cola, procesarlas y generar la respuesta.

Flujo mínimo del Worker:

1.  Esperar solicitudes en la cola.

2.  Obtener una solicitud.

3.  Actualizar el estado a PROCESANDO.

4.  Aplicar las reglas de respuesta.

5.  Generar la respuesta.

6.  Guardar la respuesta en MongoDB.

7.  Actualizar el estado a RESPONDIDA.

8.  Registrar ERROR cuando no sea posible completar el procesamiento.

# **15. Docker y Docker Compose**

El proyecto deberá ejecutarse mediante servicios independientes:

| **Servicio** | **Función**                             |
|--------------|-----------------------------------------|
| frontend     | Aplicación Vue.js.                      |
| backend      | API Node.js + Express.js.               |
| worker       | Procesamiento asíncrono de solicitudes. |
| mongoserver  | Base de datos MongoDB.                  |
| redisserver  | Caché y cola.                           |

Los aprendices deberán comprender imágenes, contenedores, puertos, redes, volúmenes, variables de entorno y comunicación entre servicios. La comunicación interna deberá utilizar los nombres de servicio de Docker Compose y los puertos internos correspondientes.

# **16. Git y GitHub**

Git y GitHub serán parte obligatoria del proceso de desarrollo. No se evaluará únicamente el producto final, sino también la evidencia del trabajo colaborativo.

Flujo de trabajo obligatorio:

ISSUE → BRANCH → DESARROLLO → COMMIT → PUSH → PULL REQUEST → CODE REVIEW → CORRECCIONES → MERGE → CERRAR ISSUE

## 16.1 Elementos mínimos del repositorio

- Repositorio público

- README con descripción, tecnologías, arquitectura, instalación, funcionalidades y miembros.

- Issues para funcionalidades y tareas.

- Ramas de trabajo.

- Commits descriptivos.

- Pull Requests.

- Historial que evidencie la participación de ambos aprendices.

# **17. Pruebas obligatorias**

| **Prueba**   | **Criterio**                                                                    |
|--------------|---------------------------------------------------------------------------------|
| Registro     | Registrar una solicitud desde Vue y comprobar su almacenamiento en MongoDB.     |
| Respuesta    | Procesar una solicitud y comprobar que aparece una respuesta.                   |
| Cola         | Detener Worker, registrar cinco solicitudes y comprobar que permanecen en cola. |
| Recuperación | Iniciar nuevamente Worker y comprobar que procesa las solicitudes pendientes.   |
| Caché        | Demostrar una consulta CACHE MISS y una posterior CACHE HIT.                    |
| Persistencia | Reiniciar servicios y comprobar que la información persiste en MongoDB.         |
| Error        | Provocar o simular un error controlado y comprobar el estado ERROR.             |
| Responsive   | Comprobar la interfaz en diferentes tamaños de pantalla.                        |

# **Evidencias de aprendizaje**

- Diseño de API.

- Prototipo o diseño de pantallas.

- Código fuente del frontend Vue.

- Código fuente del backend Express.

- Worker.

- Configuración Docker y Docker Compose.

- Persistencia MongoDB.

- Integración Redis para caché y cola.

- Pruebas documentadas.

- README.

- Repositorio GitHub con Issues, ramas, commits y Pull Requests.

- Presentación final de máximo 15 minutos.

# **Reto de integración final**

Durante la demostración cada equipo deberá realizar en vivo el siguiente recorrido:

- Abrir TASKFLOW desde el frontend Vue.

- Registrar una solicitud.

- Mostrar que la solicitud queda almacenada.

- Mostrar que la solicitud entra a la cola.

- Detener el Worker.

- Registrar varias solicitudes y evidenciar que permanecen EN COLA.

- Iniciar nuevamente el Worker.

- Observar el cambio a PROCESANDO.

- Mostrar la respuesta generada.

- Consultar la solicitud desde Vue.

- Demostrar una consulta atendida mediante caché.

- Reiniciar los servicios y demostrar la persistencia de la información.

- Mostrar el repositorio GitHub y explicar Issues, ramas, commits y Pull Requests.

**PRODUCTO(S) ENTREGABLE(S)**

Documento digital con las respuestas y/o solución del *Taller Docker compose TaskFlow* cargar el link de Git Hub y pantallazos del funcionamiento y configuración de docker.

**FORMA DE ENTREGA**

El documento con la solución del taller Docker compose – TaskFlow deberá subirse a la plataforma de formación dispuesta por el SENA.
