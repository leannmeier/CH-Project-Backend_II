# Plataforma de Eventos — API Backend

## Descripción

API REST para una plataforma de gestión de eventos e inscripciones, desarrollada como proyecto final del curso **Programación Backend II: Diseño y Arquitectura Backend** (Coderhouse).

Permite registrar usuarios, autenticarlos con JWT en cookies `HttpOnly`, publicar y administrar eventos según el rol (`user`, `organizer`, `admin`), inscribirse a eventos con control de cupos y recibir un email de confirmación.

## Tecnologías

- Node.js (ESM, v20+) y Express
- MongoDB Atlas y Mongoose
- Passport.js (`passport`, `passport-local`, `passport-jwt`)
- JWT (`jsonwebtoken`) y `cookie-parser`
- `bcrypt` para el hash de contraseñas
- Nodemailer (SMTP) para las notificaciones
- `dotenv` y `pnpm`

## Instalación

```bash
git clone https://github.com/leannmeier/CH-Project-Backend_II.git
cd CH-Project-Backend_II
pnpm install
cp .env.example .env
```

Completá el `.env` (ver la sección siguiente) y ejecutá:

```bash
pnpm start   # ejecuta la API
pnpm dev     # ejecuta la API con reinicio automático (node --watch)
```

El servidor queda disponible en `http://localhost:<PORT>`.

## Variables de entorno

| Variable | Descripción |
|---|---|
| `PORT` | Puerto del servidor |
| `NODE_ENV` | `development` o `production` (con `production` la cookie se marca `secure`) |
| `MONGO_URL` | Cadena de conexión a MongoDB (por ejemplo, un cluster de Atlas con acceso habilitado desde *Network Access*) |
| `JWT_SECRET` | Clave para firmar los JWT. Usá una cadena larga y aleatoria |
| `JWT_EXPIRES_IN` | Duración del token y de la cookie, **en segundos** |
| `MAIL_HOST`, `MAIL_PORT` | Servidor SMTP |
| `MAIL_USER`, `MAIL_PASS` | Credenciales SMTP |
| `MAIL_FROM` | Remitente que verá el usuario |

Para probar los emails sin enviar mails reales se puede usar el SMTP de sandbox de [Mailtrap](https://mailtrap.io) (pestaña *Integración → SMTP*, no la API con token).

Al iniciar, la aplicación valida que las variables críticas estén definidas y que la conexión a MongoDB funcione antes de aceptar peticiones (*fail-fast*). Ninguna credencial está escrita en el código.

## Arquitectura

La API está organizada en capas, y cada una tiene una única responsabilidad:

| Capa | Responsabilidad |
|---|---|
| **Router** | Define las rutas y la cadena de middlewares de cada una. |
| **Middleware** | Autenticación (401), autorización por rol (403), validación de formato del body y manejo centralizado de errores. |
| **Controller** | Coordina request y response: toma los datos de la petición, llama al service y devuelve la respuesta ya transformada por un DTO. No contiene reglas de negocio ni importa modelos. |
| **Service** | Concentra la lógica de negocio: cupos, estados, duplicados, permisos de propiedad, validaciones de registro y login, envío de email. Solo habla con repositories. |
| **Repository** | Ofrece operaciones con el lenguaje del dominio (por ejemplo `findByEmail`, `findConfirmedTicketByUserAndEvent`), sin exponer cómo se guardan los datos. |
| **DAO** | Es la única capa que importa los modelos de Mongoose y ejecuta las consultas. |
| **DTO** | Define exactamente qué campos de usuario, evento y ticket salen en las respuestas. |
| **Model** | Esquemas de Mongoose. |

Flujo de una petición: `router → middlewares → controller → service → repository → dao → model`.
Flujo de la respuesta: `dao → repository → service → controller (aplica el DTO) → cliente`.

El módulo `sessions` agrupa la autenticación y la entidad usuario (modelo `User`).

### Estructura de carpetas

```
src/
├── app.js
├── server.js
├── config/          # database, env, passport, mailer
├── constants/       # estados, mensajes y reglas compartidas
├── controllers/
├── dao/
├── dto/
├── middlewares/
├── models/          # User, Event, Ticket
├── repositories/
├── routes/
├── services/
├── test/            # archivos .http y capturas de las pruebas
└── utils/           # hash, jwt, notificaciones por email
```

## Autenticación

Toda la lógica de autenticación está en `src/config/passport.config.js`, con tres estrategias:

- **`register`** (`passport-local`, sobre el campo `email`): delega las validaciones y el hasheo en `sessions.service`.
- **`login`** (`passport-local`): verifica las credenciales con bcrypt a través del service. No genera el token; eso lo hace el controller.
- **`current`** (`passport-jwt`): lee el JWT desde la cookie `currentUser`, lo valida y deja al usuario en `req.user`.

Las estrategias son adaptadores finos: la regla de negocio vive en el service y Passport solo traduce el resultado. Se invocan con el middleware `passportCall`, que permite devolver códigos y mensajes específicos en vez del 401 genérico de Passport.

**Flujo de autenticación**

1. `POST /api/sessions/register` crea el usuario con rol `user`. El rol nunca se toma del body.
2. `POST /api/sessions/login` valida las credenciales, genera un JWT con `{ id, email, role }` (nunca el password) y lo guarda en la cookie `currentUser` (`HttpOnly`, `SameSite=Lax`, `Secure` en producción, duración según `JWT_EXPIRES_IN`).
3. Las rutas privadas leen esa cookie. Sin cookie válida responden `401`.
4. `POST /api/sessions/logout` elimina la cookie.

Ninguna respuesta de la API incluye el campo `password`.

## Roles y permisos

| Acción | `user` | `organizer` | `admin` |
|---|:---:|:---:|:---:|
| Consultar eventos | ✅ | ✅ | ✅ |
| Inscribirse, ver y cancelar los propios tickets | ✅ | ✅ | ✅ |
| Crear eventos | ❌ | ✅ | ✅ |
| Modificar eventos / cambiar su estado | ❌ | Solo los propios | Cualquiera |
| Ver los tickets de un evento | ❌ | Solo de sus eventos | Cualquiera |
| Cancelar un ticket | Solo el propio | Solo el propio | Cualquiera |
| Listar todos los usuarios | ❌ | ❌ | ✅ |

El `organizer` de un evento y el `user` de un ticket nunca se toman del body: siempre salen del usuario autenticado.

### Usuarios de prueba

El registro público siempre crea usuarios con rol `user`, y no hay un endpoint para cambiar roles. Para probar los otros roles:

1. Registrá un usuario normalmente con `POST /api/sessions/register`.
2. En MongoDB (por ejemplo, desde Atlas → *Collections* → colección `users`), editá el campo `role` de ese usuario a `organizer` o `admin`.
3. Iniciá sesión con ese usuario.

## Endpoints

Éxito: `{ "status": "success", "payload": ... }` · Error: `{ "status": "error", "message": "..." }`

### Health y sesiones

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/api/health` | Público | Confirma que el servidor está activo. |
| POST | `/api/sessions/register` | Público | Registra un usuario. |
| POST | `/api/sessions/login` | Público | Inicia sesión y setea la cookie `currentUser`. |
| GET | `/api/sessions/current` | Autenticado | Devuelve el usuario de la sesión. |
| POST | `/api/sessions/logout` | Público | Elimina la cookie. |
| GET | `/api/sessions/listUsers` | `admin` | Lista todos los usuarios. |

### Eventos

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/api/events` | Público | Lista eventos con filtros, paginación y orden. |
| GET | `/api/events/:eid` | Público | Detalle de un evento. |
| POST | `/api/events` | `organizer`, `admin` | Crea un evento (queda en `draft`). |
| PUT | `/api/events/:eid` | Dueño o `admin` | Reemplaza el evento: requiere todos los campos (`title`, `description`, `category`, `date`, `location`, `capacity`, `price`). No modifica `status`. |
| PATCH | `/api/events/:eid/status` | Dueño o `admin` | Cambia solo el estado. |
| POST | `/api/events/:eid/tickets` | Autenticado | Inscribe al usuario al evento. |
| GET | `/api/events/:eid/tickets` | Dueño del evento o `admin` | Lista los tickets de un evento. |

**Filtros de `GET /api/events`** (todos opcionales y combinables):

| Parámetro | Ejemplo | Notas |
|---|---|---|
| `status` | `?status=published` | `draft`, `published`, `cancelled` o `finished`; otro valor devuelve 400. |
| `category` | `?category=conference` | Texto libre. |
| `location` | `?location=buenos aires` | Búsqueda parcial, sin distinguir mayúsculas. |
| `dateFrom`, `dateTo` | `?dateFrom=2030-01-01&dateTo=2030-12-31` | Rango de fechas; formato inválido devuelve 400. |
| `page`, `limit` | `?page=2&limit=5` | Por defecto `1` y `10`; `limit` máximo 100. |
| `sort` | `?sort=date:desc` | `campo:asc` o `campo:desc`. Por defecto, los más recientes primero. |

Respuesta del listado:

```json
{
  "status": "success",
  "payload": { "data": [], "page": 1, "limit": 10, "total": 0, "totalPages": 1 }
}
```

### Tickets

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/api/tickets/my-tickets` | Autenticado | Tickets del usuario, con los datos básicos del evento. |
| PATCH | `/api/tickets/:tid/cancel` | Dueño del ticket o `admin` | Cancela el ticket (no lo elimina). |

## Reglas de negocio

**Eventos**
- La fecha debe ser posterior a la actual; `capacity > 0` y `price ≥ 0`.
- Un organizer no puede tener dos eventos con el mismo título (comparación sin distinguir mayúsculas ni espacios).
- Un evento `cancelled` no puede modificarse, y uno `finished` no puede volver a `published`.
- Cancelar un evento es cambiar su `status`; los eventos no se eliminan.

**Inscripciones** (`POST /api/events/:eid/tickets`, body: `{ "quantity": 2 }`)
1. El evento existe y está `published`.
2. `quantity` es un número mayor a 0.
3. El usuario no tiene ya un ticket activo para ese evento.
4. Hay cupo: `capacity` menos la suma de `quantity` de los tickets `confirmed`. Los tickets `cancelled` no cuentan como cupo ocupado.

Si todo es válido, se genera un `reservationCode` único (`TKT-XXXX-XXXX-XXXX-XXXX`), se crea el ticket con estado `confirmed` y se envía el email de confirmación. Si el envío falla, el ticket queda creado igual y el error se registra en el log del servidor.

Al cancelar un ticket cambia su estado a `cancelled` y se registra `cancelledAt`; el cupo queda liberado automáticamente.

## Ejemplos de uso

```bash
# 1. Registro
curl -X POST http://localhost:1234/api/sessions/register \
  -H "Content-Type: application/json" \
  -d '{"first_name":"Ana","last_name":"Gomez","email":"ana@mail.com","password":"clave1234"}'

# 2. Login (guarda la cookie en cookies.txt)
curl -c cookies.txt -X POST http://localhost:1234/api/sessions/login \
  -H "Content-Type: application/json" \
  -d '{"email":"ana@mail.com","password":"clave1234"}'

# 3. Usuario actual
curl -b cookies.txt http://localhost:1234/api/sessions/current

# 4. Crear un evento (requiere rol organizer o admin)
curl -b cookies.txt -X POST http://localhost:1234/api/events \
  -H "Content-Type: application/json" \
  -d '{"title":"Conferencia de IA","description":"Charlas sobre IA","category":"conference","date":"2030-07-16","location":"Buenos Aires","capacity":100,"price":0}'

# 5. Publicar el evento
curl -b cookies.txt -X PATCH http://localhost:1234/api/events/<eid>/status \
  -H "Content-Type: application/json" -d '{"status":"published"}'

# 6. Inscribirse (desde la sesión de otro usuario)
curl -b cookies.txt -X POST http://localhost:1234/api/events/<eid>/tickets \
  -H "Content-Type: application/json" -d '{"quantity":2}'

# 7. Mis tickets y cancelación
curl -b cookies.txt http://localhost:1234/api/tickets/my-tickets
curl -b cookies.txt -X PATCH http://localhost:1234/api/tickets/<tid>/cancel
```

Los ids (`<eid>`, `<tid>`) vienen en el campo `id` de las respuestas. En `src/test/` hay archivos `.http` con más ejemplos.

## Códigos de error

| Código | Cuándo |
|---|---|
| `400` | Datos faltantes o inválidos, regla de negocio no cumplida, id con formato inválido |
| `401` | Sin sesión válida, token vencido o usuario inexistente; credenciales incorrectas en el login (el mismo mensaje para email inexistente y contraseña incorrecta) |
| `403` | Hay sesión pero el rol no alcanza, o el recurso pertenece a otro usuario |
| `404` | El recurso no existe |
| `409` | Conflicto con un dato existente: email ya registrado, título de evento repetido para el organizer, ticket activo duplicado |
| `500` | Error inesperado (el detalle solo se registra en el log del servidor) |

## Verificación del flujo completo

Las pruebas son manuales, con los archivos `.http` y las capturas de `src/test/`.

1. [x] Registro → login → `/current` → logout → `/current` devuelve 401
2. [x] `user` intenta crear un evento → 403
3. [x] `organizer` crea un evento → `user` se inscribe → email recibido → cupo descontado
4. [x] `user` intenta inscribirse de nuevo al mismo evento → error de duplicado
5. [x] `user` intenta inscribirse a un evento sin cupo → error claro
6. [x] `user` cancela su ticket → cupo liberado → una nueva inscripción funciona
7. [x] `organizer` intenta modificar un evento ajeno → 403
8. [x] `admin` modifica un evento de otro organizador → éxito
9. [x] Las respuestas de usuario, evento y ticket no contienen `password`
10. [x] `GET /api/events?status=published&page=2&limit=5` devuelve la estructura paginada

## Limitaciones conocidas

- **Concurrencia en los cupos:** la inscripción suma los cupos ocupados y después crea el ticket, en dos pasos. Dos inscripciones simultáneas al último lugar podrían superar la capacidad. Resolverlo requeriría transacciones o una operación atómica.
- No hay tests automatizados; las pruebas son manuales.
- Los emails se probaron con un SMTP de sandbox (Mailtrap).

## Autor

Meier Leandro Agustín — Analista de Sistemas
