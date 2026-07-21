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
    const { action, text } = req.body;

    let finalText = text?.trim() || '';

    if (req.file) {
      const { buffer, originalname } = req.file;
      const extension = originalname.toLowerCase().slice(originalname.lastIndexOf('.'));

      if (extension === '.pdf') {
        const data = await pdfParse(buffer);
        finalText = data.text;
      } else if (extension === '.docx') {
        const data = await mammoth.extractRawText({ buffer });
        finalText = data.value;
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

    const result = await generateWithGemini(finalText, action);

    return res.json({ success: true, result });
  } catch (error) {
    console.error('Error en processFileController:', error);
    return res.status(500).json({
      error: error.message || 'Ocurrió un error al procesar el archivo.',
    });
  }
};

export default processFileController;
