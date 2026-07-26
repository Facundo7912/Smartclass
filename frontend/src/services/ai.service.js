// Construcción de la URL del API
const getApiUrl = () => {
  const baseUrl = import.meta.env.VITE_API_URL || '/api';
  
  // Si baseUrl es una URL completa (comienza con http/https), agregar /api/ai/process
  if (baseUrl.startsWith('http')) {
    return `${baseUrl.replace(/\/$/, '')}/api/ai/process`;
  }
  
  // Si baseUrl es una ruta relativa (para desarrollo con proxy de Vite), agregar /ai/process
  return `${baseUrl.replace(/\/$/, '')}/ai/process`;
};

const API_URL = getApiUrl();

// MIME types de archivo soportados
const FILE_MIME_TYPES = {
  PPT: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  PPTX: 'application/vnd.ms-powerpoint',
};

/**
 * Verifica si el Content-Type corresponde a un archivo (blob)
 * @param {string} contentType - Content-Type del header
 * @returns {boolean}
 */
const isFileResponse = (contentType) => {
  if (!contentType) return false;
  return (
    contentType.includes(FILE_MIME_TYPES.PPT) ||
    contentType.includes(FILE_MIME_TYPES.PPTX) ||
    contentType.includes('application/') && (
      contentType.includes('vnd') || 
      contentType.includes('octet-stream')
    )
  );
};

/**
 * Extrae el nombre de archivo del header Content-Disposition
 * @param {Headers} headers - Headers de la respuesta
 * @returns {string} Nombre del archivo o nombre por defecto
 */
const extractFileNameFromHeaders = (headers) => {
  const contentDisposition = headers.get('content-disposition');
  if (!contentDisposition) return 'presentacion_smartclass.pptx';
  
  const fileNameMatch = contentDisposition.match(/filename[^;=\n]*=(["\']?)(.+?)\1(?:;|$)/);
  return fileNameMatch?.[2] || 'presentacion_smartclass.pptx';
};

export const processFile = async (formData, action) => {
  if (action) {
    formData.append('action', action);
  }

  console.log('🚀 [Frontend] Iniciando petición POST a:', API_URL);
  console.log('📦 [Frontend] FormData contiene:', {
    tieneArchivo: formData.has('file'),
    tieneTexto: formData.has('text'),
    accion: action,
  });

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      body: formData,
    });

    const contentType = response.headers.get('content-type');
    console.log('📨 [Frontend] Respuesta recibida:', {
      status: response.status,
      statusText: response.statusText,
      contentType,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ [Frontend] Error en la respuesta:', errorData);
      throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
    }

    // ========== MANEJO DE RESPUESTAS EN BLOB (archivos) ==========
    if (isFileResponse(contentType)) {
      console.log('📊 [Frontend] Respuesta es un archivo (Blob)');
      const blob = await response.blob();
      const fileName = extractFileNameFromHeaders(response.headers);
      
      console.log('✅ [Frontend] Archivo recibido:', {
        fileName,
        size: `${(blob.size / 1024).toFixed(2)} KB`,
        type: blob.type,
      });

      return {
        isFile: true,
        blob,
        fileName,
        mimeType: contentType,
      };
    }

    // ========== MANEJO DE RESPUESTAS EN JSON (texto) ==========
    const result = await response.json();
    console.log('✅ [Frontend] Respuesta JSON exitosa:', {
      tieneResult: !!result.result,
      resultLength: result.result?.length || 0,
    });
    
    return {
      isFile: false,
      result: result.result || result,
    };
  } catch (error) {
    console.error('❌ [Frontend] Error en la petición:', error.message);
    throw error;
  }
};

export default processFile;
