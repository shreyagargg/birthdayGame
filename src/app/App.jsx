import { useState, useEffect } from 'react';
import { GameContext } from '../shared/GameContext';
import { DEFAULT_CONFIG, DEFAULT_NOTES } from '../shared/gameConfig';
import { audio } from '../services/audioService';
import { GameCanvas } from '../features/game/components/GameCanvas';
import { LevelTwoQuiz } from '../features/quiz/components/LevelTwoQuiz';
import { HUDOverlay, DialogueBox, HomeScreen, RevealSequence } from '../features/story/components/StoryScreens';
import { EndingOverlay, NextChapterPreview } from '../features/story/components/EndingScreens';
import { JournalModal, HowToPlayModal, PauseModal } from '../features/story/components/UtilityModals';
import { ConfigModal } from '../features/settings/components/ConfigModal';

const safeStorage = {
  get(key) {
    try { return typeof window !== 'undefined' ? window.localStorage.getItem(key) : null; } catch { return null; }
  },
  set(key, value) {
    try { if (typeof window !== 'undefined') window.localStorage.setItem(key, value); } catch { /* storage can be disabled */ }
  }
};

function readConfig(raw) {
  try {
    const value = raw ? JSON.parse(raw) : null;
    if (!value || typeof value !== 'object' || Array.isArray(value)) return DEFAULT_CONFIG;
    return Object.fromEntries(Object.entries(DEFAULT_CONFIG).map(([key, fallback]) => [
      key, typeof value[key] === 'string' ? value[key] : fallback
    ]));
  } catch {
    return DEFAULT_CONFIG;
  }
}

function readNotes(raw) {
  try {
    const value = raw ? JSON.parse(raw) : null;
    if (!Array.isArray(value) || value.length !== 5) return DEFAULT_NOTES;
    const valid = value.every((note) => note && typeof note.title === 'string' && typeof note.text === 'string');
    return valid ? value.map((note, index) => ({ id: index + 1, title: note.title, text: note.text })) : DEFAULT_NOTES;
  } catch {
    return DEFAULT_NOTES;
  }
}

function App() {
  const [config, setConfig] = useState(() => readConfig(safeStorage.get('fairytale_react_cfg')));
  const [notes, setNotes] = useState(() => readNotes(safeStorage.get('fairytale_react_notes')));

  const [gameState, setGameState] = useState('HOME');
  const [currentLevel, setCurrentLevel] = useState(1);
  const [collectedEnvelopes, setCollectedEnvelopes] = useState([]);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizFeedback, setQuizFeedback] = useState("");
  const [quizComplete, setQuizComplete] = useState(false);

  const [showJournal, setShowJournal] = useState(false);
  const [showHowTo, setShowHowTo] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [dialogue, setDialogue] = useState(null);

  useEffect(() => {
    try { safeStorage.set('fairytale_react_cfg', JSON.stringify(config)); } catch (e) {}
  }, [config]);

  useEffect(() => {
    try { safeStorage.set('fairytale_react_notes', JSON.stringify(notes)); } catch (e) {}
  }, [notes]);

  useEffect(() => {
    try {
      const savedProgress = safeStorage.get('fairytale_react_save');
      if (savedProgress) {
        const parsed = JSON.parse(savedProgress);
        if (Array.isArray(parsed.collected)) {
          setCollectedEnvelopes([...new Set(parsed.collected.filter(n => Number.isInteger(n) && n >= 1 && n <= 5))]);
        }
        if (Number.isInteger(parsed.level) && parsed.level >= 1 && parsed.level <= 5) {
          setCurrentLevel(parsed.level);
        }
      }
    } catch (e) {}
  }, []);

  const saveProgress = (level, collected) => {
    try { safeStorage.set('fairytale_react_save', JSON.stringify({ level, collected })); } catch (e) {}
  };

  const collectEnvelope = (lvlNum) => {
    if (!collectedEnvelopes.includes(lvlNum)) {
      const next = [...collectedEnvelopes, lvlNum];
      setCollectedEnvelopes(next);
      audio.playCollectSFX();
      saveProgress(currentLevel, next);

      setDialogue(`A mysterious memory has been collected! (${next.length}/5)`);

      if (next.length === 5 && currentLevel === 5) {
        audio.playGateSFX();
      }
    }
  };

  const resetProgress = () => {
    setCollectedEnvelopes([]);
    setCurrentLevel(1);
    setQuizIndex(0);
    setQuizFeedback("");
    setQuizComplete(false);
    saveProgress(1, []);
    setGameState('HOME');
    setIsPaused(false);
    setShowJournal(false);
  };

  const toggleAudio = () => {
    const muted = audio.toggleMute();
    setIsMuted(muted);
  };

  const triggerDialogue = (text) => {
    setDialogue(text);
  };

  return (
    <GameContext.Provider value={{
      config, setConfig,
      notes, setNotes,
      gameState, setGameState,
      currentLevel, setCurrentLevel,
      collectedEnvelopes, setCollectedEnvelopes,
      collectEnvelope,
      isPaused, setIsPaused,
      isMuted, toggleAudio,
      quizIndex, setQuizIndex,
      quizFeedback, setQuizFeedback,
      quizComplete, setQuizComplete,
      showJournal, setShowJournal,
      showHowTo, setShowHowTo,
      showConfig, setShowConfig,
      dialogue, setDialogue, triggerDialogue,
      resetProgress, saveProgress
    }}>
      <div className="w-screen h-screen bg-slate-950 flex flex-col items-center justify-center font-sans text-slate-100 overflow-hidden select-none">
        <div className="relative w-full h-full max-w-6xl max-h-[800px] flex items-center justify-center overflow-hidden md:rounded-2xl border-0 md:border border-amber-500/20 shadow-2xl bg-slate-950">

          <GameCanvas />

          {gameState === 'PLAYING' && <HUDOverlay />}
          {gameState === 'PLAYING' && currentLevel === 2 && <LevelTwoQuiz />}

          {dialogue && <DialogueBox text={dialogue} onClose={() => setDialogue(null)} />}

          {gameState === 'HOME' && <HomeScreen />}
          {showJournal && <JournalModal />}
          {showHowTo && <HowToPlayModal />}
          {isPaused && <PauseModal />}
          {showConfig && <ConfigModal />}
          {gameState === 'REVEAL' && <RevealSequence />}
          {gameState === 'ENDING' && <EndingOverlay />}
          {gameState === 'PREVIEW' && <NextChapterPreview />}

        </div>
      </div>
    </GameContext.Provider>
  );
}


export default App;
