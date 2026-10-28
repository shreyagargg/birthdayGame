import { useContext } from 'react';
import { GameContext } from '../../shared/GameContext';

export function JournalModal() {
  const { collectedEnvelopes, gameState, notes, setShowJournal } = useContext(GameContext);

  return (
    <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 z-40">
      <div className="bg-[#faf6ed] text-[#4a3525] border-2 border-amber-500 max-w-lg w-full rounded-2xl p-6 relative flex flex-col items-center max-h-[90vh] overflow-y-auto">
        <button onClick={() => setShowJournal(false)} className="absolute top-4 right-4 text-amber-900 hover:text-amber-700 font-bold text-xl">✕</button>

        <h2 className="text-2xl font-serif font-bold text-amber-900 mb-1">Memory Book</h2>
        <p className="text-xs text-amber-800/80 mb-6 italic">Envelopes collected so far</p>

        <div className="w-full space-y-3 mb-6">
          {[1, 2, 3, 4, 5].map(i => {
            const isCollected = collectedEnvelopes.includes(i);
            return (
              <div
                key={i}
                className={`p-3 rounded-xl border ${isCollected ? 'bg-amber-100/60 border-amber-400 text-amber-950' : 'bg-amber-950/10 border-amber-900/10 text-amber-900/40'} flex items-center justify-between text-xs font-semibold`}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-base">{isCollected ? '💌' : '🔒'}</span>
                  <span>Memory #{i}</span>
                </div>
                <span className="italic font-normal">
                  {isCollected ? (gameState === 'ENDING' ? notes[i - 1].title : 'Collected (Secret)') : 'Undiscovered'}
                </span>
              </div>
            );
          })}
        </div>

        <div className="text-center text-xs text-amber-900/70 italic border-t border-amber-800/20 pt-4 w-full">
          Collect all 5 envelopes across the kingdom to unlock the messages in the castle garden.
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
    <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 z-40">
      <div className="bg-slate-900/90 border border-white/10 max-w-md w-full rounded-2xl p-6 relative">
        <button onClick={() => setShowHowTo(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white font-bold text-lg">✕</button>
        <h2 className="text-xl font-serif font-bold text-amber-300 mb-4 flex items-center space-x-2">
          <span>👑 How to Play</span>
        </h2>
        <div className="space-y-4 text-sm text-slate-200">
          <div>
            <h3 className="font-bold text-pink-300 mb-1">Keyboard Controls (Desktop)</h3>
            <ul className="list-disc list-inside text-xs text-slate-300 space-y-1">
              <li><kbd className="px-1.5 py-0.5 bg-slate-800 rounded">A</kbd> / <kbd className="px-1.5 py-0.5 bg-slate-800 rounded">←</kbd> : Move Left</li>
              <li><kbd className="px-1.5 py-0.5 bg-slate-800 rounded">D</kbd> / <kbd className="px-1.5 py-0.5 bg-slate-800 rounded">→</kbd> : Move Right</li>
              <li><kbd className="px-1.5 py-0.5 bg-slate-800 rounded">Space</kbd> / <kbd className="px-1.5 py-0.5 bg-slate-800 rounded">↑</kbd> / <kbd className="px-1.5 py-0.5 bg-slate-800 rounded">W</kbd> : Jump</li>
              <li><kbd className="px-1.5 py-0.5 bg-slate-800 rounded">E</kbd> / <kbd className="px-1.5 py-0.5 bg-slate-800 rounded">Enter</kbd> : Interact / Collect</li>
              <li>Level 5: use the arrow keys or WASD to move one grid tile at a time.</li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-amber-300 mb-1">Objective</h3>
            <p className="text-xs text-slate-300">Explore the kingdom, answer three personal-memory questions in Level 2, solve the Crystal Garden puzzle, cross the royal grid in Level 5, and collect all five letters to meet your Princess!</p>
          </div>
        </div>
        <button onClick={() => setShowHowTo(false)} className="mt-6 w-full py-2 bg-pink-600 hover:bg-pink-500 text-white font-semibold rounded-xl transition text-sm">Got it!</button>
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
    <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 z-40">
      <div className="bg-slate-900 border border-white/10 max-w-sm w-full rounded-2xl p-6 text-center space-y-4">
        <h2 className="text-2xl font-serif font-bold text-amber-300">Game Paused</h2>
        <div className="flex flex-col space-y-2 pt-2">
          <button onClick={() => setIsPaused(false)} className="w-full py-2.5 bg-pink-600 hover:bg-pink-500 text-white font-semibold rounded-xl transition text-sm">Resume Game</button>
          <button onClick={() => setShowHowTo(true)} className="w-full py-2.5 bg-white/10 hover:bg-white/20 text-slate-200 font-semibold rounded-xl transition text-sm">How to Play</button>
          <button onClick={confirmReset} className="w-full py-2.5 bg-red-500/20 hover:bg-red-500/40 border border-red-500/30 text-red-200 font-semibold rounded-xl transition text-sm">Reset Progress</button>
        </div>
      </div>
    </div>
  );
}
