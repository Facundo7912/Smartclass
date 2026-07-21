import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

export const extractTextFromBuffer = async (buffer, mimetype) => {
  if (!buffer) {
    throw new Error('No se proporcionó un buffer de archivo.');
  }

  if (mimetype === 'application/pdf') {
    const data = await pdfParse(buffer);
    return data.text;
  }

  if (mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    const data = await mammoth.extractRawText({ buffer });
    return data.value;
  }

  throw new Error('Formato de archivo no soportado. Solo se aceptan PDF y DOCX.');
};

export default extractTextFromBuffer;
