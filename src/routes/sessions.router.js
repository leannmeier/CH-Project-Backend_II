import passport from 'passport';
import { Router } from "express";

import { registerUser, loginUser, getCurrentUser, logoutUser, listUsers } from "../controllers/sessions.controller.js";

import { passportCall } from '../middlewares/passportCall.middleware.js';
import { requireAuth } from '../middlewares/requireAuth.middleware.js';
import { authorization } from '../middlewares/authorization.middleware.js';

const router = Router();

router.post('/register', passportCall('register'), requireAuth, registerUser);
router.post('/login', passportCall('login'), requireAuth, loginUser);
router.get('/current', passportCall('current'), requireAuth, getCurrentUser);
router.post('/logout', logoutUser);

// Ruta solo para admin (listar a todos los usuarios)
router.get('/listUsers',
    passportCall('current'),
    requireAuth,
    authorization(['admin']),
    listUsers
)

export default router;