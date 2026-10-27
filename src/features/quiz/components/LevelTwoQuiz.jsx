import { useState, useEffect, useRef, useContext } from 'react';
import { Heart, Volume2, VolumeX, BookOpen, Pause, RotateCcw, ChevronRight, ChevronLeft, ArrowRight } from 'lucide-react';
import { GameContext } from '../../../shared/GameContext';
import { audio } from '../../../services/audioService';
import { DEFAULT_CONFIG, DEFAULT_NOTES } from '../../../shared/gameConfig';

const LOVE_QUIZ = [
  {
    question: "When is our anniversary?",
    options: ["14 February 2023", "25 November 2022", "1 January 2022"],
    answer: "25 November 2022"
  },
  {
    question: "When did we have our first kiss?",
    options: ["June", "December", "March"],
    answer: "June"
  },
  {
    question: "How did Mato propose to you the first time?",
    options: ["With a song", "Through a phone call", "With a letter"],
    answer: "With a letter"
  }
];

export function LevelTwoQuiz() {
  const {
    quizIndex, setQuizIndex, quizFeedback, setQuizFeedback,
    quizComplete, setQuizComplete, collectedEnvelopes, collectEnvelope,
    setCurrentLevel, triggerDialogue
  } = useContext(GameContext);
  const [selectedOption, setSelectedOption] = useState("");

  const question = LOVE_QUIZ[quizIndex];

  const submitAnswer = () => {
    if (!selectedOption || !question) return;
    if (selectedOption === question.answer) {
      audio.playCollectSFX();
      setQuizFeedback("Correct! One more little piece of our story remembered. 💗");
      if (quizIndex === LOVE_QUIZ.length - 1) {
        setQuizComplete(true);
        if (!collectedEnvelopes.includes(2)) collectEnvelope(2);
      } else {
        setQuizIndex(index => index + 1);
      }
      setSelectedOption("");
    } else {
      setQuizFeedback("Not quite! Try again, prince. You know this story. 💌");
      audio.playTone(220, "sine", 0.2, 0.08);
    }
  };

  const continueToLevelThree = () => {
    setQuizFeedback("");
    setSelectedOption("");
    setCurrentLevel(3);
    triggerDialogue("The second letter is yours. The Crystal Garden awaits! ✨");
  };

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-xl rounded-3xl border border-pink-300/30 bg-slate-900/95 p-6 md:p-8 text-center shadow-2xl">
        <div className="mb-3 text-3xl">💌</div>
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-pink-300">Level 2 · The Moonlit Memories</p>
        {quizComplete ? (
          <>
            <h2 className="mt-3 text-2xl md:text-3xl font-serif font-bold text-amber-200">Letter No. 2 Unlocked!</h2>
            <p className="mt-3 text-sm leading-relaxed text-pink-100">Three memories, three correct answers. The prince has earned the second letter.</p>
            <div className="my-5 rounded-2xl border border-amber-300/30 bg-amber-300/10 p-4 text-4xl">✉️ 💖 👑</div>
            <button onClick={continueToLevelThree} className="w-full rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 px-5 py-3 font-bold text-white transition hover:brightness-110">
              Continue to Level 3 <span aria-hidden="true">→</span>
            </button>
          </>
        ) : (
          <>
            <div className="mt-5 flex justify-center gap-2">
              {LOVE_QUIZ.map((item, index) => (
                <span key={item.question} className={`h-2 w-12 rounded-full ${index < quizIndex ? "bg-emerald-400" : index === quizIndex ? "bg-pink-400" : "bg-slate-700"}`} />
              ))}
            </div>
            <p className="mt-4 text-xs text-slate-400">Question {quizIndex + 1} of {LOVE_QUIZ.length}</p>
            <h2 className="mt-2 text-xl md:text-2xl font-serif font-bold text-amber-100">{question.question}</h2>
            <div className="mt-5 grid gap-3">
              {question.options.map(option => (
                <button
                  key={option}
                  onClick={() => setSelectedOption(option)}
                  className={`rounded-xl border px-4 py-3 text-left text-sm transition ${
                    selectedOption === option
                      ? "border-pink-300 bg-pink-500/20 text-white"
                      : "border-white/10 bg-white/5 text-slate-200 hover:border-pink-300/50 hover:bg-white/10"
                  }`}
                >
                  <span className="mr-3 text-pink-300">{selectedOption === option ? "●" : "○"}</span>{option}
                </button>
              ))}
            </div>
            {quizFeedback && <p role="status" className="mt-4 text-sm text-pink-200">{quizFeedback}</p>}
            <button onClick={submitAnswer} disabled={!selectedOption} className="mt-5 w-full rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 px-5 py-3 font-bold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40">
              Lock in answer
            </button>
          </>
        )}
      </div>
    </div>
  );
}
