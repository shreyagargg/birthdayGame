import { useContext } from 'react';
import { GameContext } from '../../shared/GameContext';

export function JournalModal() {
  const { collectedEnvelopes, gameState, notes, setShowJournal } = useContext(GameContext);

  return (
    <div className="absolute inset-0 bg-amber-950/25 backdrop-blur-md flex items-center justify-center p-4 z-40">
      <div className="bg-[#fffef8] text-[#4a3525] border-2 border-amber-400 max-w-lg w-full rounded-3xl p-6 relative flex flex-col items-center max-h-[90vh] overflow-y-auto shadow-2xl">
        <button
          onClick={() => setShowJournal(false)}
          className="absolute top-4 right-4 text-amber-800 hover:text-amber-950 font-bold text-xl w-8 h-8 rounded-full bg-amber-100 hover:bg-amber-200 flex items-center justify-center transition"
        >
          ✕
        </button>

        <h2 className="text-2xl font-serif font-bold text-amber-900 mb-1 flex items-center gap-2">
          <span>🌸</span> Memory Book <span>🌻</span>
        </h2>
        <p className="text-xs text-amber-800/80 mb-6 italic">Love letters and secrets gathered in the sunlit garden</p>

        <div className="w-full space-y-3 mb-6">
          {[1, 2, 3, 4, 5].map(i => {
            const isCollected = collectedEnvelopes.includes(i);
            return (
              <div
                key={i}
                className={`p-3.5 rounded-2xl border transition ${
                  isCollected
                    ? 'bg-amber-100/70 border-amber-300 text-amber-950 shadow-sm'
                    : 'bg-amber-50/40 border-amber-200/50 text-amber-800/40'
                } flex items-center justify-between text-xs font-semibold`}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-lg">{isCollected ? '💌' : '🔒'}</span>
                  <span className="font-bold">Memory #{i}</span>
                </div>
                <span className="italic font-normal">
                  {isCollected ? (gameState === 'ENDING' ? notes[i - 1].title : '🌸 Collected (Secret)') : 'Undiscovered in the Garden'}
                </span>
              </div>
            );
          })}
        </div>

        <div className="text-center text-xs text-amber-800/80 italic border-t border-amber-300/60 pt-4 w-full">
          Collect all 5 letters across the garden to unlock the messages in the royal flower pavilion! ☀️
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 13. HOW TO PLAY MODAL
// ==========================================
export function HowToPlayModal() {
  const { setShowHowTo } = useContext(GameContext);

  return (
    <div className="absolute inset-0 bg-amber-950/25 backdrop-blur-md flex items-center justify-center p-4 z-40">
      <div className="bg-[#fffef8] border-2 border-amber-400 max-w-md w-full rounded-3xl p-6 relative shadow-2xl text-amber-950">
        <button
          onClick={() => setShowHowTo(false)}
          className="absolute top-4 right-4 text-amber-800 hover:text-amber-950 font-bold text-lg w-8 h-8 rounded-full bg-amber-100 hover:bg-amber-200 flex items-center justify-center transition"
        >
          ✕
        </button>
        <h2 className="text-xl font-serif font-bold text-amber-900 mb-4 flex items-center space-x-2">
          <span>🌻 How to Play in the Garden ☀️</span>
        </h2>
        <div className="space-y-4 text-sm text-amber-950">
          <div>
            <h3 className="font-bold text-pink-700 mb-1 flex items-center gap-1.5">
              <span>🎮</span> Controls (Desktop & Mobile)
            </h3>
            <ul className="list-disc list-inside text-xs text-amber-900 space-y-1.5 leading-relaxed">
              <li><kbd className="px-1.5 py-0.5 bg-amber-100 border border-amber-300 font-bold rounded">A</kbd> / <kbd className="px-1.5 py-0.5 bg-amber-100 border border-amber-300 font-bold rounded">←</kbd> : Move Left</li>
              <li><kbd className="px-1.5 py-0.5 bg-amber-100 border border-amber-300 font-bold rounded">D</kbd> / <kbd className="px-1.5 py-0.5 bg-amber-100 border border-amber-300 font-bold rounded">→</kbd> : Move Right</li>
              <li><kbd className="px-1.5 py-0.5 bg-amber-100 border border-amber-300 font-bold rounded">Space</kbd> / <kbd className="px-1.5 py-0.5 bg-amber-100 border border-amber-300 font-bold rounded">↑</kbd> / <kbd className="px-1.5 py-0.5 bg-amber-100 border border-amber-300 font-bold rounded">W</kbd> : Jump</li>
              <li><kbd className="px-1.5 py-0.5 bg-amber-100 border border-amber-300 font-bold rounded">E</kbd> / <kbd className="px-1.5 py-0.5 bg-amber-100 border border-amber-300 font-bold rounded">Enter</kbd> : Interact / Bloom / Collect</li>
              <li>Level 1: Click or tap puzzle pieces to swap them and restore the sunlit garden picture.</li>
              <li>Level 5: Use the arrow keys or WASD to walk through the royal rose hedge maze.</li>
            </ul>
          </div>
          <div className="bg-amber-100/60 p-3.5 rounded-2xl border border-amber-300">
            <h3 className="font-bold text-amber-900 mb-1 flex items-center gap-1">
              <span>🌸</span> Objective
            </h3>
            <p className="text-xs text-amber-900/90 leading-relaxed">
              Solve the sunlit jigsaw puzzle in Level 1, answer three personal-memory questions in Level 2, bloom the enchanted garden flowers in Level 3, cross the petal bridge in Level 4, and navigate the royal rose garden maze in Level 5 to collect all five letters and meet your Princess!
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowHowTo(false)}
          className="mt-6 w-full py-2.5 bg-gradient-to-r from-amber-500 via-pink-500 to-rose-500 hover:brightness-105 text-white font-bold rounded-xl transition text-sm shadow-md shadow-pink-500/25"
        >
          Got it! Let's Bloom 🌸
        </button>
      </div>
    </div>
  );
}

// ==========================================
// 14. PAUSE MENU MODAL
// ==========================================
export function PauseModal() {
  const { setIsPaused, setShowHowTo, resetProgress } = useContext(GameContext);

  const confirmReset = () => {
    if (window.confirm("Would you like to begin a new adventure? Your collected memories and current progress will be reset.")) {
      resetProgress();
    }
  };

  return (
    <div className="absolute inset-0 bg-amber-950/25 backdrop-blur-md flex items-center justify-center p-4 z-40">
      <div className="bg-[#fffef8] border-2 border-amber-400 max-w-sm w-full rounded-3xl p-6 text-center space-y-4 shadow-2xl text-amber-950">
        <h2 className="text-2xl font-serif font-bold text-amber-900 flex items-center justify-center gap-2">
          <span>☀️</span> Garden Paused <span>🌸</span>
        </h2>
        <div className="flex flex-col space-y-2.5 pt-2">
          <button
            onClick={() => setIsPaused(false)}
            className="w-full py-2.5 bg-gradient-to-r from-amber-500 via-pink-500 to-rose-500 hover:brightness-105 text-white font-bold rounded-xl transition text-sm shadow-md shadow-pink-500/20"
          >
            Resume Adventure 🌻
          </button>
          <button
            onClick={() => setShowHowTo(true)}
            className="w-full py-2.5 bg-amber-100 hover:bg-amber-200 border border-amber-300 text-amber-900 font-bold rounded-xl transition text-sm shadow-sm"
          >
            How to Play 📖
          </button>
          <button
            onClick={confirmReset}
            className="w-full py-2.5 bg-rose-50 hover:bg-rose-100 border border-rose-300 text-rose-800 font-bold rounded-xl transition text-sm"
          >
            Reset Progress
          </button>
        </div>
      </div>
    </div>
  );
}
