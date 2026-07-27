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

// ========== FUNCIÓN DE REINTENTO CON MÚLTIPLES MODELOS ==========
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
      return {
        success: true,
        text: response.text(),
        modelUsed: modelsToTry[i].model
      };
    } catch (error) {
      console.warn(`❌ Intento ${i + 1} falló:`, error.message);
      lastError = error;
      
      // Si es un error de saturación (503), esperar antes de reintentar
      if (error.message.includes('503') || error.message.includes('Unavailable') || error.message.includes('high demand')) {
        const waitTime = (i + 1) * 2000; // 2s, 4s, 6s
        console.log(`⏳ Esperando ${waitTime/1000} segundos antes de reintentar...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }

  console.error('❌ Todos los intentos fallaron');
  throw new Error(`Error al generar contenido con Gemini: ${lastError?.message || 'Modelo no disponible'}`);
}

// ========== PROMPTS ==========
const getPromptByAction = (action, text) => {
  switch (action) {
    case 'summary':
      return `Resume el siguiente texto de manera clara y concisa. El resumen debe tener entre 5 y 8 párrafos.\n\nTexto:\n${text}`;
    case 'flashcards':
      return `A partir del siguiente texto, genera exactamente 4 tarjetas de estudio en formato:\nPregunta: [pregunta]\nRespuesta: [respuesta]\n\nRepite este formato para cada tarjeta separadas por línea en blanco.\n\nTexto:\n${text}`;
    case 'ppt':
      return `A partir del siguiente texto, genera un guión para una presentación de 5 diapositivas. Cada diapositiva debe tener un título y 3-4 puntos clave.\n\nTexto:\n${text}`;
    default:
      return `Responde al siguiente texto:\n\n${text}`;
  }
};

// ========== GENERAR CON GEMINI (CON REINTENTO) ==========
export const generateWithGemini = async (text, action) => {
  if (!text || !text.trim()) {
    throw new Error('No hay texto para procesar.');
  }

  const prompt = getPromptByAction(action, text);
  console.log(`📝 [Backend] Prompt generado (${prompt.length} caracteres)`);
  
  // ✅ USAR REINTENTO
  const result = await callGeminiWithRetry(prompt);
  console.log(`✅ [Backend] Respuesta generada con ${result.modelUsed}`);
  
  return result.text;
};

// ========== PARSEAR RESPUESTA DE FLASHCARDS ==========
const parseFlashcardsResponse = (geminText) => {
  const flashcards = [];
  
  // Dividir por líneas en blanco para separar tarjetas
  const sections = geminText.split(/\n\s*\n/);
  
  for (const section of sections) {
    if (!section.trim()) continue;
    
    const lines = section.split('\n').map(line => line.trim()).filter(line => line);
    let question = '';
    let answer = '';
    let inQuestion = false;
    let inAnswer = false;
    
    for (const line of lines) {
      // Detectar línea de pregunta (comienza con "Pregunta:")
      if (line.toLowerCase().startsWith('pregunta:')) {
        if (question && answer) {
          flashcards.push({ question: question.trim(), answer: answer.trim() });
          question = '';
          answer = '';
        }
        inQuestion = true;
        inAnswer = false;
        question = line.replace(/^pregunta:\s*/i, '').trim();
      }
      // Detectar línea de respuesta (comienza con "Respuesta:")
      else if (line.toLowerCase().startsWith('respuesta:')) {
        inAnswer = true;
        inQuestion = false;
        answer = line.replace(/^respuesta:\s*/i, '').trim();
      }
      // Continuar con pregunta multi-línea
      else if (inQuestion && !line.toLowerCase().startsWith('respuesta:')) {
        if (question) question += ' ';
        question += line;
      }
      // Continuar con respuesta multi-línea
      else if (inAnswer) {
        if (answer) answer += ' ';
        answer += line;
      }
    }
    
    // Agregar tarjeta si tiene pregunta y respuesta
    if (question && answer) {
      flashcards.push({
        question: question.trim(),
        answer: answer.trim(),
      });
    }
  }
  
  return {
    flashcards: flashcards,
    count: flashcards.length,
  };
};

// ========== PARSEAR RESPUESTA DE PPT ==========
const parsePPTResponse = (geminText) => {
  const lines = geminText.split('\n').filter(line => line.trim());
  const slides = [];
  let currentSlide = null;

  for (const line of lines) {
    const trimmed = line.trim();

    // Detectar títulos de diapositivas
    if (
      /^(diapositiva|slide|diap|\d+\.|\*\*diapositiva|^#{1,2}\s)/.test(trimmed.toLowerCase()) ||
      (trimmed.endsWith(':') && !trimmed.startsWith('-') && !trimmed.startsWith('•'))
    ) {
      if (currentSlide) {
        slides.push(currentSlide);
      }

      currentSlide = {
        title: trimmed
          .replace(/^(diapositiva|slide|diap|\d+\.?|\*\*diapositiva|#+\s)/i, '')
          .replace(/[:\*]/g, '')
          .trim(),
        content: [],
      };
    } else if (currentSlide && (trimmed.startsWith('-') || trimmed.startsWith('•') || trimmed.startsWith('*'))) {
      const content = trimmed.replace(/^[-•*]\s*/, '').trim();
      if (content) {
        currentSlide.content.push(content);
      }
    } else if (currentSlide && trimmed && !trimmed.startsWith('#')) {
      if (currentSlide.content.length === 0) {
        currentSlide.content.push(trimmed);
      }
    }
  }

  if (currentSlide) {
    slides.push(currentSlide);
  }

  const validSlides = slides.filter(slide => slide.title && slide.content.length > 0);

  return {
    title: 'Presentación Generada - SmartClass',
    slides: validSlides.length > 0 ? validSlides : slides,
  };
};

// ========== CONTROLADOR PRINCIPAL ==========
export const processFileController = async (req, res) => {
  try {
    console.log('\n📨 [Backend] Petición POST /api/ai/process recibida');
    console.log('📋 [Backend] Método HTTP:', req.method);
    console.log('📎 [Backend] Multer file info:', req.file ? {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
    } : 'No file uploaded');

    const { action, text } = req.body;

    let finalText = text?.trim() || '';

    if (req.file) {
      console.log(`📄 [Backend] Procesando archivo: ${req.file.originalname}`);
      const { buffer, originalname } = req.file;
      const extension = originalname.toLowerCase().slice(originalname.lastIndexOf('.'));

      if (extension === '.pdf') {
        console.log('📖 [Backend] Parseando PDF...');
        const data = await pdfParse(buffer);
        finalText = data.text;
        console.log(`✅ [Backend] PDF parseado: ${finalText.length} caracteres`);
      } else if (extension === '.docx') {
        console.log('📝 [Backend] Parseando DOCX...');
        const data = await mammoth.extractRawText({ buffer });
        finalText = data.value;
        console.log(`✅ [Backend] DOCX parseado: ${finalText.length} caracteres`);
      } else {
        return res.status(400).json({ error: 'Formato de archivo no soportado.' });
      }
    }

    if (!finalText) {
      return res.status(400).json({ error: 'Debes enviar un archivo o texto para procesar.' });
    }

    if (!action) {
      return res.status(400).json({ error: 'La acción es obligatoria.' });
    }

    console.log(`🤖 [Backend] Generando contenido con Gemini (acción: ${action})...`);
    const result = await generateWithGemini(finalText, action);

    // ========== CASO PPT ==========
    if (action === 'ppt') {
      try {
        console.log('📊 [Backend] Parseando respuesta de Gemini para PPT...');
        const pptData = parsePPTResponse(result);
        console.log(`📊 [Backend] ${pptData.slides.length} diapositivas parseadas`);

        console.log('🎬 [Backend] Generando archivo PowerPoint...');
        const pptBuffer = await generatePPT(pptData);

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.presentationml.presentation');
        res.setHeader('Content-Disposition', 'attachment; filename="presentacion_smartclass.pptx"');
        res.setHeader('Content-Length', pptBuffer.length);

        return res.send(pptBuffer);
      } catch (pptError) {
        console.error('❌ [Backend] Error generando PowerPoint:', pptError);
        return res.status(500).json({
          error: 'Error al generar el archivo PowerPoint',
          details: pptError.message,
        });
      }
    }

    // ========== CASO FLASHCARDS ==========
    if (action === 'flashcards') {
      try {
        console.log('📚 [Backend] Parseando respuesta de Gemini para Flashcards...');
        const flashcardsData = parseFlashcardsResponse(result);

        if (flashcardsData.flashcards.length === 0) {
          console.warn('⚠️ [Backend] No se extrajeron tarjetas de la respuesta');
          return res.status(400).json({
            error: 'No se pudieron extraer tarjetas de estudio del contenido.',
          });
        }

        console.log(`✅ [Backend] ${flashcardsData.flashcards.length} tarjetas generadas`);
        return res.json({
          success: true,
          flashcards: flashcardsData.flashcards,
          count: flashcardsData.count,
        });
      } catch (flashcardError) {
        console.error('❌ [Backend] Error generando Flashcards:', flashcardError);
        return res.status(500).json({
          error: 'Error al generar las tarjetas de estudio',
          details: flashcardError.message,
        });
      }
    }

    // ========== CASO SUMMARY ==========
    console.log(`✅ [Backend] Resumen generado (${result.length} caracteres)`);
    return res.json({ success: true, result });
  } catch (error) {
    console.error('❌ [Backend] Error en processFileController:', error);
    return res.status(500).json({
      error: error.message || 'Ocurrió un error al procesar el archivo.',
    });
  }
};

export default processFileController;