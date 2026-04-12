import { Router } from 'express';
import { asyncHandler } from '../middlewares/error.middleware.js';
import { getDashboard } from '../controllers/dashboard.controller.js';
const router = Router();

router.get('/', asyncHandler(getDashboard));

export default router;