import {  useContext } from 'react';
import { Heart, RotateCcw, ChevronLeft } from 'lucide-react';
import { GameContext } from '../../shared/GameContext';

export function EndingOverlay() {
  const { config, setGameState, resetProgress } = useContext(GameContext);

  const relive = () => {
    if (window.confirm("Would you like to restart your fairytale journey? Your collected envelope progress will reset, but your personal notes will be saved.")) {
      resetProgress();
    }
  };

  return (
    <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-40 overflow-y-auto">
      <div className="max-w-md w-full flex flex-col items-center space-y-6">
        <Heart className="w-12 h-12 text-pink-500 fill-pink-500 animate-bounce" />
        <h2 className="text-3xl font-bold font-serif text-amber-300">Our Fairytale Begins</h2>

        <div className="bg-[#faf6ed] text-[#4a3525] border-2 border-amber-500 p-6 rounded-2xl w-full text-left font-serif text-base md:text-lg leading-relaxed shadow-xl whitespace-pre-line">
          {config.dedicationText.replaceAll('[SPECIAL NICKNAME]', config.recipientNickname)}
        </div>

        <div className="flex flex-col w-full space-y-3 pt-2">
          <button
            onClick={() => setGameState('PREVIEW')}
            className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold rounded-xl shadow-lg transition text-sm flex items-center justify-center space-x-2"
          >
            <span>Continue to the Next Chapter ✨</span>
          </button>

          <button
            onClick={relive}
            className="w-full py-3 bg-white/10 hover:bg-white/20 text-amber-200 font-semibold rounded-xl border border-amber-400/30 transition text-sm flex items-center justify-center space-x-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Relive the Adventure</span>
          </button>

          <button
            onClick={() => setGameState('REVEAL')}
            className="text-xs text-pink-300 hover:text-pink-200 underline pt-1"
          >
            Re-read All 5 Secret Notes
          </button>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 11. NEXT CHAPTER PREVIEW TEASER
// ==========================================
export function NextChapterPreview() {
  const { setGameState } = useContext(GameContext);

  return (
    <div className="absolute inset-0 bg-slate-950 flex flex-col items-center justify-center p-6 text-center z-50">
      <div className="max-w-md w-full flex flex-col items-center space-y-6">
        <span className="text-xs font-serif tracking-widest text-purple-400 uppercase">Teaser Preview</span>
        <h2 className="text-3xl font-bold font-serif text-amber-200">The Horizon Beyond</h2>

        <div className="w-full h-44 rounded-xl border border-white/10 overflow-hidden relative shadow-2xl bg-gradient-to-b from-indigo-950 via-purple-950 to-slate-950 flex items-center justify-center">
          <div className="z-10 text-center px-4">
            <p className="font-serif italic text-2xl text-pink-200">"Where will our next adventure take us?"</p>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed max-w-sm">
          The first journey brought us together under the stars. New realms, grander puzzles, and endless memories await in our future together.
        </p>

        <button
          onClick={() => setGameState('ENDING')}
          className="py-2.5 px-6 bg-pink-600 hover:bg-pink-500 text-white font-bold rounded-xl transition text-sm flex items-center space-x-2"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Our Story</span>
        </button>
      </div>
    </div>
  );
}
