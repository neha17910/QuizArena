import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { sounds } from '../utils/soundEffects';
import toast from 'react-hot-toast';
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  ArrowLeft,
  Trophy,
  Award,
  Zap,
  Sparkles,
  Bot,
  X,
  MessageSquareQuote
} from 'lucide-react';

export default function QuizReviewPage() {
  const { id } = useParams();
  const [result, setResult] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);

  // AI Tutor Modal
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [activeQuestion, setActiveQuestion] = useState(null);
  const [aiExplanation, setAiExplanation] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    const fetchReview = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`/api/results/${id}`);
        if (res.data.success) {
          setResult(res.data.result);
          setAnswers(res.data.answers || []);
        }
      } catch (err) {
        console.warn('Error loading review:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReview();
  }, [id]);

  const handleAskAiTutor = async (ans) => {
    sounds.playClick();
    setActiveQuestion(ans);
    setAiModalOpen(true);
    setAiLoading(true);
    setAiExplanation('');

    try {
      const res = await axios.post('/api/ai/explain-answer', {
        questionText: ans.questionId?.questionText || 'Question',
        submittedAnswer: ans.submittedAnswer,
        correctAnswer: ans.questionId?.correctAnswer,
        explanation: ans.questionId?.explanation
      });

      if (res.data.success) {
        setAiExplanation(res.data.explanation);
        sounds.playCorrect();
      }
    } catch (err) {
      toast.error('Could not connect to AI Tutor.');
    } finally {
      setAiLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-400">
        <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p>Loading Quiz Review...</p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="py-20 text-center text-slate-400">
        <p>Review not found.</p>
        <Link to="/student" className="text-purple-400 font-bold mt-2 inline-block">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between p-6 rounded-3xl bg-slate-900 border border-slate-800">
        <div className="flex items-center space-x-3">
          <Link to="/student" className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">Answer Review</span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white">
              {result.quizId?.title || 'Quiz Arena'}
            </h1>
          </div>
        </div>

        <div className="flex items-center space-x-4 text-xs font-bold font-mono">
          <span className="text-purple-400">{result.score} pts</span>
          <span className="text-emerald-400">{result.accuracy}% Accuracy</span>
          <span className="text-amber-400">Rank #{result.rank}</span>
        </div>
      </div>

      {/* Answer Cards */}
      <div className="space-y-4">
        {answers.map((ans, idx) => (
          <div
            key={ans._id || idx}
            className={`p-6 rounded-3xl border space-y-3 transition-all ${
              ans.isCorrect
                ? 'bg-slate-900/90 border-emerald-500/30'
                : 'bg-slate-900/90 border-rose-500/30 shadow-lg shadow-rose-950/10'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-slate-400">Question #{idx + 1}</span>
              <span
                className={`flex items-center text-xs font-bold px-2.5 py-0.5 rounded-full ${
                  ans.isCorrect
                    ? 'bg-emerald-500/10 text-emerald-400'
                    : 'bg-rose-500/10 text-rose-400'
                }`}
              >
                {ans.isCorrect ? <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> : <XCircle className="w-3.5 h-3.5 mr-1" />}
                {ans.isCorrect ? `Correct (+${ans.awardedPoints} pts)` : 'Incorrect (0 pts)'}
              </span>
            </div>

            <h3 className="text-base font-bold text-white">{ans.questionId?.questionText || 'Question'}</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block mb-0.5 font-semibold">Your Submitted Answer:</span>
                <span className={`font-bold ${ans.isCorrect ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {String(ans.submittedAnswer || 'No answer submitted')}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block mb-0.5 font-semibold">Correct Answer:</span>
                <span className="font-bold text-emerald-400">
                  {String(ans.questionId?.correctAnswer || 'Marked Option')}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-800/60">
              {ans.questionId?.explanation ? (
                <p className="text-xs text-slate-400 italic">
                  💡 {ans.questionId.explanation}
                </p>
              ) : <div />}

              {/* Ask AI Tutor Button */}
              <button
                onClick={() => handleAskAiTutor(ans)}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-purple-600/20 to-indigo-600/20 hover:from-purple-600/30 hover:to-indigo-600/30 border border-purple-500/30 text-purple-300 font-bold text-xs flex items-center space-x-1.5 transition-all self-end sm:self-auto cursor-pointer"
              >
                <Bot className="w-4 h-4 text-purple-400" />
                <span>Ask AI Tutor</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* AI Socratic Tutor Modal */}
      {aiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="max-w-xl w-full bg-slate-900 border border-purple-500/50 rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2 text-purple-400">
                <Bot className="w-5 h-5" />
                <h3 className="font-extrabold text-white text-base">QuizArena AI Socratic Tutor</h3>
              </div>
              <button
                onClick={() => setAiModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-1">
              <p className="font-bold text-slate-300">{activeQuestion?.questionId?.questionText}</p>
              <p className="text-slate-400">
                You selected: <span className="text-rose-400 font-semibold">{String(activeQuestion?.submittedAnswer)}</span> • Correct: <span className="text-emerald-400 font-semibold">{String(activeQuestion?.questionId?.correctAnswer)}</span>
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-500/20 text-xs sm:text-sm text-slate-200 leading-relaxed min-h-24">
              {aiLoading ? (
                <div className="flex items-center space-x-2 text-purple-400 py-6 justify-center">
                  <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
                  <span>AI Tutor is crafting your personalized concept explanation...</span>
                </div>
              ) : (
                <p className="whitespace-pre-line">{aiExplanation}</p>
              )}
            </div>

            <div className="flex justify-end pt-1">
              <button
                onClick={() => setAiModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs"
              >
                Understood, Thanks Tutor!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
