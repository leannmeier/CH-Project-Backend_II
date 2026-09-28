# Plataforma de Eventos

## Descripción

Backend de una plataforma de gestión de eventos e inscripciones, desarrollado como proyecto final del curso Backend II de Coderhouse.

El proyecto cuenta con una **arquitectura en capas desacoplada** (Router, Middleware, Controller, Service, Repository, DAO y Modelos) conectada a MongoDB Atlas. La autenticación y autorización están integradas mediante **Passport.js** y JWT almacenado en cookies `HttpOnly`, con estrategias para registro, inicio de sesión y sesión activa (`current`).

Además, el sistema implementa un **control de acceso basado en roles (RBAC)** mediante middlewares reutilizables, que restringen o permiten acciones a los usuarios con rol `user`, `organizer` y `admin`.

## Matriz de Permisos (RBAC)

| Acción | `user` | `organizer` | `admin` | Endpoint |
|---|:---:|:---:|:---:|---|
| **Consultar eventos** | ✅ | ✅ | ✅ | `GET /api/events` |
| **Crear eventos** | ❌ | ✅ | ✅ | `POST /api/events` |
| **Modificar eventos propios** | ❌ | ✅ | ✅ | `PUT /api/events/:eid` |
| **Eliminar eventos propios** | ❌ | ✅ | ✅ | `DELETE /api/events/:eid` |
| **Modificar / eliminar cualquier evento** | ❌ | ❌ | ✅ | `PUT` / `DELETE /api/events/:eid` |
| **Ver todos los usuarios (ruta admin)** | ❌ | ❌ | ✅ | `GET /api/sessions/listUsers` |

> **IMPORTANTE:** el modelo de usuario asigna por defecto el rol `user`. El registro público no permite auto-asignarse los roles `admin` u `organizer` desde el `req.body`. Del mismo modo, el `organizer` de un evento nunca se toma del body: sale siempre del usuario autenticado.

## Autenticación vs. Autorización (401 y 403)

El sistema distingue el estado de autenticación del nivel de permisos:

1. **`401 Unauthorized` (no hay una sesión válida):**
   - Se devuelve cuando la petición no incluye la cookie `currentUser`, cuando el JWT venció o es inválido, o cuando el usuario ya no existe en la base.
   - **Manejado por:** los middlewares `passportCall('current')` y `requireAuth`.
   - **Respuesta:** `{ "status": "error", "message": "..." }`. El mensaje varía según la causa; por ejemplo, `No auth token` cuando no hay cookie (mensaje por defecto de Passport).

2. **`403 Forbidden` (hay sesión, pero no hay permiso):**
   - Se devuelve cuando el usuario inició sesión correctamente, pero su rol no alcanza para el recurso, o cuando un `organizer` intenta modificar o eliminar un evento que pertenece a otro organizador.
   - **Manejado por:** el middleware `authorization([...roles])` y las validaciones de propiedad de la capa de servicio.
   - **Respuestas:**
     - Rol insuficiente: `{ "status": "error", "message": "No tienes permisos suficientes" }`
     - Evento ajeno: `{ "status": "error", "message": "No tienes permisos para realizar esa acción" }`

## Tecnologías utilizadas

- Node.js (ESM, v20+)
- Express
- MongoDB Atlas
- Mongoose
- dotenv
- bcrypt
- jsonwebtoken
- cookie-parser
- Passport.js (`passport`, `passport-local`, `passport-jwt`)

## Instalación

Clonar el repositorio e instalar las dependencias:

```bash
git clone https://github.com/leannmeier/CH-Project-Backend_II.git
cd "CH-Project-Backend_II"
pnpm install
```

Requiere Node.js v20 o superior.

## Variables de Entorno

El proyecto requiere un archivo `.env` en la raíz. Se incluye `.env.example` como referencia, sin valores reales:

```
PORT=1234
NODE_ENV=development
MONGO_URL=tu_url_de_mongodb
JWT_SECRET=una-cadena-larga-y-aleatoria-que-vos-generes
JWT_EXPIRES_IN=tiempo_de_expiracion_del_token_en_segundos
```

Copiar y completar antes de ejecutar el proyecto:

```bash
cp .env.example .env
```

`MONGO_URL` corresponde a un cluster de [MongoDB Atlas](https://www.mongodb.com/cloud/atlas). Es necesario habilitar el acceso a la IP correspondiente desde *Network Access* en el panel de Atlas.

La aplicación valida al iniciar que las variables críticas estén presentes y que la conexión a MongoDB sea exitosa antes de aceptar peticiones (patrón *fail-fast*). Si algo falla, el proceso se detiene con un mensaje de error descriptivo.

## ¿Cómo ejecutarlo?

```bash
pnpm start   # ejecuta el proyecto
pnpm dev     # ejecuta el proyecto con reinicio automático ante cambios (node --watch)
```

El servidor queda disponible en `http://localhost:<PORT>` (por defecto, `http://localhost:1234`).

## Autenticación con Passport.js

Toda la lógica de autenticación está centralizada en `src/config/passport.config.js`, separada de `app.js` (que solo la inicializa con `passport.initialize()`). Implementa tres estrategias:

- **`register`** (`passport-local`, sobre el campo `email`): valida campos obligatorios, formato de email, unicidad y longitud mínima de contraseña, y hashea con bcrypt antes de dejar el usuario listo para persistir.
- **`login`** (`passport-local`): busca el usuario y compara la contraseña con bcrypt. No genera el JWT: eso queda a cargo del controller, una vez que Passport confirma que las credenciales son válidas.
- **`current`** (`passport-jwt`, con extractor personalizado): lee el JWT desde la cookie `currentUser` (no desde el header `Authorization`, que es el comportamiento por defecto de la librería), lo valida y deja el usuario en `req.user`.

Las tres estrategias se invocan a través de un middleware reutilizable (`passportCall`), que además de autenticar permite devolver mensajes de error específicos en vez del 401 genérico de Passport. `logout` no pasa por Passport, ya que solo limpia la cookie.

Esta estructura deja el proyecto preparado para sumar nuevos proveedores (Google, GitHub, etc.) como nuevas estrategias dentro de `passport.config.js`, sin modificar `app.js` ni las rutas existentes.

## Estructura de carpetas

```
CH-Project-Backend_II/
├── src/
│   ├── app.js
│   ├── server.js
│   ├── config/
│   │   ├── database.config.js
│   │   ├── env.config.js
│   │   └── passport.config.js
│   ├── controllers/
│   │   ├── events.controller.js
│   │   ├── healths.controller.js
│   │   └── sessions.controller.js
│   ├── dao/
│   │   ├── events.dao.js
│   │   └── sessions.dao.js
│   ├── middlewares/
│   │   ├── asyncHandler.middleware.js
│   │   ├── authorization.middleware.js
│   │   ├── errorHandler.middleware.js
│   │   ├── passportCall.middleware.js
│   │   ├── requireAuth.middleware.js
│   │   ├── validateEvent.middleware.js
│   │   └── validateUpdateEvent.middleware.js
│   ├── models/
│   │   ├── Event.js
│   │   └── User.js
│   ├── repositories/
│   │   ├── events.repository.js
│   │   └── sessions.repository.js
│   ├── routes/
│   │   ├── events.router.js
│   │   ├── healths.router.js
│   │   └── sessions.router.js
│   ├── services/
│   │   ├── events.service.js
│   │   └── sessions.service.js
│   ├── test/
│   │   ├── test-admin/
│   │   │   ├── 05.api-prueba-admin.http
│   │   │   └── (capturas de los casos de prueba).png
│   │   ├── test-organizer/
│   │   │   ├── 05.api-prueba-organizer.http
│   │   │   └── (capturas de los casos de prueba).png
│   │   └── test-user/
│   │       ├── 05.api-prueba-user.http
│   │       └── (capturas de los casos de prueba).png
│   └── utils/
│       ├── hash.js
│       └── jwt.js
├── .env.example
├── .gitignore
├── package.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
└── README.md
```

## Endpoints principales

Todas las respuestas siguen una estructura consistente.

Éxito:

```json
{ "status": "success", "payload": {} }
```

Error:

```json
{ "status": "error", "message": "" }
```

### HEALTH

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/health` | Devuelve una respuesta indicando que el servidor está activo. |

### EVENTS

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/api/events` | Público | Devuelve todos los eventos registrados. |
| POST | `/api/events` | `organizer`, `admin` | Crea un evento. |
| PUT | `/api/events/:eid` | `organizer` (solo propios), `admin` | Modifica un evento existente. |
| DELETE | `/api/events/:eid` | `organizer` (solo propios), `admin` | Elimina un evento. |

Las rutas protegidas pasan por la cadena `passportCall('current')` → `requireAuth` → `authorization([...])` antes de llegar al controller.

**Reglas de negocio**

- La fecha del evento debe ser posterior a la fecha actual.
- Un organizer no puede tener dos eventos con el mismo título. La comparación normaliza el título (minúsculas y sin espacios en los extremos), y el título se guarda normalizado en la base.
- El `organizer` del evento se asigna a partir del usuario autenticado; cualquier `organizer` enviado en el body se ignora.
- En el `PUT` alcanza con enviar al menos uno de los campos `title`, `description` o `date`.

**POST /api/events**

```json
{
  "title": "El fantasma de la ópera",
  "description": "Se trata de un fantasma",
  "date": "2030-05-20"
}
```

- **201**: `{ "status": "success", "payload": { "title": "...", "description": "...", "date": "...", "organizer": "..." } }`
- **400**: faltan campos, la fecha no es futura o el título ya existe para ese organizer.
- **401**: sin sesión válida.
- **403**: rol `user`.

**PUT /api/events/:eid**

```json
{
  "title": "El fantasma de la ópera (reestreno)"
}
```

- **200**: `{ "status": "success", "payload": { "title": "...", "description": "...", "date": "...", "organizer": "..." } }`
- **400**: no se envió ningún campo, un campo viene vacío, la fecha no es futura, el título ya existe para ese organizer o el `eid` no tiene un formato válido.
- **401**: sin sesión válida.
- **403**: rol `user`, o evento que pertenece a otro organizer.
- **404**: el evento no existe.

**DELETE /api/events/:eid**

- **200**: devuelve el evento eliminado en `payload`.
- **400**: el `eid` no tiene un formato válido.
- **401**: sin sesión válida.
- **403**: rol `user`, o evento que pertenece a otro organizer.
- **404**: el evento no existe.

### SESSIONS

El contrato de las rutas de registro, login, `current` y logout no cambió respecto a entregas anteriores. Lo que cambió es que ahora se resuelven mediante Passport.

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| POST | `/api/sessions/register` | Público (estrategia `register`) | Registra un nuevo usuario. |
| POST | `/api/sessions/login` | Público (estrategia `login`) | Inicia sesión y setea la cookie `currentUser` con el JWT. |
| GET | `/api/sessions/current` | Autenticado (estrategia `current`) | Devuelve los datos del usuario autenticado. |
| POST | `/api/sessions/logout` | No requiere Passport | Elimina la cookie de sesión. |
| GET | `/api/sessions/listUsers` | Solo `admin` | Devuelve todos los usuarios de la base de datos. |

**POST /api/sessions/register**

```json
{
  "first_name": "Cosme",
  "last_name": "Fulanito",
  "email": "cosmefulanito@gmail.com",
  "password": "1122334455"
}
```

- **201**: `{ "status": "success", "payload": { "_id": "...", "first_name": "...", "last_name": "...", "email": "...", "role": "user" } }`
- **401**: campos faltantes, email con formato inválido o email ya registrado: `{ "status": "error", "message": "..." }`

**POST /api/sessions/login**

```json
{
  "email": "cosmefulanito@gmail.com",
  "password": "1122334455"
}
```

- **200**: setea la cookie `currentUser` (`HttpOnly`, `SameSite=Lax`, `Max-Age` según `JWT_EXPIRES_IN`) y responde `{ "status": "success", "message": "Login exitoso" }`
- **401**: email inexistente o contraseña incorrecta (mismo mensaje en ambos casos): `{ "status": "error", "message": "Credenciales inválidas" }`

**GET /api/sessions/current**

Requiere la cookie `currentUser` de un login previo.

- **200**: `{ "status": "success", "payload": { "id": "...", "first_name": "...", "last_name": "...", "email": "...", "role": "user" } }`
- **401**: sin cookie, token inválido o vencido, o usuario que ya no existe.

**POST /api/sessions/logout**

- **200**: elimina la cookie `currentUser` y responde `{ "status": "success", "message": "Logout exitoso" }`

**GET /api/sessions/listUsers**

Requiere la cookie `currentUser` de un usuario con rol `admin`. La respuesta nunca incluye el campo `password`.

- **200**: `{ "status": "success", "payload": [ { "first_name": "...", "last_name": "...", "email": "...", "role": "..." } ] }`
- **401**: sin sesión válida.
- **403**: rol `user` u `organizer`.

## Manejo de errores

El `errorHandler` centraliza los errores inesperados que llegan desde los controllers (todos envueltos con `asyncHandler`):

| Situación | Código | Mensaje |
|---|---|---|
| `eid` con formato inválido (`CastError` de Mongoose) | 400 | `El ID proporcionado no es válido` |
| Violación de reglas del schema (`ValidationError`) | 400 | Detalle de los campos inválidos |
| Índice único duplicado (código 11000) | 400 | `No puedes usar esas credenciales` |
| Cualquier otro error | 500 | `Error interno del servidor` (el detalle se registra solo en el log del servidor) |

## Casos de prueba cumplidos

Los archivos `.http` y las capturas están en `src/test/`.

- [x] `POST /api/events` con rol `user` → 403 Forbidden
- [x] `POST /api/events` con rol `organizer` → 201 Created
- [x] `GET /api/sessions/listUsers` con rol `organizer` → 403 Forbidden
- [x] `GET /api/sessions/listUsers` con rol `admin` → 200 OK
- [x] Ruta privada sin cookie → 401 Unauthorized
- [x] `organizer` intentando modificar o eliminar un evento ajeno → 403 Forbidden

## Autor

Meier Leandro Agustín - Analista de Sistemas
