import { useState, useContext } from 'react';
import { GameContext } from '../../shared/GameContext';
import { audio } from '../../services/audioService';

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
      setQuizFeedback("Ohhoo !! Mithu kya baat h");
      if (quizIndex === LOVE_QUIZ.length - 1) {
        setQuizComplete(true);
        if (!collectedEnvelopes.includes(2)) collectEnvelope(2);
      } else {
        setQuizIndex(index => index + 1);
      }
      setSelectedOption("");
    } else {
      setQuizFeedback("Harami!! dhang se yaad kar chomu");
      audio.playTone(220, "sine", 0.2, 0.08);
    }
  };

  const continueToLevelThree = () => {
    setQuizFeedback("");
    setSelectedOption("");
    setCurrentLevel(3);
    triggerDialogue("The second letter is yours. The Blooming Flower Garden awaits! 🌸✨");
  };

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-amber-950/25 backdrop-blur-sm p-4 pt-16">
      <div className="w-full max-w-xl rounded-3xl border-2 border-amber-300/90 bg-[#fffef9]/95 backdrop-blur-md p-6 md:p-8 text-center shadow-2xl text-amber-950">
        <div className="mb-2 text-3xl">🌻 💌 ☀️</div>
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-amber-700">Level 2 · Sawal Jawab</p>
        {quizComplete ? (
          <>
            <h2 className="mt-3 text-2xl md:text-3xl font-serif font-bold text-amber-900">Letter No. 2 Unlocked! 🌻</h2>
            <p className="mt-3 text-sm leading-relaxed text-amber-800">Three beautiful memories, three sweet answers. The prince has earned the second garden letter!</p>
            <div className="my-5 rounded-2xl border border-amber-300 bg-amber-100/70 p-4 text-4xl shadow-inner">✉️ 🌻 👑</div>
            <button
              onClick={continueToLevelThree}
              className="w-full rounded-xl bg-gradient-to-r from-amber-500 via-pink-500 to-rose-500 px-5 py-3.5 font-bold text-white transition hover:brightness-105 shadow-lg shadow-pink-500/25"
            >
              Continue to Level 3 <span aria-hidden="true">→</span>
            </button>
          </>
        ) : (
          <>
            <div className="mt-5 flex justify-center gap-2">
              {LOVE_QUIZ.map((item, index) => (
                <span
                  key={item.question}
                  className={`h-2.5 w-14 rounded-full transition-all ${
                    index < quizIndex
                      ? "bg-amber-500"
                      : index === quizIndex
                      ? "bg-pink-500 shadow-sm"
                      : "bg-amber-200"
                  }`}
                />
              ))}
            </div>
            <p className="mt-4 text-xs font-semibold text-amber-700">Memory Question {quizIndex + 1} of {LOVE_QUIZ.length}</p>
            <h2 className="mt-2 text-xl md:text-2xl font-serif font-bold text-amber-900">{question.question}</h2>
            <div className="mt-5 grid gap-3">
              {question.options.map(option => (
                <button
                  key={option}
                  onClick={() => setSelectedOption(option)}
                  className={`rounded-xl border-2 px-4 py-3 text-left text-sm font-medium transition ${
                    selectedOption === option
                      ? "border-pink-500 bg-pink-100/90 text-pink-950 font-bold shadow-sm"
                      : "border-amber-200/80 bg-amber-50/60 text-amber-900 hover:border-amber-400 hover:bg-amber-100/70"
                  }`}
                >
                  <span className="mr-3 text-base text-pink-500">{selectedOption === option ? "🌸" : "⚪"}</span>
                  {option}
                </button>
              ))}
            </div>
            {quizFeedback && (
              <div role="status" className="mt-4 rounded-xl border border-pink-200 bg-pink-50/90 p-2.5 text-sm font-medium text-pink-800 shadow-sm">
                {quizFeedback}
              </div>
            )}
            <button
              onClick={submitAnswer}
              disabled={!selectedOption}
              className="mt-5 w-full rounded-xl bg-gradient-to-r from-amber-500 via-pink-500 to-rose-500 px-5 py-3.5 font-bold text-white transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-40 shadow-lg shadow-pink-500/25"
            >
              Lock in answer 💌
            </button>
          </>
        )}
      </div>
    </div>
  );
}
