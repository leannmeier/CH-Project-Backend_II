import express from 'express';
import cookieParser from 'cookie-parser';

import eventsRouter from './routes/events.router.js';
import healthsRouter from './routes/healths.router.js';
import sessionsRouter from './routes/sessions.router.js';

import { errorHandler } from './middlewares/errorHandler.js';

const app = express();

app.use(express.json());
app.disable('x-powered-by');

app.use(cookieParser());

app.use('/api/health', healthsRouter);
app.use('/api/events', eventsRouter);
app.use('/api/sessions', sessionsRouter);

app.use(errorHandler);

export { app };