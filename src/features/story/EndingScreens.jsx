import { useContext } from 'react';
import { Heart, RotateCcw } from 'lucide-react';
import { GameContext } from '../../shared/GameContext';

export function EndingOverlay() {
  const { config, setGameState, resetProgress } = useContext(GameContext);

  const relive = () => {
    if (window.confirm("Would you like to restart your fairytale journey? Your collected envelope progress will reset, but your personal notes will be saved.")) {
      resetProgress();
    }
  };

  return (
    <div className="absolute inset-0 bg-amber-950/25 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-40 overflow-y-auto">
      <div className="max-w-md w-full flex flex-col items-center space-y-6">
        <div className="flex items-center gap-2 text-3xl animate-bounce">
          <span>🌸</span>
          <Heart className="w-10 h-10 text-rose-500 fill-rose-500" />
          <span>🌻</span>
        </div>
        <h2 className="text-3xl font-black font-serif text-amber-900">Our Fairytale Blooms Forever</h2>

        <div className="bg-[#fffef8] text-[#4a3525] border-2 border-amber-400 p-6 rounded-3xl w-full text-left font-serif text-base md:text-lg leading-relaxed shadow-xl whitespace-pre-line">
          {config.dedicationText.replaceAll('[SPECIAL NICKNAME]', config.recipientNickname)}
        </div>

        <div className="flex flex-col w-full space-y-3 pt-2">
          <button
            onClick={() => setGameState('SURPRISE')}
            className="w-full py-3.5 bg-gradient-to-r from-amber-400 via-rose-500 to-pink-500 hover:brightness-110 text-white font-black rounded-2xl shadow-xl shadow-pink-500/30 transition text-base flex items-center justify-center space-x-2 animate-pulse"
          >
            <span>Open Grand Surprises! 🎁🎆</span>
          </button>

          <button
            onClick={relive}
            className="w-full py-3 bg-white/10 hover:bg-white/20 text-amber-900 border border-amber-300 font-bold rounded-2xl transition text-sm flex items-center justify-center space-x-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Relive the Garden Adventure 🌻</span>
          </button>

          <button
            onClick={() => setGameState('REVEAL')}
            className="text-xs text-amber-800 hover:text-amber-950 font-bold underline pt-1"
          >
            Re-read All 5 Secret Garden Notes 💌
          </button>
        </div>
      </div>
    </div>
  );
}

export function NextChapterPreview() {
  return null;
}
