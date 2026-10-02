import passport from "passport";
import { Router } from "express";

import { getEvents, getEvent, addEvent, updateEvent, patchEvent } from "../controllers/events.controller.js";

import { authorization } from '../middlewares/authorization.middleware.js';
import { passportCall } from "../middlewares/passportCall.middleware.js";
import { requireAuth } from "../middlewares/requireAuth.middleware.js";
import { validateEvent } from "../middlewares/validateEvent.middleware.js";
import { validateUpdateEvent } from "../middlewares/validateUpdateEvent.middleware.js";
import { validatePatchEvent } from '../middlewares/validatePatchEvent.middleware.js';

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
    addEvent
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

export default router;