import { useState } from 'react';
import { processFile } from '../services/ai.service';

/**
 * Componente de indicador de carga con estados
 */
const LoadingIndicator = ({ status }) => {
  if (!status.isProcessing && !status.isComplete && !status.isError) {
    return null;
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-xl">{status.emoji}</span>
      
      {status.isProcessing && (
        <>
          <svg
            className="h-5 w-5 animate-spin text-blue-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span className="text-sm font-medium text-blue-600">{status.message}</span>
        </>
      )}

      {status.isComplete && (
        <span className="text-sm font-medium text-emerald-600">{status.message}</span>
      )}

      {status.isError && (
        <span className="text-sm font-medium text-red-600">{status.message}</span>
      )}
    </div>
  );
};

const AIProcessor = () => {
  const [file, setFile] = useState(null);
  const [text, setText] = useState('');
  const [action, setAction] = useState('summary');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const [pptFile, setPptFile] = useState(null);
  const [status, setStatus] = useState({
    message: '',
    emoji: '',
    isProcessing: false,
    isComplete: false,
    isError: false,
  });

  const handleFileChange = async (selectedFile) => {
    if (!selectedFile) return;

    setFile(selectedFile);
    setError('');

    const extension = selectedFile.name.split('.').pop()?.toLowerCase();

    if (extension === 'txt' || extension === 'md') {
      const reader = new FileReader();
      reader.onload = (event) => {
        setText(event.target.result || '');
      };
      reader.readAsText(selectedFile);
    } else {
      setText('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult('');
    setPptFile(null);

    // ========== ESTADO: Iniciando procesamiento ==========
    setStatus({
      message: 'Procesando con IA...',
      emoji: '🤔',
      isProcessing: true,
      isComplete: false,
      isError: false,
    });

    try {
      const formData = new FormData();

      if (file) {
        formData.append('file', file);
      }

      if (text.trim()) {
        formData.append('text', text);
      }

      const response = await processFile(formData, action);

      // Detectar si es un archivo PPT
      if (response.isFile && response.blob) {
        console.log('📊 [Frontend] Archivo PPT recibido');
        setPptFile({
          blob: response.blob,
          fileName: response.fileName,
        });
        setResult(`✨ Presentación generada exitosamente (${(response.blob.size / 1024).toFixed(2)} KB)`);
      } else {
        setResult(response.result || 'Procesamiento completado.');
      }

      // ========== ESTADO: Procesamiento completado ==========
      setStatus({
        message: '¡Procesado con éxito!',
        emoji: '😎',
        isProcessing: false,
        isComplete: true,
        isError: false,
      });

      // Auto-ocultar el indicador después de 3 segundos
      setTimeout(() => {
        setStatus({
          message: '',
          emoji: '',
          isProcessing: false,
          isComplete: false,
          isError: false,
        });
      }, 3000);
    } catch (err) {
      console.error('❌ Error:', err);
      setError(err.message || 'No se pudo procesar la solicitud.');

      // ========== ESTADO: Error ==========
      setStatus({
        message: 'Error al procesar',
        emoji: '😅',
        isProcessing: false,
        isComplete: false,
        isError: true,
      });

      // Auto-ocultar el indicador después de 3 segundos
      setTimeout(() => {
        setStatus({
          message: '',
          emoji: '',
          isProcessing: false,
          isComplete: false,
          isError: false,
        });
      }, 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPPT = () => {
    if (!pptFile) return;

    const url = URL.createObjectURL(pptFile.blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = pptFile.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    console.log('✅ [Frontend] Descarga de PPT iniciada');
  };

  const actions = [
    { value: 'summary', label: 'Resumen' },
    { value: 'flashcards', label: 'Tarjetas de estudio' },
    { value: 'ppt', label: 'PPT' },
  ];

  return (
    <div className="mx-auto max-w-5xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-slate-800">Procesador de IA</h2>
        <p className="mt-2 text-sm text-slate-600">
          Sube un archivo PDF o DOCX, o pega texto directamente para generar contenido con Gemini.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
          <input
            id="file-upload"
            type="file"
            accept=".pdf,.docx,.txt,.md"
            onChange={(e) => handleFileChange(e.target.files?.[0])}
            className="hidden"
          />
          <label
            htmlFor="file-upload"
            className="cursor-pointer rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
          >
            Elegir archivo
          </label>
          <p className="mt-3 text-sm text-slate-500">
            {file ? `Archivo seleccionado: ${file.name}` : 'Arrastra o selecciona un PDF, DOCX, TXT o MD'}
          </p>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Texto manual</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={8}
            placeholder="Pega aquí el texto si no quieres subir un archivo..."
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 outline-none ring-0 focus:border-slate-500"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Tipo de salida</label>
          <div className="flex flex-wrap gap-3">
            {actions.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setAction(item.value)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  action === item.value
                    ? 'bg-slate-800 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Botón y indicador de carga en la misma línea */}
        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={loading || (!file && !text.trim())}
            className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {loading ? 'Procesando...' : 'Procesar con IA'}
          </button>

          {/* Indicador de carga */}
          <LoadingIndicator status={status} />
        </div>
      </form>

      {error && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {result && (
        <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-emerald-700">
            {pptFile ? '📊 Presentación Generada' : 'Resultado'}
          </h3>
          <div className="whitespace-pre-wrap text-sm leading-7 text-slate-700">{result}</div>

          {/* Botón de descarga para PPT */}
          {pptFile && (
            <button
              onClick={handleDownloadPPT}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              <span>📥</span>
              <span>Descargar PPT</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default AIProcessor;
