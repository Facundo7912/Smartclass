import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import { model } from '../gemini.js';

const getPromptByAction = (action, text) => {
  switch (action) {
    case 'summary':
      return `Resume el siguiente texto de manera clara y concisa. El resumen debe tener entre 5 y 8 párrafos.\n\nTexto:\n${text}`;
    case 'flashcards':
      return `A partir del siguiente texto, genera 5 tarjetas de estudio en formato 'Pregunta - Respuesta'.\n\nTexto:\n${text}`;
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
