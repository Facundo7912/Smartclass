import { useState } from 'react';
import { processFile } from '../services/ai.service';

const AIProcessor = () => {
  const [file, setFile] = useState(null);
  const [text, setText] = useState('');
  const [action, setAction] = useState('summary');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [error, setError] = useState('');

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

    try {
      const formData = new FormData();

      if (file) {
        formData.append('file', file);
      }

      if (text.trim()) {
        formData.append('text', text);
      }

      const response = await processFile(formData, action);
      setResult(response.result || 'Procesamiento completado.');
    } catch (err) {
      setError(err.message || 'No se pudo procesar la solicitud.');
    } finally {
      setLoading(false);
    }
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

        <button
          type="submit"
          disabled={loading || (!file && !text.trim())}
          className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {loading ? 'Procesando...' : 'Procesar con IA'}
        </button>
      </form>

      {error && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {result && (
        <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-emerald-700">
            Resultado
          </h3>
          <div className="whitespace-pre-wrap text-sm leading-7 text-slate-700">{result}</div>
        </div>
      )}
    </div>
  );
};

export default AIProcessor;
