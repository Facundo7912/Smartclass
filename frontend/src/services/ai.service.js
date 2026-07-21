const API_URL = '/api/ai/process';

export const processFile = async (formData, action) => {
  if (action) {
    formData.append('action', action);
  }

  const response = await fetch(API_URL, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Error al procesar el archivo.');
  }

  return response.json();
};

export default processFile;
