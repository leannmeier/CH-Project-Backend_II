# Plataforma de Eventos

## Descripción

Backend de una plataforma de gestión de eventos e inscripciones, desarrollado como proyecto final del curso Backend II de Coderhouse.

El proyecto cuenta con una **arquitectura en capas desacoplada** (Router, Middleware, Controller, Service, Repository, DAO y Modelos) conectada a MongoDB Atlas, autenticación con **Passport.js** (JWT en cookies `HttpOnly`), control de acceso por roles (`user`, `organizer`, `admin`), gestión completa de eventos con filtros y estados, y ahora un **sistema de inscripciones con control de cupos y notificaciones por email**.

## Matriz de Permisos (RBAC)

| Acción | `user` | `organizer` | `admin` | Endpoint |
|---|:---:|:---:|:---:|---|
| Consultar eventos | ✅ | ✅ | ✅ | `GET /api/events`, `GET /api/events/:id` |
| Crear / modificar eventos propios | ❌ | ✅ | ✅ | `POST /api/events`, `PUT /api/events/:eid` |
| Cambiar estado de eventos propios | ❌ | ✅ | ✅ | `PATCH /api/events/:eid/status` |
| Modificar / cambiar estado de cualquier evento | ❌ | ❌ | ✅ | ídem, sobre eventos ajenos |
| Ver todos los usuarios | ❌ | ❌ | ✅ | `GET /api/sessions/listUsers` |
| Inscribirse a un evento | ✅ | ✅ | ✅ | `POST /api/events/:eid/tickets` |
| Ver los propios tickets | ✅ | ✅ | ✅ | `GET /api/tickets/my-tickets` |
| Cancelar un ticket propio | ✅ | ✅ | ✅ | `PATCH /api/tickets/:tid/cancel` |
| Cancelar cualquier ticket | ❌ | ❌ | ✅ | ídem, sobre tickets ajenos |
| Ver los tickets de un evento propio | ❌ | ✅ | ✅ | `GET /api/events/:eid/tickets` |
| Ver los tickets de cualquier evento | ❌ | ❌ | ✅ | ídem, sobre eventos ajenos |

> El `organizer` de un evento y el `user` de un ticket nunca se toman del body — siempre salen del usuario autenticado (`req.user`).

## Autenticación vs. Autorización (401 y 403)

- **`401`**: no hay sesión válida (sin cookie, JWT vencido/inválido, usuario inexistente).
- **`403`**: hay sesión, pero el rol no alcanza, o el recurso (evento o ticket) pertenece a otro usuario.

## Tecnologías utilizadas

- Node.js (ESM, v20+), Express, MongoDB Atlas, Mongoose, dotenv
- bcrypt, jsonwebtoken, cookie-parser
- Passport.js (`passport`, `passport-local`, `passport-jwt`)
- Nodemailer (notificaciones por email, vía SMTP de Mailtrap)

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
MAIL_HOST=tu_host_smtp
MAIL_PORT=tu_puerto_smtp
MAIL_USER=tu_usuario_smtp
MAIL_PASS=tu_contraseña_smtp
MAIL_FROM=direccion_remitente_que_vera_el_usuario
```

```bash
cp .env.example .env
```

`MONGO_URL` corresponde a un cluster de [MongoDB Atlas](https://www.mongodb.com/cloud/atlas), con el acceso habilitado desde *Network Access*. Las variables `MAIL_*` corresponden a las credenciales SMTP de un servidor de pruebas como [Mailtrap](https://mailtrap.io) (pestaña "Integración" → SMTP, no la API con token). La aplicación valida al iniciar que las variables críticas estén presentes y que la conexión a MongoDB sea exitosa antes de aceptar peticiones (patrón *fail-fast*).

## ¿Cómo ejecutarlo?

```bash
pnpm start   # ejecuta el proyecto
pnpm dev     # ejecuta el proyecto con reinicio automático ante cambios (node --watch)
```

## Autenticación con Passport.js

Centralizada en `src/config/passport.config.js`, con tres estrategias: `register` y `login` (`passport-local`), y `current` (`passport-jwt`, con un extractor que lee el JWT desde la cookie `currentUser`). Se invocan a través del middleware `passportCall`, que permite devolver mensajes de error específicos.

## Estructura de carpetas

```
CH-Project-Backend_II
├── src/
│   ├── app.js
│   ├── server.js
│   ├── config/
│   │   ├── database.config.js
│   │   ├── env.config.js
│   │   ├── mailer.config.js
│   │   └── passport.config.js
│   ├── constants/
│   │   ├── event.constants.js
│   │   └── ticket.constants.js
│   ├── controllers/
│   │   ├── events.controller.js
│   │   ├── healths.controller.js
│   │   ├── sessions.controller.js
│   │   └── tickets.controller.js
│   ├── dao/
│   │   ├── events.dao.js
│   │   ├── sessions.dao.js
│   │   └── tickets.dao.js
│   ├── middlewares/
│   │   ├── asyncHandler.middleware.js
│   │   ├── authorization.middleware.js
│   │   ├── errorHandler.middleware.js
│   │   ├── passportCall.middleware.js
│   │   ├── requireAuth.middleware.js
│   │   ├── validateEvent.middleware.js
│   │   ├── validateTicket.middleware.js
│   │   ├── validatePatchEvent.middleware.js
│   │   └── validateUpdateEvent.middleware.js
│   ├── models/
│   │   ├── Event.js
│   │   ├── Ticket.js
│   │   └── User.js
│   ├── repositories/
│   │   ├── events.repository.js
│   │   ├── sessions.repository.js
│   │   └── tickets.repository.js
│   ├── routes/
│   │   ├── events.router.js
│   │   ├── healths.router.js
│   │   ├── sessions.router.js
│   │   └── tickets.router.js
│   ├── services/
│   │   ├── events.service.js
│   │   ├── sessions.service.js
│   │   └── tickets.service.js
│   ├── test/
│   │   ├── 07.api-prueba.http
│   │   └── (CASOS DE PRUEBA).png
│   └── utils/
│       ├── hash.js
│       ├── jwt.js
│       ├── notifyConfirmation.js
│       ├── printfEvent.js
│       └── printTicket.js
├── .env.example
├── .gitignore
├── package.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
└── README.md
```

## El modelo Event (resumen)

`title`, `description`, `category`, `date`, `location`, `capacity` (> 0), `price` (≥ 0), `status` (`draft` | `published` | `cancelled` | `finished`, default `draft`), `organizer` (referencia a `User`).

## El modelo Ticket

```javascript
{
  user: ObjectId,            // referencia a User, obligatorio
  event: ObjectId,           // referencia a Event, obligatorio
  status: String,             // enum: confirmed | pending | cancelled — obligatorio
  quantity: Number,          // obligatorio, > 0
  reservationCode: String,   // único, formato TKT-XXXX-XXXX-XXXX-XXXX
  cancelledAt: Date,          // null hasta que se cancela
  createdAt: Date             // automático (timestamps)
}
```

Sin objetos embebidos: el ticket solo referencia a `User` y `Event` por `ObjectId`, nunca copia sus datos completos.

### Reglas de negocio de la inscripción (en `tickets.service.js`)

1. El evento referenciado existe.
2. El evento está en estado `published` (no `draft`, `cancelled` ni `finished`).
3. `quantity` es un número válido mayor a 0.
4. El usuario autenticado no tiene ya un ticket `confirmed` activo para ese evento (una inscripción por usuario y evento).
5. Hay cupo suficiente: se suma el `quantity` de todos los tickets `confirmed` de ese evento y se compara contra `event.capacity`. **Los tickets `cancelled` nunca cuentan como cupo ocupado.**

Si todas las validaciones pasan, se genera un `reservationCode` único (verificado contra la base antes de guardar), se crea el ticket con `status: confirmed`, y se envía un email de confirmación. Un fallo en el envío de email no afecta la respuesta de la inscripción (se registra en el log del servidor, pero el ticket ya quedó creado).

### Cancelación

`PATCH /api/tickets/:tid/cancel` cambia `status` a `cancelled` y registra `cancelledAt` — el documento **nunca se elimina**. Al no contar más como cupo ocupado, el lugar queda disponible automáticamente para una nueva inscripción. Solo puede cancelar el dueño del ticket o un `admin`; un ticket ya cancelado no puede volver a cancelarse.

## Endpoints

Éxito: `{ "status": "success", "payload": {} }` — Error: `{ "status": "error", "message": "" }`

### TICKETS

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| POST | `/api/events/:eid/tickets` | Autenticado | Crea una inscripción al evento `:eid`. |
| GET | `/api/tickets/my-tickets` | Autenticado | Lista los tickets del usuario autenticado. |
| GET | `/api/events/:eid/tickets` | Organizer dueño del evento, o admin | Lista los tickets de un evento puntual. |
| PATCH | `/api/tickets/:tid/cancel` | Dueño del ticket, o admin | Cancela un ticket. |

**POST /api/events/:eid/tickets**

```json
{ "quantity": 2 }
```

- **201**: ticket creado, `status: confirmed`, con `user` y `event` poblados.
- **400**: `quantity` ausente/inválido, evento no publicado o cancelado/finalizado, ya existe un ticket activo, o no hay cupo suficiente.
- **401**: sin sesión válida. **404**: el evento no existe.

**GET /api/tickets/my-tickets**

- **200**: lista de tickets del usuario autenticado, con el evento poblado (`title`, `date`, `location`). No expone datos de otros usuarios.

**GET /api/events/:eid/tickets**

- **200**: lista de tickets de ese evento.
- **403**: el solicitante no es el organizer dueño del evento ni admin.

**PATCH /api/tickets/:tid/cancel**

- **200**: ticket con `status: cancelled` y `cancelledAt` seteado.
- **400**: el ticket ya estaba cancelado.
- **403**: el ticket pertenece a otro usuario. **404**: el ticket no existe.

### EVENTS y SESSIONS

Sin cambios respecto a la Pre-entrega 6 (ver historial del repositorio para el detalle completo de esos endpoints).

## Notificaciones por email

Se envía un email de confirmación (vía Nodemailer, SMTP) cada vez que una inscripción se concreta con éxito, con el nombre del usuario, el título del evento y el código de reserva. Las credenciales SMTP se leen exclusivamente desde variables de entorno (`MAIL_HOST`, `MAIL_PORT`, `MAIL_USER`, `MAIL_PASS`, `MAIL_FROM`) — nunca hardcodeadas en el código.

## Manejo de errores

| Situación | Código |
|---|---|
| `id` con formato inválido (`CastError`) | 400 |
| Violación de reglas del schema / reglas de negocio | 400 |
| Índice único duplicado | 400 |
| Sin sesión válida | 401 |
| Rol insuficiente o recurso ajeno | 403 |
| Recurso inexistente | 404 |
| Cualquier otro error | 500 (detalle solo en el log del servidor) |

## Casos de prueba cumplidos

1. [x] Inscripción exitosa → email recibido
2. [x] Inscripción sin sesión → 401
3. [x] Inscripción a evento inexistente → 404
4. [x] Inscripción a evento cancelado/finalizado → error de negocio
5. [x] Inscripción sin cupo suficiente → error con mensaje claro
6. [x] Inscripción duplicada activa → error
7. [x] Cancelación propia → cupo liberado (nueva inscripción por ese cupo funciona)
8. [x] Cancelación de ticket ajeno como `user` → 403
9. [x] `GET /api/events/:eid/tickets` como `user` → 403
10. [x] `GET /api/events/:eid/tickets` como organizer de otro evento → 403

## Autor

Meier Leandro Agustín - Analista de Sistemas
