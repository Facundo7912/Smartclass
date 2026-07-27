import { useState } from 'react';

const Flashcard = ({ question, answer, index }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const toggleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <div
      className="h-64 w-full cursor-pointer perspective"
      onClick={toggleFlip}
      style={{ perspective: '1000px' }}
    >
      {/* Contenedor de la tarjeta con perspectiva 3D */}
      <div
        className="relative w-full h-full transition-transform duration-500"
        style={{
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* ===== FRENTE (PREGUNTA) ===== */}
        <div
          className="absolute w-full h-full rounded-2xl border-2 border-slate-300 bg-white p-8 shadow-lg flex flex-col items-center justify-center"
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
          }}
        >
          <div className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-4">
            Pregunta
          </div>
          <p className="text-lg font-semibold text-slate-800 text-center leading-relaxed">
            {question}
          </p>
          <div className="mt-6 text-xs text-slate-400 opacity-75">
            Haz clic para ver la respuesta
          </div>
        </div>

        {/* ===== REVERSO (RESPUESTA) ===== */}
        <div
          className="absolute w-full h-full rounded-2xl border-2 border-emerald-300 bg-gradient-to-br from-emerald-50 to-teal-50 p-8 shadow-lg flex flex-col items-center justify-center"
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          <div className="text-xs font-semibold uppercase tracking-widest text-emerald-600 mb-4">
            Respuesta
          </div>
          <p className="text-base font-normal text-slate-700 text-center leading-relaxed">
            {answer}
          </p>
          <div className="mt-6 text-xs text-slate-400 opacity-75">
            Haz clic para volver a la pregunta
          </div>
        </div>
      </div>

      {/* Indicador de estado */}
      <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs font-medium text-slate-500 whitespace-nowrap">
        {index && <span className="text-slate-400">Tarjeta {index}</span>}
      </div>
    </div>
  );
};

export default Flashcard;
