import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error('❌ GEMINI_API_KEY no está configurada en el archivo .env');
  throw new Error('GEMINI_API_KEY no está configurada. Define la variable de entorno antes de iniciar la aplicación.');
}

console.log('✅ GEMINI_API_KEY cargada correctamente');

const genAI = new GoogleGenerativeAI(apiKey);

// ========== CONFIGURACIÓN DEL MODELO CON FALLBACK ==========
// Primero intenta con gemini-3.5-flash, si falla usa gemini-1.5-flash-002

let model;
let modelName = '';

try {
  // Intentar usar gemini-3.5-flash (experimental)
  model = genAI.getGenerativeModel({ model: 'gemini-3.5-flash' });
  modelName = 'gemini-3.5-flash';
  console.log('✅ Usando modelo: gemini-3.5-flash (experimental)');
} catch (error) {
  // Si falla, usar gemini-1.5-flash-002 (estable)
  console.warn('⚠️ gemini-3.5-flash no disponible, usando fallback...');
  model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-002' });
  modelName = 'gemini-1.5-flash-002';
  console.log('✅ Usando modelo: gemini-1.5-flash-002 (estable)');
}

// ========== EXPORTAR ==========
export { model, modelName };
export default model;