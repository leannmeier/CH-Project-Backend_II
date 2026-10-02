# Plataforma de Eventos

## Descripción

Backend de una plataforma de gestión de eventos e inscripciones, desarrollado como proyecto final del curso Backend II de Coderhouse.

El proyecto cuenta con una **arquitectura en capas desacoplada** (Router, Middleware, Controller, Service, Repository, DAO y Modelos) conectada a MongoDB Atlas. La autenticación y autorización están integradas mediante **Passport.js** y JWT en cookies `HttpOnly`, con estrategias para registro, inicio de sesión y sesión activa (`current`), y un sistema de **control de acceso basado en roles (RBAC)** para `user`, `organizer` y `admin`.

A partir de esta entrega, `Event` pasa a ser una entidad real del dominio: tiene categoría, ubicación, capacidad, precio y un ciclo de vida de estados (`draft` → `published` → `cancelled`/`finished`), con reglas de negocio propias y un listado con filtros, paginación y ordenamiento.

## Matriz de Permisos (RBAC)

| Acción | `user` | `organizer` | `admin` | Endpoint |
|---|:---:|:---:|:---:|---|
| **Consultar eventos (lista y detalle)** | ✅ | ✅ | ✅ | `GET /api/events`, `GET /api/events/:id` |
| **Crear eventos** | ❌ | ✅ | ✅ | `POST /api/events` |
| **Modificar eventos propios** | ❌ | ✅ | ✅ | `PUT /api/events/:eid` |
| **Cambiar el estado de eventos propios** | ❌ | ✅ | ✅ | `PATCH /api/events/:eid/status` |
| **Modificar / cambiar estado de cualquier evento** | ❌ | ❌ | ✅ | `PUT` / `PATCH .../status` |
| **Ver todos los usuarios (ruta admin)** | ❌ | ❌ | ✅ | `GET /api/sessions/listUsers` |

> **IMPORTANTE:** el modelo de usuario asigna por defecto el rol `user`. El registro público no permite auto-asignarse los roles `admin` u `organizer` desde el `req.body`. Del mismo modo, el `organizer` de un evento nunca se toma del body: sale siempre del usuario autenticado.

## Autenticación vs. Autorización (401 y 403)

1. **`401 Unauthorized`**: no hay una sesión válida (sin cookie, JWT vencido/inválido, o usuario ya no existe). Manejado por `passportCall('current')` y `requireAuth`.
2. **`403 Forbidden`**: hay sesión, pero el rol no alcanza, o el evento pertenece a otro organizer. Manejado por `authorization([...roles])` y las validaciones de propiedad en la capa de servicio.

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

```bash
git clone https://github.com/leannmeier/CH-Project-Backend_II.git
cd "CH-Project-Backend_II"
pnpm install
```

Requiere Node.js v20 o superior.

## Variables de Entorno

```
PORT=1234
NODE_ENV=development
MONGO_URL=tu_url_de_mongodb
JWT_SECRET=una-cadena-larga-y-aleatoria-que-vos-generes
JWT_EXPIRES_IN=tiempo_de_expiracion_del_token_en_segundos
```

```bash
cp .env.example .env
```

`MONGO_URL` corresponde a un cluster de [MongoDB Atlas](https://www.mongodb.com/cloud/atlas), con el acceso habilitado desde *Network Access*. La aplicación valida al iniciar que las variables críticas estén presentes y que la conexión a MongoDB sea exitosa antes de aceptar peticiones (patrón *fail-fast*).

## ¿Cómo ejecutarlo?

```bash
pnpm start   # ejecuta el proyecto
pnpm dev     # ejecuta el proyecto con reinicio automático ante cambios (node --watch)
```

El servidor queda disponible en `http://localhost:<PORT>`.

## Autenticación con Passport.js

Toda la lógica de autenticación está centralizada en `src/config/passport.config.js`. Implementa tres estrategias: `register` y `login` (`passport-local`), y `current` (`passport-jwt`, con un extractor personalizado que lee el JWT desde la cookie `currentUser` en vez del header `Authorization`). Se invocan a través del middleware reutilizable `passportCall`, que permite devolver mensajes de error específicos en vez del 401 genérico de Passport.

## Estructura de carpetas
```
```
backend-turnos-reservas/
├── src/
│   ├── app.js
│   ├── server.js
│   ├── config/
│   │   ├── database.config.js
│   │   ├── env.config.js
│   │   └── passport.config.js
│   ├── constants/
│   │   └── event.constants.js
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
│   │   ├── validatePatchEvent.middleware.js
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
│   │   ├── 06.api-prueba.http
│   │   └── (CASOS DE PRUEBA).png
│   └── utils/
│       ├── hash.js
│       ├── jwt.js
│       └── printEvent.js
├── .env.example
├── .gitignore
├── package.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
└── README.md
```

## El modelo Event

```javascript
{
  title: String,        // obligatorio
  description: String,  // obligatorio
  category: String,     // obligatorio, texto libre (no tiene un enum cerrado en esta entrega)
  date: Date,            // obligatorio, debe ser futura al crear
  location: String,     // obligatorio
  capacity: Number,     // obligatorio, > 0
  price: Number,        // obligatorio, >= 0 (0 = evento gratuito)
  status: String,        // enum: draft | published | cancelled | finished — default: draft
  organizer: ObjectId   // referencia a User, nunca viene del body
}
```

Los valores de `status` y `category` están centralizados en `src/constants/event.contants.js`, para que el modelo y la capa de servicio los importen del mismo lugar sin duplicar la lista.

### Reglas de negocio (en `events.service.js`, no en rutas ni controllers)

- La fecha debe ser posterior a la fecha actual al crear.
- Un organizer no puede tener dos eventos con el mismo título (comparación normalizada, insensible a mayúsculas y espacios).
- Un evento con `status: cancelled` no puede modificarse de ninguna forma (ni `PUT` ni `PATCH`).
- No se puede cambiar el `status` a `published` si el estado actual es `finished`.
- Cancelar un evento es un cambio de `status` a `cancelled` (vía `PATCH .../status`); los eventos no se eliminan físicamente de la base.

## Endpoints

Éxito: `{ "status": "success", "payload": {} }` — Error: `{ "status": "error", "message": "" }`

### HEALTH

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/health` | Confirma que el servidor está activo. |

### EVENTS

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/api/events` | Público | Lista eventos, con filtros, paginación y ordenamiento. |
| GET | `/api/events/:id` | Público | Detalle de un evento. |
| POST | `/api/events` | `organizer`, `admin` | Crea un evento. |
| PUT | `/api/events/:eid` | Dueño o `admin` | Reemplaza el evento: requiere **todos** los campos (`title`, `description`, `category`, `date`, `location`, `capacity`, `price`). No modifica `status`. |
| PATCH | `/api/events/:eid/status` | Dueño o `admin` | Cambia únicamente el `status`. |

**Filtros de `GET /api/events`** (todos opcionales, combinables):

| Parámetro | Ejemplo | Notas |
|---|---|---|
| `status` | `?status=published` | Debe ser uno de los 4 valores del enum, o 400. |
| `category` | `?category=workshop` | Texto libre, sin validación de enum. |
| `location` | `?location=buenos aires` | Búsqueda parcial, insensible a mayúsculas. |
| `dateFrom` / `dateTo` | `?dateFrom=2030-01-01&dateTo=2030-12-31` | Rango de fechas; formato inválido → 400. |
| `page` / `limit` | `?page=2&limit=5` | Default `page=1`, `limit=10`. `limit` tiene un tope de 100. |
| `sort` | `?sort=date:desc` | Formato `campo:asc`/`campo:desc`. Default: `createdAt:-1`. |

Respuesta de la lista:

```json
{
  "status": "success",
  "payload": {
    "data": [ /* eventos */ ],
    "page": 1,
    "limit": 10,
    "total": 23,
    "totalPages": 3
  }
}
```

**POST /api/events**

```json
{
  "title": "Conferencia de IA",
  "description": "Explorando el futuro de la inteligencia artificial",
  "category": "conference",
  "date": "2030-07-16",
  "location": "Auditorio Principal, Ciudad de Buenos Aires",
  "capacity": 200,
  "price": 100
}
```

- **201**: evento creado, con `status: draft` por defecto.
- **400**: campos faltantes o inválidos (fecha pasada, `capacity <= 0`, `price < 0`, título duplicado para ese organizer).
- **401**: sin sesión válida. **403**: rol `user`.

**PUT /api/events/:eid**

Mismo body que `POST`, con los 7 campos obligatorios (no incluye `status`).

- **200**: evento actualizado. **400**: falta algún campo, dato inválido, título duplicado, o `eid` con formato inválido.
- **401** / **403** (rol o evento ajeno) / **404** (no existe).

**PATCH /api/events/:eid/status**

```json
{ "status": "published" }
```

- **200**: evento con el nuevo estado.
- **400**: `status` ausente, fuera del enum, el evento está `cancelled`, o se intenta publicar un evento `finished`.
- **401** / **403** / **404**.

### SESSIONS

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| POST | `/api/sessions/register` | Público | Registra un nuevo usuario. |
| POST | `/api/sessions/login` | Público | Inicia sesión y setea la cookie `currentUser`. |
| GET | `/api/sessions/current` | Autenticado | Devuelve los datos del usuario autenticado. |
| POST | `/api/sessions/logout` | — | Elimina la cookie de sesión. |
| GET | `/api/sessions/listUsers` | Solo `admin` | Lista todos los usuarios (sin el campo `password`). |

## Manejo de errores

| Situación | Código |
|---|---|
| `id`/`eid` con formato inválido (`CastError`) | 400 |
| Violación de reglas del schema (`ValidationError`) | 400 |
| Índice único duplicado | 400 |
| Rol insuficiente o recurso ajeno | 403 |
| Sin sesión válida | 401 |
| Recurso inexistente | 404 |
| Cualquier otro error | 500 (el detalle se registra solo en el log del servidor) |

## Casos de prueba cumplidos

- [x] Crear evento con rol `user` → 403
- [x] Crear evento con fecha pasada → 400
- [x] Crear evento con `capacity: 0` → 400
- [x] `organizer` modifica evento propio → éxito
- [x] `organizer` modifica evento ajeno → 403
- [x] `admin` modifica evento de otro organizador → éxito
- [x] Cambiar estado de un evento cancelado → 400
- [x] Listar con filtros combinados (`?status=published&category=...&page=2&limit=5`)
- [x] Consultar evento inexistente → 404 (y `id` con formato inválido → 400)

## Autor

Meier Leandro Agustín - Analista de Sistemas
