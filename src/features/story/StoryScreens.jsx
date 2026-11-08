import { useState, useContext } from 'react';
import { Volume2, VolumeX, BookOpen, Pause, ChevronRight, ChevronLeft, ArrowRight } from 'lucide-react';
import { GameContext } from '../../shared/GameContext';
import { audio } from '../../services/audioService';

export function HUDOverlay() {
  const { collectedEnvelopes, setShowJournal, setIsPaused, isMuted, toggleAudio } = useContext(GameContext);

  return (
    <div className="absolute top-4 left-4 right-4 flex justify-between items-center pointer-events-none z-35">
      <div className="bg-white/90 backdrop-blur-md border-2 border-amber-300 pointer-events-auto px-4 py-2 rounded-full flex items-center space-x-3 shadow-md shadow-amber-900/10 text-amber-950">
        <span className="text-xs font-bold tracking-wider text-amber-800 font-serif flex items-center gap-1">
          <span>🌸</span> MEMORIES:
        </span>
        <div className="flex space-x-1.5">
          {[1, 2, 3, 4, 5].map(idx => (
            <span
              key={idx}
              className={`text-sm transition-transform ${
                collectedEnvelopes.includes(idx)
                  ? 'text-pink-600 scale-110 drop-shadow'
                  : 'text-amber-200'
              }`}
            >
              {collectedEnvelopes.includes(idx) ? '💌' : '✉️'}
            </span>
          ))}
        </div>
        <span className="text-xs font-bold text-amber-900 ml-1 bg-amber-100 px-2 py-0.5 rounded-full">{collectedEnvelopes.length}/5</span>
      </div>

      <div className="pointer-events-auto flex items-center space-x-2">
        <button
          onClick={() => setShowJournal(true)}
          className="bg-white/90 backdrop-blur-md hover:bg-amber-50 border-2 border-amber-300 text-amber-900 p-2 md:px-3 md:py-1.5 rounded-full flex items-center space-x-1 transition text-xs font-bold shadow-md shadow-amber-900/10"
        >
          <BookOpen className="w-4 h-4 text-amber-600" />
          <span className="hidden md:inline">Memory Book</span>
        </button>

        <button
          onClick={toggleAudio}
          className="bg-white/90 backdrop-blur-md hover:bg-amber-50 border-2 border-amber-300 text-pink-600 p-2 rounded-full transition shadow-md shadow-amber-900/10"
          title={isMuted ? "Unmute Sound" : "Mute Sound"}
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-amber-700" /> : <Volume2 className="w-4 h-4 text-pink-600" />}
        </button>

        <button
          onClick={() => setIsPaused(true)}
          className="bg-white/90 backdrop-blur-md hover:bg-amber-50 border-2 border-amber-300 text-amber-800 p-2 rounded-full transition shadow-md shadow-amber-900/10"
          title="Pause Game"
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
    <div className="absolute bottom-6 left-6 right-6 md:left-24 md:right-24 bg-[#fffef9]/95 backdrop-blur-md rounded-2xl p-4 flex items-center space-x-4 border-2 border-amber-400 shadow-2xl z-30 animate-fade-in text-amber-950">
      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-400 to-rose-400 flex items-center justify-center text-lg shadow-md shrink-0">
        👑
      </div>
      <div className="flex-1 text-xs md:text-sm text-amber-900 font-medium leading-snug">
        {text}
      </div>
      <button
        onClick={onClose}
        className="text-xs bg-amber-500 hover:bg-amber-600 px-3.5 py-1.5 rounded-xl font-bold text-white transition shrink-0 shadow-sm"
      >
        Continue 🌸
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
    <div className="absolute inset-0 bg-amber-50/85 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-30 text-amber-950">
      <div className="max-w-md w-full flex flex-col items-center space-y-6">
        <div className="relative">
          <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-amber-400 via-pink-400 to-rose-400 blur opacity-50 animate-pulse"></div>
          <span className="relative text-xs tracking-widest text-amber-900 font-bold uppercase px-4 py-1.5 bg-white/95 rounded-full border border-amber-300 shadow-sm flex items-center gap-1.5">
            <span>☀️</span> Ray: Our Story <span>🌸</span>
          </span>
        </div>

        <h1 className="text-4xl md:text-5xl font-black font-serif bg-clip-text text-transparent bg-gradient-to-r from-amber-600 via-rose-500 to-pink-600 drop-shadow-sm">
          {config.gameTitle}
        </h1>

        <p className="text-base md:text-lg text-amber-900 italic tracking-wide max-w-sm">
          For my dearest <span className="font-bold text-pink-600 not-italic">{config.recipientNickname}</span>, every path in this sunlit garden leads me closer to you. 🌷
        </p>

        <div className="bg-white/85 p-5 rounded-2xl border-2 border-amber-200 shadow-md text-xs md:text-sm text-amber-900 max-w-sm leading-relaxed text-left space-y-2.5">
          <p className="flex items-start gap-2">
            <span className="text-base">🌸</span>
            <span><b>Five magical love letters</b> are blossoming throughout this garden. Each holds a secret memory message.</span>
          </p>
          <p className="flex items-start gap-2">
            <span className="text-base">☀️</span>
            <span>Collect all five to unlock the royal flower pavilion and celebrate beneath the warm sun!</span>
          </p>
        </div>

        <div className="flex flex-col w-full space-y-3 pt-2">
          <button
            onClick={startJourney}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-pink-500 to-rose-500 hover:brightness-105 text-white font-bold tracking-wide shadow-xl shadow-pink-500/25 transition transform active:scale-95 text-base flex items-center justify-center space-x-2"
          >
            <span>Begin Garden Adventure 🌻</span>
            <ArrowRight className="w-5 h-5" />
          </button>

          <div className="flex justify-center space-x-4 pt-2">
            <button
              onClick={() => setShowHowTo(true)}
              className="text-xs text-amber-800 hover:text-amber-950 font-semibold underline"
            >
              How to Play 📖
            </button>
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
      setGameState('SURPRISE');
    }
  };

  const handlePrev = () => {
    if (idx > 0) {
      setIdx(prev => prev - 1);
      audio.playTone(400, 'sine', 0.15, 0.1);
    }
  };

  return (
    <div className="absolute inset-0 bg-amber-950/25 backdrop-blur-md flex flex-col items-center justify-center p-4 z-40">
      <div className="bg-[#fffef8] text-[#4a3525] border-2 border-amber-400 max-w-md w-full rounded-3xl p-6 md:p-8 flex flex-col items-center text-center shadow-2xl transition-all">
        <span className="text-xs uppercase font-bold tracking-widest text-amber-800 mb-2 font-serif flex items-center gap-1.5">
          <span>🌸</span> Secret Garden Memory {idx + 1} of 5 <span>☀️</span>
        </span>
        <h3 className="text-2xl font-bold font-serif text-amber-950 mb-4">{currentNote.title}</h3>

        <div className="w-full max-h-60 overflow-y-auto mb-6 px-2 text-left bg-amber-50/50 p-4 rounded-2xl border border-amber-200">
          <p className="italic leading-relaxed whitespace-pre-line text-lg font-serif text-amber-950">
            "{currentNote.text}"
          </p>
        </div>

        <div className="flex items-center justify-between w-full pt-4 border-t border-amber-300">
          {idx > 0 ? (
            <button
              onClick={handlePrev}
              className="px-4 py-2 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-xl font-bold text-xs transition flex items-center space-x-1"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>
          ) : <div />}

          <button
            onClick={handleNext}
            className="px-5 py-2.5 bg-gradient-to-r from-amber-500 via-pink-500 to-rose-500 hover:brightness-105 text-white rounded-xl font-bold text-xs transition shadow-md shadow-pink-500/20 flex items-center space-x-1"
          >
            <span>{idx === 4 ? "Open Grand Surprise! 🎁✨" : "Next Memory 🌻"}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
