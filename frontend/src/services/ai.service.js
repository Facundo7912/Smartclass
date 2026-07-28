// ========== CONSTRUCCIÓN DE URL ==========
const getApiUrl = () => {
  const baseUrl = import.meta.env.VITE_API_URL || '/api';
  
  if (baseUrl.startsWith('http')) {
    return `${baseUrl.replace(/\/$/, '')}/api/ai/process`;
  }
  
  return `${baseUrl.replace(/\/$/, '')}/ai/process`;
};

const API_URL = getApiUrl();

// ========== MIME TYPES ==========
const FILE_MIME_TYPES = {
  PPT: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  PPTX: 'application/vnd.ms-powerpoint',
};

const isFileResponse = (contentType) => {
  if (!contentType) return false;
  return (
    contentType.includes(FILE_MIME_TYPES.PPT) ||
    contentType.includes(FILE_MIME_TYPES.PPTX) ||
    (contentType.includes('application/') && (
      contentType.includes('vnd') || 
      contentType.includes('octet-stream')
    ))
  );
};

const extractFileNameFromHeaders = (headers) => {
  const contentDisposition = headers.get('content-disposition');
  if (!contentDisposition) return 'presentacion_smartclass.pptx';
  
  const fileNameMatch = contentDisposition.match(/filename[^;=\n]*=(["\']?)(.+?)\1(?:;|$)/);
  return fileNameMatch?.[2] || 'presentacion_smartclass.pptx';
};

// ========== PROCESAR ARCHIVO ==========
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

    // ========== RESPUESTA EN BLOB (archivo) ==========
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

    // ========== RESPUESTA EN JSON ==========
    const result = await response.json();
    console.log('✅ [Frontend] Respuesta JSON:', result);

    // ✅ Si tiene flashcards, devolver el objeto completo
    if (result.flashcards) {
      console.log(`📚 [Frontend] ${result.flashcards.length} tarjetas recibidas`);
      return result;
    }

    // ✅ Si tiene result, devolver como texto
    if (result.result) {
      return {
        isFile: false,
        result: result.result,
      };
    }

    // ✅ Fallback
    return {
      isFile: false,
      result: result,
    };
    
  } catch (error) {
    console.error('❌ [Frontend] Error en la petición:', error.message);
    throw error;
  }
};

export default processFile;