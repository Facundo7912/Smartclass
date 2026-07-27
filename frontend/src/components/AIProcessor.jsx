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

      // ✅ CORRECCIÓN: Procesar la respuesta
      if (response.isFile) {
        // Es un archivo (PPT)
        setStatus({
          message: '¡PPT generado con éxito!',
          emoji: '😎',
          isProcessing: false,
          isComplete: true,
          isError: false
        });
        const url = URL.createObjectURL(response.blob);
        setResult({
          type: 'file',
          downloadUrl: url,
          fileName: response.fileName
        });
        setLoading(false);
        return;
      }

      // ========== PROCESAMIENTO DE RESPUESTAS DE TEXTO ==========
      const textResponse = response.result || response;
      
      // Si es flashcards
      if (action === 'flashcards') {
        console.log('🎴 Procesando flashcards con texto:', typeof textResponse);
        
        // Intentar parsear como JSON
        try {
          const parsed = typeof textResponse === 'string' ? JSON.parse(textResponse) : textResponse;
          if (parsed.flashcards && Array.isArray(parsed.flashcards)) {
            setResult({
              type: 'flashcards',
              data: parsed.flashcards
            });
            setStatus({
              message: '¡Procesado con éxito!',
              emoji: '😎',
              isProcessing: false,
              isComplete: true,
              isError: false
            });
            setLoading(false);
            return;
          }
          if (Array.isArray(parsed)) {
            setResult({
              type: 'flashcards',
              data: parsed
            });
            setStatus({
              message: '¡Procesado con éxito!',
              emoji: '😎',
              isProcessing: false,
              isComplete: true,
              isError: false
            });
            setLoading(false);
            return;
          }
        } catch (e) {
          console.log('No es JSON válido, procesando como texto plano');
        }

        // Si no es JSON, extraer flashcards del texto
        const text = typeof textResponse === 'string' ? textResponse : JSON.stringify(textResponse);
        const flashcards = [];

        // Buscar patrones de pregunta/respuesta
        const lines = text.split('\n').filter(line => line.trim());
        let currentQuestion = '';
        let currentAnswer = '';
        let isCollectingAnswer = false;

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim();
          
          // Detectar pregunta
          if (line.match(/^(Pregunta|Q|Question)\s*[:.]/i)) {
            if (currentQuestion && currentAnswer) {
              flashcards.push({ question: currentQuestion.trim(), answer: currentAnswer.trim() });
              currentQuestion = '';
              currentAnswer = '';
            }
            currentQuestion = line.replace(/^(Pregunta|Q|Question)\s*[:.]\s*/i, '');
            isCollectingAnswer = false;
          }
          // Detectar respuesta
          else if (line.match(/^(Respuesta|A|Answer)\s*[:.]/i)) {
            currentAnswer = line.replace(/^(Respuesta|A|Answer)\s*[:.]\s*/i, '');
            isCollectingAnswer = true;
          }
          // Si estamos recolectando respuesta, agregar líneas
          else if (isCollectingAnswer && currentAnswer) {
            currentAnswer += ' ' + line;
          }
          // Si no hay marcadores pero estamos en una pregunta
          else if (currentQuestion && !currentAnswer && line) {
            currentQuestion += ' ' + line;
          }
        }

        // Guardar la última tarjeta
        if (currentQuestion && currentAnswer) {
          flashcards.push({ question: currentQuestion.trim(), answer: currentAnswer.trim() });
        }

        // Si no se encontraron tarjetas, buscar formato numerado
        if (flashcards.length === 0) {
          const questionRegex = /(\d+)[.)]\s*([^?]+[?])/g;
          const answerRegex = /(\d+)[.)]\s*([^?]+)(?:\n|$)/g;
          const tempQuestions = {};
          const tempAnswers = {};
          let match;

          while ((match = questionRegex.exec(text)) !== null) {
            tempQuestions[match[1]] = match[2].trim();
          }
          while ((match = answerRegex.exec(text)) !== null) {
            tempAnswers[match[1]] = match[2].trim();
          }

          const keys = Object.keys(tempQuestions);
          for (const key of keys) {
            if (tempQuestions[key] && tempAnswers[key]) {
              flashcards.push({ question: tempQuestions[key], answer: tempAnswers[key] });
            }
          }
        }

        // Si hay tarjetas, mostrarlas
        if (flashcards.length > 0) {
          setResult({
            type: 'flashcards',
            data: flashcards.slice(0, 6)
          });
          setStatus({
            message: '¡Procesado con éxito!',
            emoji: '😎',
            isProcessing: false,
            isComplete: true,
            isError: false
          });
        } else {
          // Si no se encontraron tarjetas, mostrar el texto plano
          setResult({
            type: 'text',
            data: text
          });
          setStatus({
            message: '¡Procesado con éxito!',
            emoji: '😎',
            isProcessing: false,
            isComplete: true,
            isError: false
          });
        }
        setLoading(false);
        return;
      }

      // ========== RESUMEN (TEXTO) ==========
      setResult({
        type: 'text',
        data: typeof textResponse === 'string' ? textResponse : JSON.stringify(textResponse, null, 2)
      });
      setStatus({
        message: '¡Procesado con éxito!',
        emoji: '😎',
        isProcessing: false,
        isComplete: true,
        isError: false
      });
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

  // ========== RENDERIZAR RESULTADOS ==========

  const renderFlashcards = () => {
    if (action !== 'flashcards') return null;
    if (!result || result.type !== 'flashcards') return null;

    const flashcards = result.data;

    if (!Array.isArray(flashcards) || flashcards.length === 0) {
      return (
        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-700">⚠️ No se generaron tarjetas. Intenta con otro archivo.</p>
        </div>
      );
    }

    return (
      <div className="mt-8">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3 mb-6">
          <span className="text-3xl">📚</span> Tarjetas de estudio
          <span className="text-sm font-normal text-slate-500">
            ({flashcards.length} tarjetas)
          </span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {flashcards.map((card, index) => (
            <Flashcard
              key={index}
              question={card.question || card.pregunta || `Pregunta ${index + 1}`}
              answer={card.answer || card.respuesta || 'Sin respuesta'}
            />
          ))}
        </div>
      </div>
    );
  };

  const renderSummary = () => {
    if (action !== 'summary') return null;
    if (!result || result.type !== 'text') return null;

    return (
      <div className="mt-8">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3 mb-4">
          <span className="text-3xl">📝</span> Resumen
        </h2>
        <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm whitespace-pre-wrap">
          {result.data}
        </div>
      </div>
    );
  };

  const renderPPT = () => {
    if (action !== 'ppt') return null;
    if (!result || result.type !== 'file') return null;

    return (
      <div className="mt-8 p-6 bg-green-50 border border-green-200 rounded-xl">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3 mb-4">
          <span className="text-3xl">📊</span> PowerPoint generado
        </h2>
        <div className="flex flex-wrap items-center gap-4">
          <span className="text-sm text-slate-700">📄 {result.fileName}</span>
          <a
            href={result.downloadUrl}
            download={result.fileName}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
          >
            ⬇️ Descargar PPT
          </a>
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
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                value="ppt"
                checked={action === 'ppt'}
                onChange={(e) => setAction(e.target.value)}
                className="accent-blue-600"
              />
              PPT
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
      {renderPPT()}
    </div>
  );
};

export default AIProcessor;