import { createServer } from "node:http";
import { connectDB } from "./config/database.config.js";
import  { app } from './app.js';

import config from './config/env.config.js'

const server = createServer(app);

const startServer = async () => {
    await connectDB();
    server.listen(config.port, () => {
        console.log(`Servidor corriendo en el puerto http://localhost:${config.port}`);
    });
};

startServer();

