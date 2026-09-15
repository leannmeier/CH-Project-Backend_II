# Plataforma de Eventos
## Descripción

Backend de una plataforma de gestión de eventos e inscripciones, desarrollado como proyecto final del curso Backend II de Coderhouse. A esta altura, el proyecto cuenta con la arquitectura base en capas (rutas, controladores, servicios, repositorios, DAO y modelos), conexión a MongoDB Atlas, registro de usuarios con contraseñas hasheadas con bcrypt, y autenticación completa con JWT: login, sesión persistida en cookie `HttpOnly` y logout. Los eventos todavía no tienen lógica de negocio implementada. En las próximas entregas se van a incorporar roles y autorización, gestión completa de eventos, tickets, inscripciones y control de cupos.
## Tecnologías utilizadas

- Node.js (ESM, v20+)
- Express
- MongoDB Atlas
- Mongoose
- dotenv
- bcrypt
- jsonwebtoken
- cookie-parser
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
pnpm start       # ejecuta el proyecto
pnpm dev     # ejecuta el proyecto con reinicio automático ante cambios (node --watch)
```

El servidor queda disponible en `http://localhost:<PORT>` (por defecto, `http://localhost:1234`).
## Estructura de carpetas
```
CH-Project-Backend_II/
├── src/
│   ├── app.js
│   ├── server.js
│   ├── config/
│   │   ├── database.config.js
│   │   └── env.config.js
│   ├── controllers/
│   │   ├── events.controller.js
│   │   ├── healths.controller.js
│   │   └── sessions.controller.js
│   ├── dao/
│   │   └── sessions.dao.js
│   ├── middlewares/
│   │   ├── auth.middleware.js
│   │   └── errorHandler.js
│   ├── models/
│   │   ├── Event.js
│   │   └── User.js
│   ├── repositories/
│   │   └── sessions.repository.js
│   ├── routes/
│   │   ├── events.router.js
│   │   ├── healths.router.js
│   │   └── sessions.router.js
│   ├── services/
│   │   └── sessions.service.js
│   ├── test/
│   │   ├── 03.api.http
│   |   └── (CASOS DE PRUEBA).png
│   └── utils/
│       ├── asyncHandler.js
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

Todas las respuestas siguen una estructura consistente:

```json
{ "status": "success", "payload": {} }
```

o, en caso de error:

```json
{ "status": "error", "message": "" }
```

### HEALTH

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/health` | Devuelve respuesta indicando que el servidor está activo. |

### EVENTS
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/events` | Devuelve respuesta sobre los eventos. Actualmente devuelve solo un array vacío. |

### SESSIONS

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| POST | `/api/sessions/register` | No | Registra un nuevo usuario. |
| POST | `/api/sessions/login` | No | Inicia sesión y setea la cookie `currentUser` con el JWT. |
| GET | `/api/sessions/current` | Sí (cookie) | Devuelve los datos del usuario autenticado. |
| POST | `/api/sessions/logout` | No | Elimina la cookie de sesión. |

**POST /api/sessions/register**

```json
{
  "first_name": "Cosme",
  "last_name": "Fulanito",
  "email": "cosmefulanito@gmail.com",
  "password": "1122334455"
}
```

La contraseña se hashea con bcrypt antes de guardarse y nunca se devuelve en la respuesta.

- **201**: `{ "status": "success", "payload": { "first_name": "...", "last_name": "...", "email": "...", "role": "user", "_id": "...", "createdAt": "...", "updatedAt": "..." } }`
- **400** — campos faltantes, email con formato inválido o email ya registrado: `{ "status": "error", "message": "..." }`

**POST /api/sessions/login**

```json
{
  "email": "cosmefulanito@gmail.com",
  "password": "1122334455"
}
```

- **200**: setea la cookie `currentUser` (`HttpOnly`, `SameSite=Lax`, `Max-Age` según `JWT_EXPIRES_IN`) y responde `{ "status": "success", "message": "Login exitoso" }`
- **401** — email inexistente o contraseña incorrecta (mismo mensaje en ambos casos, para no revelar cuál falló): `{ "status": "error", "message": "Credenciales inválidas" }`

**GET /api/sessions/current**

Requiere la cookie `currentUser` de un login previo.

- **200**: `{ "status": "success", "payload": { "id": "...", "email": "...", "role": "user" } }`
- **401** — sin cookie, o con un token inválido/modificado/expirado: `{ "status": "error", "message": "No autorizado" }` o `{ "status": "error", "message": "Token inválido o expirado" }`

**POST /api/sessions/logout**

- **200**: elimina la cookie `currentUser` y responde `{ "status": "success", "message": "Logout exitoso" }`
## Autor

Meier Leandro Agustín - Analista de Sistemas