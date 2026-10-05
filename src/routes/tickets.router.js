import { Router } from "express";

import { getMyTickets, cancelTicket } from "../controllers/tickets.controller.js";


import { passportCall } from "../middlewares/passportCall.middleware.js";
import { requireAuth } from "../middlewares/requireAuth.middleware.js";
import { authorization } from "../middlewares/authorization.middleware.js";

const router = Router();

router.get('/my-tickets',
    passportCall('current'),
    requireAuth,
    getMyTickets,
);

router.patch('/:tid/cancel',
    passportCall('current'),
    requireAuth,
    cancelTicket
);

export default router;