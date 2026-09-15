import { Router } from "express";
import { registerUser, loginUser, getCurrentUser, logoutUser } from "../controllers/sessions.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/current', authMiddleware, getCurrentUser);
router.post('/logout', authMiddleware, logoutUser);

export default router;