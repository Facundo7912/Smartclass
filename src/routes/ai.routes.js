import express from 'express';
import { processFileController } from '../controllers/ai.controller.js';
import uploadSingle from '../multer.js';

const router = express.Router();

router.post('/process', uploadSingle, processFileController);

export default router;
