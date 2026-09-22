import passport from 'passport';
import { Router } from "express";

import { registerUser, loginUser, getCurrentUser, logoutUser } from "../controllers/sessions.controller.js";
import { passportCall } from '../utils/passportCall.js';
import { requireAuth } from '../utils/requireAuth.js';

const router = Router();

router.post('/register', passportCall('register'), requireAuth, registerUser);
router.post('/login', passportCall('login'), requireAuth, loginUser);
router.get('/current', passportCall('current'), requireAuth, getCurrentUser);
router.post('/logout', logoutUser);

export default router;