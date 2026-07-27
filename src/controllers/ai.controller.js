import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import { model } from '../gemini.js';
import { generatePPT } from '../services/ppt.service.js';

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

export const generateWithGemini = async (text, action) => {
  if (!text || !text.trim()) {
    throw new Error('No hay texto para procesar.');
  }

  const prompt = getPromptByAction(action, text);
  const result = await model.generateContent(prompt);
  const response = await result.response;

  return response.text();
};

/**
 * Parsea la respuesta de Gemini para el caso PPT
 * Estructura el texto en diapositivas con título y contenido
 * @param {string} geminText - Respuesta de Gemini con el guión de la presentación
 * @returns {Object} Objeto con title y slides
 */
const parsePPTResponse = (geminText) => {
  const lines = geminText.split('\n').filter(line => line.trim());
  const slides = [];
  let currentSlide = null;

  for (const line of lines) {
    const trimmed = line.trim();

    // Detectar títulos de diapositivas (líneas que comienzan con "Diapositiva", números, o patrones similares)
    if (
      /^(diapositiva|slide|diap|\\d+\\.|\\*\\*diapositiva|^#{1,2}\\s)/.test(trimmed.toLowerCase()) ||
      (trimmed.endsWith(':') && !trimmed.startsWith('-') && !trimmed.startsWith('•'))
    ) {
      // Guardar diapositiva anterior si existe
      if (currentSlide) {
        slides.push(currentSlide);
      }

      // Crear nueva diapositiva
      currentSlide = {
        title: trimmed
          .replace(/^(diapositiva|slide|diap|\\d+\\.?|\\*\\*diapositiva|#+\\s)/i, '')
          .replace(/[:\\*]/g, '')
          .trim(),
        content: [],
      };
    } else if (currentSlide && (trimmed.startsWith('-') || trimmed.startsWith('•') || trimmed.startsWith('*'))) {
      // Línea de contenido (viñeta)
      const content = trimmed.replace(/^[-•*]\\s*/, '').trim();
      if (content) {
        currentSlide.content.push(content);
      }
    } else if (currentSlide && trimmed && !trimmed.startsWith('#')) {
      // Línea de contenido sin viñeta
      if (currentSlide.content.length === 0) {
        // Si no hay viñetas aún, agregar como primer punto
        currentSlide.content.push(trimmed);
      }
    }
  }

  // Guardar última diapositiva
  if (currentSlide) {
    slides.push(currentSlide);
  }

  // Filtrar diapositivas válidas (con título y al menos un punto de contenido)
  const validSlides = slides.filter(slide => slide.title && slide.content.length > 0);

  return {
    title: 'Presentación Generada - SmartClass',
    slides: validSlides.length > 0 ? validSlides : slides,
  };
};

/**
 * Parsea la respuesta de Gemini para el caso Flashcards
 * Estructura el texto en tarjetas de estudio con pregunta y respuesta
 * @param {string} geminText - Respuesta de Gemini con las tarjetas
 * @returns {Object} Objeto con array de flashcards
 */
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
        question: question,
        answer: answer,
      });
    }
  }
  
  return {
    flashcards: flashcards,
    count: flashcards.length,
  };
};

export const processFileController = async (req, res) => {
  try {
    // Logs de la petición recibida
    console.log('\n📨 [Backend] Petición POST /api/ai/process recibida');
    console.log('📋 [Backend] Método HTTP:', req.method);
    console.log('📋 [Backend] Headers:', {
      contentType: req.headers['content-type'],
      contentLength: req.headers['content-length'],
    });
    console.log('📦 [Backend] Body fields:', Object.keys(req.body));
    console.log('📎 [Backend] Multer file info:', req.file ? {
      fieldname: req.file.fieldname,
      originalname: req.file.originalname,
      encoding: req.file.encoding,
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
        console.log(`✅ [Backend] PDF parseado: ${finalText.length} caracteres extraídos`);
      } else if (extension === '.docx') {
        console.log('📝 [Backend] Parseando DOCX...');
        const data = await mammoth.extractRawText({ buffer });
        finalText = data.value;
        console.log(`✅ [Backend] DOCX parseado: ${finalText.length} caracteres extraídos`);
      } else {
        console.warn(`⚠️ [Backend] Formato no soportado: ${extension}`);
        return res.status(400).json({ error: 'Formato de archivo no soportado.' });
      }
    }

    if (!finalText) {
      console.warn('⚠️ [Backend] Sin contenido para procesar (archivo y texto vacío)');
      return res.status(400).json({ error: 'Debes enviar un archivo o texto para procesar.' });
    }

    if (!action) {
      console.warn('⚠️ [Backend] Acción no especificada');
      return res.status(400).json({ error: 'La acción es obligatoria.' });
    }

    console.log(`🤖 [Backend] Generando contenido con Gemini (acción: ${action})...`);
    const result = await generateWithGemini(finalText, action);

    // ========== CASO ESPECIAL: Generar PowerPoint ==========
    if (action === 'ppt') {
      try {
        console.log('\n📄 [Backend] ========== RESPUESTA COMPLETA DE GEMINI ==========');
        console.log(result);
        console.log('========== FIN DE RESPUESTA ==========\n');

        console.log('📊 [Backend] Parseando respuesta de Gemini para PPT...');
        const pptData = parsePPTResponse(result);

        console.log(`\n📋 [Backend] ========== ESTRUCTURA DE PPT PARSEADA ==========`);
        console.log('Título:', pptData.title);
        console.log('Total de diapositivas:', pptData.slides.length);
        
        pptData.slides.forEach((slide, index) => {
          console.log(`\n  Diapositiva ${index + 1}:`);
          console.log(`    Título: "${slide.title}"`);
          console.log(`    Contenido (${slide.content.length} puntos):`);
          slide.content.forEach((point, i) => {
            console.log(`      ${i + 1}. ${point}`);
          });
        });
        console.log('\n========== FIN DE ESTRUCTURA ==========\n');

        console.log('🎬 [Backend] Generando archivo PowerPoint...');
        const pptBuffer = await generatePPT(pptData);

        console.log(`✅ [Backend] PowerPoint generado (${pptBuffer.length} bytes)`);

        // Devolver archivo como descarga
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

    // ========== CASO ESPECIAL: Generar Flashcards ==========
    if (action === 'flashcards') {
      try {
        console.log('\n📚 [Backend] ========== RESPUESTA COMPLETA DE GEMINI (FLASHCARDS) ==========');
        console.log(result);
        console.log('========== FIN DE RESPUESTA ==========\n');

        console.log('📚 [Backend] Parseando respuesta de Gemini para Flashcards...');
        const flashcardsData = parseFlashcardsResponse(result);

        console.log(`\n📋 [Backend] ========== ESTRUCTURA DE FLASHCARDS PARSEADA ==========`);
        console.log(`Total de tarjetas: ${flashcardsData.count}`);
        
        flashcardsData.flashcards.forEach((card, index) => {
          console.log(`\n  Tarjeta ${index + 1}:`);
          console.log(`    Pregunta: "${card.question}"`);
          console.log(`    Respuesta: "${card.answer}"`);
        });
        console.log('\n========== FIN DE ESTRUCTURA ==========\n');

        if (flashcardsData.flashcards.length === 0) {
          console.warn('⚠️ [Backend] No se extrajeron tarjetas de la respuesta de Gemini');
          return res.status(400).json({
            error: 'No se pudieron extraer tarjetas de estudio del contenido.',
          });
        }

        console.log(`✅ [Backend] Flashcards generadas exitosamente (${flashcardsData.flashcards.length} tarjetas)`);
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

    console.log(`✅ [Backend] Respuesta generada exitosamente (${result.length} caracteres)`);
    return res.json({ success: true, result });
  } catch (error) {
    console.error('❌ [Backend] Error en processFileController:', error);
    return res.status(500).json({
      error: error.message || 'Ocurrió un error al procesar el archivo.',
      stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined,
    });
  }
};

export default processFileController;
