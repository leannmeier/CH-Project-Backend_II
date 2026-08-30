# Plataforma de Eventos
## Descripción

Backend de una plataforma de gestión de eventos e inscripciones. Esta primera entrega deja armada la base arquitectónica en capas (rutas, controladores, servicios, repositorios, DAO y modelos), la conexión a MongoDB Atlas y los primeros endpoints (`health`, `events`, `sessions`), todavía sin lógica de negocio. En las próximas entregas se van a incorporar autenticación con JWT y Passport, roles y autorización, gestión completa de eventos, tickets, inscripciones y control de cupos.
## Tecnologías utilizadas

- Node.js (ESM, v20+)
- Express
- MongoDB Atlas
- Mongoose
- dotenv
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
pnpm run dev     # ejecuta el proyecto con reinicio automático ante cambios (node --watch)
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
│   ├── middlewares/
│   │   └── errorHandler.js
│   ├── models/
│   │   ├── Event.js
│   │   └── User.js
│   ├── repositories/
│   ├── routes/
│   │   ├── events.router.js
│   │   ├── healths.router.js
│   │   └── sessions.router.js
│   ├── services/
│   ├── test/
│   |    └── 01.api.http
│   └── utils/
│       └── asyncHandler.js
├── .env.example
├── .gitignore
├── package.json
├── pnpm-lock.yaml
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
| GET | `/api/health` | Devuelve respuesta indicando que el servidor está activo.

### EVENTS
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/events` | Devuelve respuesta sobre los eventos. Actualmente devuelve solo un array vacio

### SESSIONS

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/sessions` | Devuelve respuesta sobre las sesiones. Actualmente devuelve solo un array vacio

Actualmente solo se dispone de estos endpoints. A medida que el proyecto continúa evolucionando, se incorporarán nuevas funcionalidades.
## Autor

Meier Leandro Agustín - Analista de Sistemas