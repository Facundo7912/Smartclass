// Construcción de la URL del API
const getApiUrl = () => {
  // En producción, usa VITE_API_URL desde .env.production
  // En desarrollo, usa la ruta relativa (que será redirigida por el proxy de Vite)
  const baseUrl = import.meta.env.VITE_API_URL || '/api';
  return `${baseUrl.replace(/\/$/, '')}/ai/process`; // Elimina trailing slash si existe
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
