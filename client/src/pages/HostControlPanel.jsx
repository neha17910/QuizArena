import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import { sounds } from '../utils/soundEffects';
import QRCodeDisplay from '../components/QRCodeDisplay';
import confetti from 'canvas-confetti';
import toast from 'react-hot-toast';
import {
  Play,
  SkipForward,
  Users,
  Copy,
  Check,
  Trophy,
  AlertTriangle,
  Clock,
  Layers,
  BarChart2,
  CheckCircle2,
  ShieldAlert
} from 'lucide-react';

export default function HostControlPanel() {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const { socket } = useSocket();

  const [sessionStatus, setSessionStatus] = useState('waiting'); // 'waiting' | 'active' | 'question_ended' | 'completed'
  const [participants, setParticipants] = useState([]);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(30);
  const [totalTime, setTotalTime] = useState(30);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [revealData, setRevealData] = useState(null);
  const [finalData, setFinalData] = useState(null);
  const [tabWarnings, setTabWarnings] = useState([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!socket) return;

    // Player joins
    socket.on('player:joined', ({ participants: list }) => {
      setParticipants(list || []);
    });

    // Player leaves
    socket.on('player:left', ({ playerId }) => {
      setParticipants((prev) => prev.filter((p) => p.playerId !== playerId));
    });

    // Quiz started
    socket.on('quiz:started', ({ totalQuestions: tq }) => {
      setTotalQuestions(tq);
      setSessionStatus('active');
    });

    // Question start
    socket.on('question:start', (payload) => {
      setCurrentQuestion(payload);
      setSessionStatus('active');
      setTimeRemaining(payload.timeRemaining || payload.timeLimit || 30);
      setTotalTime(payload.timeLimit || 30);
      setAnsweredCount(0);
      setRevealData(null);
    });

    // Timer tick
    socket.on('timer:tick', ({ timeRemaining: tr, totalTime: tt }) => {
      setTimeRemaining(tr);
      if (tt) setTotalTime(tt);
    });

    // Live answer progress
    socket.on('answer:progress', ({ answeredCount: ac }) => {
      setAnsweredCount(ac);
    });

    // Question end
    socket.on('question:end', (data) => {
      setSessionStatus('question_ended');
      setRevealData(data);
    });

    // Quiz end
    socket.on('quiz:end', (data) => {
      setSessionStatus('completed');
      setFinalData(data);
      confetti({ particleCount: 200, spread: 100 });
    });

    // Fair play alert
    socket.on('fair_play:alert', (alert) => {
      sounds.playWrong();
      toast.error(`⚠️ ${alert.message}`, { duration: 4000 });
      setTabWarnings((prev) => [...prev, alert]);
    });

    return () => {
      socket.off('player:joined');
      socket.off('player:left');
      socket.off('quiz:started');
      socket.off('question:start');
      socket.off('timer:tick');
      socket.off('answer:progress');
      socket.off('question:end');
      socket.off('quiz:end');
      socket.off('fair_play:alert');
    };
  }, [socket]);

  const handleStartQuiz = () => {
    if (!socket) return;
    sounds.playClick();
    socket.emit('quiz:start', { roomCode });
  };

  const handleNextQuestion = () => {
    if (!socket) return;
    sounds.playClick();
    socket.emit('question:next', { roomCode });
  };

  const handleSkipQuestion = () => {
    if (!socket) return;
    sounds.playClick();
    socket.emit('question:skip', { roomCode });
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Host Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-slate-900 border border-purple-500/40 shadow-xl">
        <div className="flex items-center space-x-4">
          <div className="p-3 rounded-2xl bg-purple-600/20 text-purple-400 border border-purple-500/30">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-400">Host Console</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-500/20 text-emerald-400">
                LIVE
              </span>
            </div>
            <div className="flex items-center space-x-2 mt-0.5">
              <span className="text-xl font-mono font-extrabold text-white tracking-wider">
                Room PIN: {roomCode}
              </span>
              <button onClick={handleCopyCode} className="text-slate-400 hover:text-white">
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Action Buttons */}
        <div className="flex items-center space-x-3">
          {sessionStatus === 'waiting' && (
            <button
              onClick={handleStartQuiz}
              disabled={participants.length === 0}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:brightness-110 active:scale-95 text-white font-extrabold text-sm shadow-lg shadow-emerald-500/25 transition-all flex items-center space-x-2 disabled:opacity-40"
            >
              <Play className="w-5 h-5 fill-white" />
              <span>Start Live Quiz ({participants.length} Ready)</span>
            </button>
          )}

          {sessionStatus === 'active' && (
            <button
              onClick={handleSkipQuestion}
              className="px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center space-x-1.5 transition-colors"
            >
              <SkipForward className="w-4 h-4" />
              <span>Skip Question</span>
            </button>
          )}

          {sessionStatus === 'question_ended' && (
            <button
              onClick={handleNextQuestion}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:brightness-110 active:scale-95 text-white font-extrabold text-sm shadow-lg shadow-purple-600/30 transition-all flex items-center space-x-2"
            >
              <span>Next Question</span>
              <SkipForward className="w-4 h-4" />
            </button>
          )}

          {sessionStatus === 'completed' && (
            <button
              onClick={() => navigate('/teacher')}
              className="px-5 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs"
            >
              Return to Dashboard
            </button>
          )}
        </div>
      </div>

      {/* STATE 1: HOST LOBBY */}
      {sessionStatus === 'waiting' && (
        <div className="p-8 rounded-3xl bg-slate-900/90 border border-slate-800 text-center space-y-6">
          <div className="flex flex-col md:flex-row items-center justify-center gap-6">
            <div className="flex-1 space-y-3">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Students Joining Arena Lobby</h2>
              <p className="text-sm text-slate-400">
                Students can open QuizArena on laptops or phones and enter room PIN{' '}
                <span className="font-mono text-purple-400 font-extrabold text-lg">{roomCode}</span>.
              </p>
              <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/20 text-xs text-purple-300">
                Pro-Tip: Project this screen in the classroom so all students can scan the QR code directly!
              </div>
            </div>
            <QRCodeDisplay roomCode={roomCode} quizTitle="Live Arena Session" />
          </div>

          <div className="flex items-center justify-center space-x-2 text-slate-300 pt-2 border-t border-slate-800">
            <Users className="w-5 h-5 text-purple-400" />
            <span className="font-bold text-base">{participants.length} Students Connected</span>
          </div>

          <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 min-h-36">
            {participants.length === 0 ? (
              <div className="m-auto text-slate-500 text-sm animate-pulse">
                Waiting for students to join...
              </div>
            ) : (
              participants.map((p) => (
                <div
                  key={p.playerId}
                  className="flex items-center space-x-2 px-3 py-2 rounded-2xl bg-slate-900 border border-slate-800 text-white text-xs font-bold shadow-sm"
                >
                  <img src={p.avatar} alt={p.name} className="w-6 h-6 rounded-full bg-slate-800" />
                  <span>{p.name}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* STATE 2: ACTIVE QUESTION LIVE STATUS */}
      {sessionStatus === 'active' && currentQuestion && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Question Display */}
          <div className="md:col-span-2 p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-mono font-bold text-purple-400">
                Question {currentQuestion.questionIndex + 1} of {currentQuestion.totalQuestions}
              </span>
              <span className="capitalize">{currentQuestion.questionType}</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-extrabold text-white">
              {currentQuestion.questionText}
            </h2>

            {currentQuestion.codeSnippet && (
              <div className="p-3 rounded-2xl bg-slate-950 font-mono text-xs text-emerald-400 border border-slate-800">
                <pre>{currentQuestion.codeSnippet}</pre>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 pt-2">
              {(currentQuestion.options || []).map((opt, i) => (
                <div key={i} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm font-semibold">
                  {opt.text}
                </div>
              ))}
            </div>
          </div>

          {/* Real-time telemetry: Submissions & Timer */}
          <div className="space-y-4">
            <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 text-center space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Authoritative Timer
              </span>
              <p className={`font-mono text-5xl font-extrabold ${timeRemaining <= 5 ? 'text-rose-500 animate-pulse' : 'text-white'}`}>
                {timeRemaining}s
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 text-center space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Answer Submissions
              </span>
              <p className="font-mono text-4xl font-extrabold text-emerald-400">
                {answeredCount} / {participants.length}
              </p>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden mt-2">
                <div
                  className="h-full bg-emerald-500 transition-all duration-300"
                  style={{ width: `${participants.length > 0 ? (answeredCount / participants.length) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            {/* Anti-Cheat Fair Play Warning Box */}
            {tabWarnings.length > 0 && (
              <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/40 space-y-1">
                <div className="flex items-center space-x-1.5 text-rose-400 text-xs font-bold">
                  <ShieldAlert className="w-4 h-4" />
                  <span>Fair Play Alerts ({tabWarnings.length})</span>
                </div>
                <div className="max-h-24 overflow-y-auto text-[11px] text-slate-300 space-y-0.5">
                  {tabWarnings.slice(-3).map((w, i) => (
                    <p key={i}>• {w.message}</p>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* STATE 3: QUESTION ENDED LEADERBOARD */}
      {sessionStatus === 'question_ended' && revealData && (
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-extrabold text-white flex items-center space-x-2">
              <Trophy className="w-5 h-5 text-amber-400" />
              <span>Current Standings</span>
            </h3>
            <span className="text-xs font-bold text-purple-400">Click "Next Question" above to advance</span>
          </div>

          {/* Kahoot-style Answer Distribution Histogram */}
          {revealData.options && revealData.options.length > 0 && (
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Student Responses Distribution
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {revealData.options.map((opt, i) => {
                  const count = revealData.optionStats?.[opt.id] || revealData.optionStats?.[opt.text] || 0;
                  const isCorrect = opt.isCorrect || opt.id === revealData.correctAnswer;
                  const bgColors = [
                    'border-rose-500/50 bg-rose-950/30 text-rose-300',
                    'border-blue-500/50 bg-blue-950/30 text-blue-300',
                    'border-amber-500/50 bg-amber-950/30 text-amber-300',
                    'border-emerald-500/50 bg-emerald-950/30 text-emerald-300'
                  ];

                  return (
                    <div
                      key={opt.id || i}
                      className={`p-3 rounded-xl border flex flex-col justify-between ${bgColors[i % 4]} ${
                        isCorrect ? 'ring-2 ring-emerald-400' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-bold truncate max-w-[120px]">{opt.text}</span>
                        {isCorrect && <span className="text-xs">✓</span>}
                      </div>
                      <div className="flex items-end justify-between mt-2">
                        <span className="text-xs text-slate-400">Picks</span>
                        <span className="font-mono font-extrabold text-lg text-white">{count}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase">Answer Key & Explanation</span>
              <p className="text-emerald-400 font-bold text-sm">Correct Answer: {revealData.correctAnswer}</p>
              <p className="text-xs text-slate-300">💡 {revealData.explanation || 'No explanation provided.'}</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase">Top 5 Players</span>
              <div className="space-y-1.5">
                {(revealData.leaderboard || []).slice(0, 5).map((p, idx) => (
                  <div key={p.playerId} className="flex items-center justify-between text-xs">
                    <span className="text-slate-300">#{idx + 1} {p.name}</span>
                    <span className="font-mono font-bold text-white">{p.score} pts</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STATE 4: FINAL PODIUM */}
      {sessionStatus === 'completed' && finalData && (
        <div className="p-8 rounded-3xl bg-slate-900/90 border border-amber-500/30 text-center space-y-6">
          <h2 className="text-3xl font-extrabold text-white">🏆 Arena Concluded!</h2>
          <p className="text-sm text-slate-400">All results and XP have been persisted to MongoDB.</p>

          <div className="max-w-md mx-auto p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <span className="text-xs font-bold text-slate-400 uppercase">Champion</span>
            <p className="text-xl font-extrabold text-amber-400">
              {finalData.podium?.[0]?.name} ({finalData.podium?.[0]?.score} pts)
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
