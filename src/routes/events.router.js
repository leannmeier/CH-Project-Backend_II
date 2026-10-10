import { Router } from "express";

import { getEvents, getEvent, createEvent, updateEvent, patchEvent, getTickets } from "../controllers/events.controller.js";
import { createTicket } from "../controllers/tickets.controller.js";

import { authorization } from '../middlewares/authorization.middleware.js';
import { passportCall } from "../middlewares/passportCall.middleware.js";
import { requireAuth } from "../middlewares/requireAuth.middleware.js";
import { validateEvent } from "../middlewares/validateEvent.middleware.js";
import { validateUpdateEvent } from "../middlewares/validateUpdateEvent.middleware.js";
import { validatePatchEvent } from '../middlewares/validatePatchEvent.middleware.js';
import { validateTicket } from "../middlewares/validateTicket.middleware.js";

const router = Router();

// Rutas públicas
router.get('/', getEvents);
router.get('/:eid', getEvent);

// Rutas privadas
router.post('/', // Listo 
    passportCall('current'),
    requireAuth,
    authorization(['organizer', 'admin']),
    validateEvent,
    createEvent
);

router.put('/:eid',
    passportCall('current'),
    requireAuth,
    authorization(['organizer', 'admin']),
    validateUpdateEvent,
    updateEvent
);

router.patch('/:eid/status',
    passportCall('current'),
    requireAuth,
    authorization(['organizer','admin']),
    validatePatchEvent,
    patchEvent
)

// Ruta para crear un ticket para un evento especifico
router.post('/:eid/tickets',
    passportCall('current'),
    requireAuth,
    validateTicket,
    createTicket
);

router.get('/:eid/tickets',
    passportCall('current'),
    requireAuth,
    authorization(['organizer', 'admin']),
    getTickets
);

export default router;