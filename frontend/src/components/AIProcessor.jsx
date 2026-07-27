import { useState } from 'react';
import { processFile } from '../services/ai.service';
import Flashcard from './Flashcard';

const LoadingIndicator = ({ status }) => {
  if (!status.isProcessing && !status.isComplete && !status.isError) return null;

  return (
    <div className="flex items-center gap-2 text-sm font-medium">
      <span className="text-xl">{status.emoji}</span>
      {status.isProcessing && (
        <svg
          className="animate-spin h-4 w-4 text-blue-600"
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
      )}
      {status.isComplete && <span className="text-green-600">✔️</span>}
      {status.isError && <span className="text-red-600">❌</span>}
      <span className={`${status.isError ? 'text-red-600' : status.isComplete ? 'text-green-600' : 'text-blue-600'}`}>
        {status.message}
      </span>
    </div>
  );
};

const AIProcessor = () => {
  const [file, setFile] = useState(null);
  const [text, setText] = useState('');
  const [action, setAction] = useState('summary');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [status, setStatus] = useState({
    message: '',
    emoji: '',
    isProcessing: false,
    isComplete: false,
    isError: false
  });

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);
    setLoading(true);

    setStatus({
      message: 'Procesando con IA...',
      emoji: '🤔',
      isProcessing: true,
      isComplete: false,
      isError: false
    });

    try {
      const formData = new FormData();
      if (file) {
        formData.append('file', file);
      } else if (text) {
        formData.append('text', text);
      } else {
        setError('Por favor, sube un archivo o pega un texto.');
        setStatus({
          message: 'Error: falta archivo o texto',
          emoji: '😅',
          isProcessing: false,
          isComplete: false,
          isError: true
        });
        setLoading(false);
        return;
      }
      formData.append('action', action);

      const response = await processFile(formData, action);
      console.log('📦 Respuesta de la IA:', response);

      setStatus({
        message: '¡Procesado con éxito!',
        emoji: '😎',
        isProcessing: false,
        isComplete: true,
        isError: false
      });

      setResult(response);
    } catch (err) {
      console.error('❌ Error:', err);
      setStatus({
        message: 'Error al procesar',
        emoji: '😅',
        isProcessing: false,
        isComplete: false,
        isError: true
      });
      setError(err.message || 'Error al procesar el archivo.');
    } finally {
      setLoading(false);
    }
  };

  // Renderizar flashcards
  const renderFlashcards = () => {
    if (action !== 'flashcards') return null;
    if (!result || !result.flashcards) return null;

    return (
      <div className="mt-8">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3 mb-6">
          <span className="text-3xl">📚</span> Tarjetas de estudio
          <span className="text-sm font-normal text-slate-500">
            ({result.flashcards.length} tarjetas)
          </span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {result.flashcards.map((card, index) => (
            <Flashcard
              key={index}
              question={card.question}
              answer={card.answer}
            />
          ))}
        </div>
      </div>
    );
  };

  // Renderizar resumen
  const renderSummary = () => {
    if (action !== 'summary') return null;
    if (!result) return null;

    return (
      <div className="mt-8">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3 mb-4">
          <span className="text-3xl">📝</span> Resumen
        </h2>
        <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm whitespace-pre-wrap">
          {typeof result === 'string' ? result : result.summary || JSON.stringify(result, null, 2)}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-slate-800">🧠 Procesar con IA</h1>
      
      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            📄 Subir archivo (PDF o DOCX)
          </label>
          <input
            type="file"
            accept=".pdf,.docx"
            onChange={handleFileChange}
            className="w-full p-2 border border-slate-300 rounded-lg text-sm"
          />
          {file && <p className="text-sm text-slate-600 mt-1">📎 {file.name}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            ✏️ O pega texto manualmente
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full p-3 border border-slate-300 rounded-lg h-32 text-sm resize-y"
            placeholder="Pega tu texto aquí..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            🎯 Tipo de salida
          </label>
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                value="summary"
                checked={action === 'summary'}
                onChange={(e) => setAction(e.target.value)}
                className="accent-blue-600"
              />
              Resumen
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                value="flashcards"
                checked={action === 'flashcards'}
                onChange={(e) => setAction(e.target.value)}
                className="accent-blue-600"
              />
              Tarjetas de estudio
            </label>
            
          </div>
        </div>

        <div className="flex items-center gap-4 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 text-white py-2.5 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors font-medium"
          >
            {loading ? '⏳ Procesando...' : '🚀 Procesar con IA'}
          </button>
          <LoadingIndicator status={status} />
        </div>
      </form>

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          ❌ {error}
        </div>
      )}

      {renderSummary()}
      {renderFlashcards()}
    </div>
  );
};

export default AIProcessor;