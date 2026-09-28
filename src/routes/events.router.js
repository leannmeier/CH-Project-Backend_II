import passport from "passport";
import { Router } from "express";

import { getEvents, addEvent, updateEvent, deleteEvent } from "../controllers/events.controller.js";

import { authorization } from '../middlewares/authorization.middleware.js';
import { passportCall } from "../middlewares/passportCall.middleware.js";
import { requireAuth } from "../middlewares/requireAuth.middleware.js";
import { validateEvent } from "../middlewares/validateEvent.middleware.js";
import { validateUpdateEvent } from "../middlewares/validateUpdateEvent.middleware.js";

const router = Router();

router.get('/', getEvents);

// Ruta para un 'user'
router.post('/', 
    passportCall('current'),// Verifico si se encuentra autenticado
    requireAuth, // Una vez ya autenticado, verifico si se encuentra autorizado para realizar la petición
    authorization(['organizer', 'admin']), // Autenticado y autorizado, resta verificar el contenido de req.body
    validateEvent, // podria decirse que este metodo validara lo que este en req.body
    addEvent
);

// Ruta para un 'organizer'
router.put('/:eid',
    passportCall('current'),
    requireAuth,
    authorization(['organizer', 'admin']),
    validateUpdateEvent,
    updateEvent
);

// Ruta para un admin (y para los organizer dueños de sus propios eventos)
router.delete('/:eid',
    passportCall('current'),
    requireAuth,
    authorization(['organizer','admin']),
    deleteEvent
)

export default router;