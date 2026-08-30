import { Router } from "express";
import { getStatusServer } from "../controllers/healths.controller.js";

const router = Router();

router.get('/', getStatusServer);

export default router;