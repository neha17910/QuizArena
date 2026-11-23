import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { sounds } from '../utils/soundEffects';
import confetti from 'canvas-confetti';
import {
  Layers,
  RotateCw,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  Sparkles,
  Award,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';

export default function FlashcardsPage() {
  const { id } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [masteredCount, setMasteredCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`/api/quizzes/${id}`);
        if (res.data.success) {
          setQuiz(res.data.quiz);
        }
      } catch (err) {
        console.warn('Could not load flashcard quiz:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [id]);

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-400">
        <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p>Loading Interactive Study Deck...</p>
      </div>
    );
  }

  const questions = quiz?.questions || [];
  const currentQ = questions[currentIndex];

  const handleFlip = () => {
    sounds.playClick();
    setFlipped(!flipped);
  };

  const handleNext = (mastered) => {
    if (mastered) {
      sounds.playCorrect();
      setMasteredCount((prev) => prev + 1);
    } else {
      sounds.playClick();
    }

    setFlipped(false);
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Completed deck!
      sounds.playFanfare();
      confetti({ particleCount: 150, spread: 80 });
    }
  };

  const isCompleted = currentIndex >= questions.length - 1 && masteredCount > 0;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between p-5 rounded-3xl bg-slate-900 border border-slate-800">
        <div className="flex items-center space-x-3">
          <Link to="/student" className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">Flashcard Deck</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/10 text-purple-300">
                ACTIVE RECALL
              </span>
            </div>
            <h1 className="text-xl font-extrabold text-white">{quiz?.title || 'Interactive Deck'}</h1>
          </div>
        </div>

        <div className="text-xs font-mono font-bold text-slate-400">
          Card {Math.min(currentIndex + 1, questions.length)} of {questions.length}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-300"
          style={{ width: `${questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0}%` }}
        ></div>
      </div>

      {currentQ && (
        <div className="perspective-1000 py-6">
          {/* Flip Card Container */}
          <div
            onClick={handleFlip}
            className={`cursor-pointer min-h-[340px] rounded-3xl p-8 border text-center flex flex-col justify-between transition-all duration-300 select-none shadow-2xl relative ${
              flipped
                ? 'bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 border-purple-500/50'
                : 'bg-slate-900/90 border-slate-800 hover:border-purple-500/40'
            }`}
          >
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-mono font-bold uppercase text-purple-400">
                {flipped ? 'Answer & Explanation (Back)' : 'Question Prompt (Front)'}
              </span>
              <span className="flex items-center space-x-1 text-slate-500">
                <RotateCw className="w-3.5 h-3.5" />
                <span>Tap to flip</span>
              </span>
            </div>

            <div className="my-auto space-y-4">
              {!flipped ? (
                <>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-relaxed">
                    {currentQ.questionText}
                  </h2>
                  {currentQ.codeSnippet && (
                    <div className="max-w-md mx-auto p-3 rounded-2xl bg-slate-950 font-mono text-xs text-emerald-400 text-left border border-slate-800">
                      <pre>{currentQ.codeSnippet}</pre>
                    </div>
                  )}
                </>
              ) : (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 font-extrabold text-xl">
                    {String(currentQ.correctAnswer || 'Answer')}
                  </div>
                  {currentQ.explanation && (
                    <p className="text-sm text-slate-300 max-w-lg mx-auto">
                      💡 {currentQ.explanation}
                    </p>
                  )}
                </div>
              )}
            </div>

            <p className="text-[11px] text-slate-500">
              {flipped ? 'Mark whether you remembered this correctly below' : 'Click anywhere on this card to reveal answer'}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-center space-x-4 mt-6">
            <button
              onClick={() => handleNext(false)}
              className="px-5 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-rose-400 font-bold text-xs flex items-center space-x-2 transition-all active:scale-95 shadow-md"
            >
              <XCircle className="w-4 h-4" />
              <span>Need Review</span>
            </button>
            <button
              onClick={() => handleNext(true)}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-110 text-white font-bold text-xs flex items-center space-x-2 transition-all active:scale-95 shadow-lg shadow-emerald-600/25"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>I Know This!</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
