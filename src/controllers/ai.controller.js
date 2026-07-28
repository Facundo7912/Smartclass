import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { generatePPT } from '../services/ppt.service.js';

// ========== CONFIGURACIÓN DE GEMINI ==========
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error('❌ GEMINI_API_KEY no está configurada');
  throw new Error('GEMINI_API_KEY no está configurada');
}

const genAI = new GoogleGenerativeAI(apiKey);

// ========== FUNCIÓN DE REINTENTO ==========
async function callGeminiWithRetry(prompt, maxRetries = 3) {
  let lastError = null;
  const modelsToTry = [
    { model: 'gemini-3.5-flash', label: 'gemini-3.5-flash (experimental)' },
    { model: 'gemini-1.5-flash-002', label: 'gemini-1.5-flash-002 (estable)' },
    { model: 'gemini-1.0-pro', label: 'gemini-1.0-pro (fallback)' }
  ];

  for (let i = 0; i < modelsToTry.length && i < maxRetries; i++) {
    try {
      console.log(`🔄 Intento ${i + 1}: Usando ${modelsToTry[i].label}`);
      const tempModel = genAI.getGenerativeModel({ model: modelsToTry[i].model });
      const result = await tempModel.generateContent(prompt);
      const response = await result.response;
      console.log(`✅ Éxito con ${modelsToTry[i].label}`);
      return { success: true, text: response.text(), modelUsed: modelsToTry[i].model };
    } catch (error) {
      console.warn(`❌ Intento ${i + 1} falló:`, error.message);
      lastError = error;
      if (error.message.includes('503') || error.message.includes('Unavailable') || error.message.includes('high demand')) {
        const waitTime = (i + 1) * 2000;
        console.log(`⏳ Esperando ${waitTime/1000} segundos...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }
  throw new Error(`Error al generar contenido con Gemini: ${lastError?.message || 'Modelo no disponible'}`);
}

// ========== PROMPTS ==========
const getPromptByAction = (action, text) => {
  switch (action) {
    case 'summary':
      return `Eres un asistente que genera resúmenes académicos. A partir del siguiente texto, genera un RESUMEN ESTRUCTURADO Y CONCISO. No copies el texto original. Extrae las ideas principales, los conceptos clave y las conclusiones en un texto continuo de entre 200 y 300 palabras.\n\nTexto a resumir:\n${text}`;
    case 'flashcards':
      return `A partir del siguiente texto, genera EXACTAMENTE 4 tarjetas de estudio. El formato debe ser EXACTAMENTE:

Pregunta: [escribe aquí la pregunta sobre un concepto clave del texto]
Respuesta: [escribe aquí la respuesta concisa y directa]

Pregunta: [segunda pregunta]
Respuesta: [segunda respuesta]

(Repite el formato para las 4 tarjetas. Las preguntas deben ser relevantes y las respuestas claras. Usa el formato literal "Pregunta:" y "Respuesta:" para cada tarjeta.)

Texto:\n${text}`;
    case 'ppt':
      return `A partir del siguiente texto, genera un guión para una presentación de 5 diapositivas. Cada diapositiva debe tener un título y 3-4 puntos clave.\n\nTexto:\n${text}`;
    default:
      return `Responde al siguiente texto:\n\n${text}`;
  }
};

// ========== PARSEAR FLASHCARDS ==========
const parseFlashcardsResponse = (geminiText) => {
  console.log('📚 [parseFlashcardsResponse] Iniciando parseo...');
  console.log('📚 [parseFlashcardsResponse] Texto a parsear (primeros 200 caracteres):', geminiText.substring(0, 200));
  
  const flashcards = [];
  const lines = geminiText.split('\n').filter(line => line.trim());
  let currentQuestion = '';
  let currentAnswer = '';
  let isAnswer = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.toLowerCase().startsWith('pregunta:')) {
      if (currentQuestion && currentAnswer) {
        flashcards.push({ question: currentQuestion.trim(), answer: currentAnswer.trim() });
        currentQuestion = '';
        currentAnswer = '';
      }
      currentQuestion = line.replace(/^pregunta:\s*/i, '').trim();
      isAnswer = false;
    } else if (line.toLowerCase().startsWith('respuesta:')) {
      currentAnswer = line.replace(/^respuesta:\s*/i, '').trim();
      isAnswer = true;
    } else if (isAnswer && currentAnswer) {
      currentAnswer += ' ' + line;
    } else if (!isAnswer && currentQuestion) {
      currentQuestion += ' ' + line;
    }
  }
  
  if (currentQuestion && currentAnswer) {
    flashcards.push({ question: currentQuestion.trim(), answer: currentAnswer.trim() });
  }
  
  console.log(`📚 [parseFlashcardsResponse] ${flashcards.length} tarjetas extraídas`);
  return { flashcards, count: flashcards.length };
};

// ========== PARSEAR PPT ==========
const parsePPTResponse = (geminiText) => {
  const lines = geminiText.split('\n').filter(line => line.trim());
  const slides = [];
  let currentSlide = null;
  for (const line of lines) {
    const trimmed = line.trim();
    if (/^(diapositiva|slide|diap|\d+\.|\*\*diapositiva|^#{1,2}\s)/.test(trimmed.toLowerCase()) || (trimmed.endsWith(':') && !trimmed.startsWith('-') && !trimmed.startsWith('•'))) {
      if (currentSlide) slides.push(currentSlide);
      currentSlide = { title: trimmed.replace(/^(diapositiva|slide|diap|\d+\.?|\*\*diapositiva|#+\s)/i, '').replace(/[:\*]/g, '').trim(), content: [] };
    } else if (currentSlide && (trimmed.startsWith('-') || trimmed.startsWith('•') || trimmed.startsWith('*'))) {
      const content = trimmed.replace(/^[-•*]\s*/, '').trim();
      if (content) currentSlide.content.push(content);
    } else if (currentSlide && trimmed && !trimmed.startsWith('#')) {
      if (currentSlide.content.length === 0) currentSlide.content.push(trimmed);
    }
  }
  if (currentSlide) slides.push(currentSlide);
  const validSlides = slides.filter(slide => slide.title && slide.content.length > 0);
  return { title: 'Presentación Generada - SmartClass', slides: validSlides.length > 0 ? validSlides : slides };
};

// ========== GENERAR CON GEMINI ==========
export const generateWithGemini = async (text, action) => {
  if (!text || !text.trim()) throw new Error('No hay texto para procesar.');
  const prompt = getPromptByAction(action, text);
  console.log(`📝 [Backend] Prompt generado (${prompt.length} caracteres)`);
  const result = await callGeminiWithRetry(prompt);
  console.log(`✅ [Backend] Respuesta generada con ${result.modelUsed}`);
  return result.text;
};

// ========== CONTROLADOR PRINCIPAL ==========
export const processFileController = async (req, res) => {
  try {
    console.log('\n📨 [Backend] Petición POST /api/ai/process');
    console.log('📎 [Backend] Archivo:', req.file ? req.file.originalname : 'No file');

    const { action, text } = req.body;
    console.log('🎯 [Backend] Acción recibida:', action);

    let finalText = text?.trim() || '';

    if (req.file) {
      const { buffer, originalname } = req.file;
      const extension = originalname.toLowerCase().slice(originalname.lastIndexOf('.'));
      if (extension === '.pdf') {
        const data = await pdfParse(buffer);
        finalText = data.text;
        console.log(`✅ [Backend] PDF parseado: ${finalText.length} caracteres`);
      } else if (extension === '.docx') {
        const data = await mammoth.extractRawText({ buffer });
        finalText = data.value;
        console.log(`✅ [Backend] DOCX parseado: ${finalText.length} caracteres`);
      } else {
        return res.status(400).json({ error: 'Formato de archivo no soportado.' });
      }
    }

    if (!finalText) return res.status(400).json({ error: 'Debes enviar un archivo o texto.' });
    if (!action) return res.status(400).json({ error: 'La acción es obligatoria.' });

    const result = await generateWithGemini(finalText, action);

    // ========== CASO PPT ==========
    if (action === 'ppt') {
      try {
        const pptData = parsePPTResponse(result);
        const pptBuffer = await generatePPT(pptData);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.presentationml.presentation');
        res.setHeader('Content-Disposition', 'attachment; filename="presentacion_smartclass.pptx"');
        res.setHeader('Content-Length', pptBuffer.length);
        return res.send(pptBuffer);
      } catch (error) {
        console.error('❌ [Backend] Error generando PowerPoint:', error);
        return res.status(500).json({ error: 'Error al generar el PowerPoint', details: error.message });
      }
    }

    // ========== CASO FLASHCARDS ==========
    if (action === 'flashcards') {
      try {
        console.log('📚 [Backend] Parseando flashcards...');
        const flashcardsData = parseFlashcardsResponse(result);
        console.log(`📚 [Backend] ${flashcardsData.flashcards.length} tarjetas detectadas`);
        
        if (flashcardsData.flashcards.length === 0) {
          console.warn('⚠️ [Backend] No se extrajeron tarjetas');
          return res.json({ 
            success: true, 
            flashcards: [], 
            raw: result,
            message: 'No se detectaron tarjetas.'
          });
        }
        
        // ✅ DEVOLVER FLASHCARDS ESTRUCTURADOS
        return res.json({
          success: true,
          flashcards: flashcardsData.flashcards,
          count: flashcardsData.count
        });
      } catch (error) {
        console.error('❌ [Backend] Error generando Flashcards:', error);
        return res.status(500).json({ 
          error: 'Error al generar las tarjetas', 
          details: error.message,
          raw: result 
        });
      }
    }

    // ========== CASO SUMMARY ==========
    console.log(`✅ [Backend] Respondiendo con resumen (${result.length} caracteres)`);
    return res.json({ success: true, result });
    
  } catch (error) {
    console.error('❌ [Backend] Error:', error);
    return res.status(500).json({ error: error.message || 'Error al procesar' });
  }
};

export default processFileController;