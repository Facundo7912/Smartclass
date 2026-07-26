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

    console.log('📨 [Frontend] Respuesta recibida:', {
      status: response.status,
      statusText: response.statusText,
      headers: {
        contentType: response.headers.get('content-type'),
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ [Frontend] Error en la respuesta:', errorData);
      throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    console.log('✅ [Frontend] Respuesta exitosa:', result);
    return result;
  } catch (error) {
    console.error('❌ [Frontend] Error en la petición:', error.message);
    throw error;
  }
};

export default processFile;
