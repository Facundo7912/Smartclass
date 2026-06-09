import { getHealthData } from '../models/health.model.js';

// Controlador health: orquesta el modelo y devuelve la respuesta
export async function healthController(req, res, next) {
  try {
    const data = await getHealthData();
    res.json(data);
  } catch (error) {
    next(error);
  }
}
