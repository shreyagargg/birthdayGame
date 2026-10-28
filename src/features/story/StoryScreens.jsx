import { useState, useContext } from 'react';
import { Volume2, VolumeX, BookOpen, Pause, ChevronRight, ChevronLeft, ArrowRight } from 'lucide-react';
import { GameContext } from '../../shared/GameContext';
import { audio } from '../../services/audioService';

export function HUDOverlay() {
  const { collectedEnvelopes, setShowJournal, setIsPaused, isMuted, toggleAudio } = useContext(GameContext);

  return (
    <div className="absolute top-4 left-4 right-4 flex justify-between items-center pointer-events-none z-20">
      <div className="bg-slate-900/85 backdrop-blur-md border border-white/10 pointer-events-auto px-4 py-2 rounded-full flex items-center space-x-3 shadow-lg">
        <span className="text-xs font-semibold tracking-wider text-amber-300 font-serif">MEMORIES:</span>
        <div className="flex space-x-1.5">
          {[1, 2, 3, 4, 5].map(idx => (
            <span key={idx} className={`text-sm ${collectedEnvelopes.includes(idx) ? 'text-amber-400 drop-shadow' : 'text-slate-600'}`}>
              ✉
            </span>
          ))}
        </div>
        <span className="text-xs font-bold text-slate-300 ml-1">{collectedEnvelopes.length}/5</span>
      </div>

      <div className="pointer-events-auto flex items-center space-x-2">
        <button
          onClick={() => setShowJournal(true)}
          className="bg-slate-900/85 backdrop-blur-md hover:bg-white/10 border border-white/10 text-amber-300 p-2 md:px-3 md:py-1.5 rounded-full flex items-center space-x-1 transition text-xs font-medium"
        >
          <BookOpen className="w-4 h-4" />
          <span className="hidden md:inline">Memory Book</span>
        </button>

        <button
          onClick={toggleAudio}
          className="bg-slate-900/85 backdrop-blur-md hover:bg-white/10 border border-white/10 text-pink-300 p-2 rounded-full transition"
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>

        <button
          onClick={() => setIsPaused(true)}
          className="bg-slate-900/85 backdrop-blur-md hover:bg-white/10 border border-white/10 text-slate-200 p-2 rounded-full transition"
        >
          <Pause className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ==========================================
// 7. DIALOGUE BANNER
// ==========================================
export function DialogueBox({ text, onClose }) {
  return (
    <div className="absolute bottom-6 left-6 right-6 md:left-24 md:right-24 bg-slate-900/90 backdrop-blur-md rounded-2xl p-4 flex items-center space-x-4 border border-amber-400/30 shadow-2xl z-30 animate-fade-in">
      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-400 to-pink-500 flex items-center justify-center text-lg shadow-md shrink-0">👑</div>
      <div className="flex-1 text-xs md:text-sm text-pink-100 font-medium leading-snug">
        {text}
      </div>
      <button onClick={onClose} className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg text-slate-200 transition shrink-0">
        Continue
      </button>
    </div>
  );
}

// ==========================================
// 8. HOME / LANDING SCREEN
// ==========================================
export function HomeScreen() {
  const { config, setGameState, setShowHowTo } = useContext(GameContext);

  const startJourney = () => {
    audio.startMusic();
    setGameState('PLAYING');
  };

  return (
    <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-30">
      <div className="max-w-md w-full flex flex-col items-center space-y-6">
        <div className="relative">
          <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-pink-500 to-amber-500 blur opacity-40 animate-pulse"></div>
          <span className="relative text-xs tracking-widest text-pink-300 font-semibold uppercase px-3 py-1 bg-slate-900/80 rounded-full border border-pink-500/30">A Romantic Journey</span>
        </div>

        <h1 className="text-4xl md:text-5xl font-black font-serif bg-clip-text text-transparent bg-gradient-to-r from-amber-200 via-pink-200 to-purple-300 drop-shadow-md">
          {config.gameTitle}
        </h1>

        <p className="text-base md:text-lg text-pink-100 italic tracking-wide max-w-sm">
          For my dearest <span className="font-bold text-amber-300 not-italic">{config.recipientNickname}</span>, every path in this kingdom leads me closer to you.
        </p>

        <div className="bg-slate-900/60 p-4 rounded-xl border border-white/10 text-xs text-slate-300 max-w-sm leading-relaxed text-left">
          <p className="mb-2">✨ <b>Five magical envelopes</b> are hidden throughout this kingdom. Each holds a secret memory message.</p>
          <p>✨ Collect all five to unlock the royal castle gates and dance beneath the stars!</p>
        </div>

        <div className="flex flex-col w-full space-y-3 pt-2">
          <button
            onClick={startJourney}
            className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold tracking-wide shadow-lg hover:shadow-pink-500/25 transition transform active:scale-95 text-base flex items-center justify-center space-x-2"
          >
            <span>Begin Adventure</span>
            <ArrowRight className="w-5 h-5" />
          </button>

          <div className="flex justify-center space-x-4 pt-2">
            <button onClick={() => setShowHowTo(true)} className="text-xs text-slate-400 hover:text-slate-200 underline">How to Play</button>
            <span className="text-slate-600">•</span>
            {/* <button onClick={() => setShowConfig(true)} className="text-xs text-pink-400 hover:text-pink-300 underline">Customize Notes & Nickname</button> */}
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 9. REVEAL SEQUENCE (FIVE SECRET NOTES)
// ==========================================
export function RevealSequence() {
  const { notes, setGameState } = useContext(GameContext);
  const [idx, setIdx] = useState(0);

  const currentNote = notes[idx];

  const handleNext = () => {
    if (idx < 4) {
      setIdx(prev => prev + 1);
      audio.playTone(500, 'sine', 0.15, 0.1);
    } else {
      setGameState('ENDING');
    }
  };

  const handlePrev = () => {
    if (idx > 0) {
      setIdx(prev => prev - 1);
      audio.playTone(400, 'sine', 0.15, 0.1);
    }
  };

  return (
    <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center p-4 z-40">
      <div className="bg-[#faf6ed] text-[#4a3525] border-2 border-amber-500 max-w-md w-full rounded-2xl p-6 md:p-8 flex flex-col items-center text-center shadow-2xl transition-all">
        <span className="text-xs uppercase font-bold tracking-widest text-amber-800 mb-2 font-serif">
          Secret Memory {idx + 1} of 5
        </span>
        <h3 className="text-2xl font-bold font-serif text-amber-950 mb-4">{currentNote.title}</h3>

        <div className="w-full max-h-60 overflow-y-auto mb-6 px-2 text-left">
          <p className="italic leading-relaxed whitespace-pre-line text-lg font-serif">
            "{currentNote.text}"
          </p>
        </div>

        <div className="flex items-center justify-between w-full pt-4 border-t border-amber-800/20">
          {idx > 0 ? (
            <button
              onClick={handlePrev}
              className="px-4 py-2 bg-amber-900/10 hover:bg-amber-900/20 text-amber-900 rounded-lg font-medium text-xs transition flex items-center space-x-1"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>
          ) : <div />}

          <button
            onClick={handleNext}
            className="px-5 py-2 bg-amber-800 hover:bg-amber-900 text-amber-50 rounded-lg font-bold text-xs transition shadow flex items-center space-x-1"
          >
            <span>{idx === 4 ? "Complete Story ✨" : "Next Memory"}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
