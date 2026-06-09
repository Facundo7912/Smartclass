/**
 * SmartClass Backend - Rutas principales
 */

import { Router } from 'express';
import { healthController } from '../controllers/health.controller.js';
import courseRoutes from './course.routes.js';

const router = Router();

router.get('/health', healthController);
router.use('/courses', courseRoutes);

export default router;