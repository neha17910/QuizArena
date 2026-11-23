import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { sounds } from '../utils/soundEffects';
import confetti from 'canvas-confetti';
import {
  Play,
  Trophy,
  Award,
  Zap,
  Flame,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  BookOpen,
  Eye,
  Layers,
  Sparkles,
  CalendarCheck
} from 'lucide-react';

export default function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [pin, setPin] = useState('');
  const [results, setResults] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dailyClaimed, setDailyClaimed] = useState(false);

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        setLoading(true);
        const [resResults, resAnalytics] = await Promise.all([
          axios.get('/api/results/student'),
          axios.get('/api/analytics/student')
        ]);

        if (resResults.data.success) {
          setResults(resResults.data.results);
        }
        if (resAnalytics.data.success) {
          setAnalytics(resAnalytics.data);
        }
      } catch (err) {
        console.warn('Could not load student history:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStudentData();
  }, []);

  const handleJoinPin = (e) => {
    e.preventDefault();
    if (!pin.trim()) return;
    sounds.playClick();
    navigate(`/join?code=${encodeURIComponent(pin.trim().toUpperCase())}`);
  };

  const handleClaimDailyChallenge = async () => {
    try {
      sounds.playPowerup();
      const res = await axios.post('/api/auth/daily-challenge');
      if (res.data.success) {
        toast.success(res.data.message);
        setDailyClaimed(true);
        sounds.playFanfare();
        confetti({ particleCount: 120, spread: 70 });
      }
    } catch (e) {
      toast.error('Could not claim daily challenge.');
    }
  };

  const currentLevel = user?.level || analytics?.stats?.level || 1;
  const currentXP = user?.xp || analytics?.stats?.xp || 0;
  // Calculate progress toward next level: level threshold = Math.floor(Math.sqrt(xp / 100)) + 1
  const nextLevelXP = Math.pow(currentLevel, 2) * 100;
  const prevLevelXP = Math.pow(currentLevel - 1, 2) * 100;
  const levelProgress = Math.min(
    100,
    Math.max(5, Math.round(((currentXP - prevLevelXP) / Math.max(1, nextLevelXP - prevLevelXP)) * 100))
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Student Profile Header & Level Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-blue-900/50 via-indigo-900/40 to-slate-900 border border-blue-500/30 backdrop-blur-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            <img
              src={user?.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=Alex'}
              alt={user?.name}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-800 border-2 border-blue-400/50 p-1 shadow-lg shadow-blue-500/20"
            />
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{user?.name}</h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  Level {currentLevel}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                Student Player • Ready for live quiz battles & tournaments
              </p>
              <div className="flex items-center space-x-4 text-xs text-slate-400 mt-2">
                <span className="flex items-center text-amber-400 font-semibold">
                  <Zap className="w-4 h-4 mr-1 fill-amber-400" />
                  {currentXP} XP
                </span>
                <span className="flex items-center text-rose-400 font-semibold">
                  <Flame className="w-4 h-4 mr-1 fill-rose-400" />
                  {user?.stats?.currentStreak || 0} Streak
                </span>
              </div>
            </div>
          </div>

          {/* Quick Join Pin Form */}
          <div className="w-full md:w-80 p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Join Live Room</span>
            <form onSubmit={handleJoinPin} className="flex space-x-2">
              <input
                type="text"
                maxLength={6}
                value={pin}
                onChange={(e) => setPin(e.target.value.toUpperCase())}
                placeholder="PIN (e.g. QA8821)"
                className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 font-mono font-bold text-center text-white placeholder-slate-500 text-sm uppercase focus:outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-xs flex items-center space-x-1 shadow-md hover:brightness-110 active:scale-95 transition-all"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Join</span>
              </button>
            </form>
          </div>
        </div>

        {/* Level Progress Bar */}
        <div className="mt-6 pt-4 border-t border-slate-800 space-y-1.5">
          <div className="flex justify-between text-xs font-semibold text-slate-400">
            <span>Level {currentLevel} Scholar</span>
            <span>{levelProgress}% to Level {currentLevel + 1}</span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 transition-all duration-500"
              style={{ width: `${levelProgress}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Daily Challenge & Shortcuts Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Daily Challenge Card */}
        <div className="md:col-span-2 p-5 rounded-3xl bg-gradient-to-r from-purple-900/40 via-slate-900 to-indigo-900/40 border border-purple-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <CalendarCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-extrabold text-white text-base">Daily Practice Quest</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300">
                  +50 XP BONUS
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Complete your daily practice drill to preserve your active battle streak!
              </p>
            </div>
          </div>

          <button
            onClick={handleClaimDailyChallenge}
            disabled={dailyClaimed}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center space-x-1.5 transition-all self-start sm:self-auto ${
              dailyClaimed
                ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30 cursor-default'
                : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/30 hover:brightness-110 active:scale-95'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>{dailyClaimed ? '✓ Claimed Today' : 'Claim Daily +50 XP'}</span>
          </button>
        </div>

        {/* Hall of Fame Shortcut */}
        <Link
          to="/leaderboard"
          className="p-5 rounded-3xl bg-gradient-to-br from-amber-950/30 to-slate-900/90 border border-amber-500/30 hover:border-amber-500/60 transition-all flex items-center justify-between group"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Hall of Fame</h4>
              <p className="text-[11px] text-slate-400">Global Campus Standings</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-amber-400 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <span className="text-xs font-semibold text-slate-400 uppercase">Quizzes Completed</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-white">
            {user?.stats?.totalQuizzes || results.length}
          </p>
          <p className="text-xs text-slate-500">Total battle attempts</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <span className="text-xs font-semibold text-slate-400 uppercase">Average Accuracy</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-emerald-400">
            {user?.stats?.accuracy || analytics?.stats?.averageAccuracy || 0}%
          </p>
          <p className="text-xs text-slate-500">Correct answer ratio</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <span className="text-xs font-semibold text-slate-400 uppercase">Highest Streak</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-amber-400 flex items-center">
            <Flame className="w-6 h-6 mr-1 fill-amber-400" />
            {user?.stats?.maxStreak || 0}
          </p>
          <p className="text-xs text-slate-500">Consecutive correct answers</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <span className="text-xs font-semibold text-slate-400 uppercase">Badges Earned</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-purple-400">
            {user?.badges?.length || 0}
          </p>
          <p className="text-xs text-slate-500">Achievements unlocked</p>
        </div>
      </div>

      {/* Badges Showcase */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <h3 className="text-lg font-bold text-white">Your Achievements & Badges</h3>
          </div>
          <span className="text-xs text-slate-400 font-semibold">
            {user?.badges?.length || 0} / 8 Unlocked
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {[
            { id: 'first_quiz', name: 'First Quiz', icon: '🎯', desc: 'Finished your first arena battle' },
            { id: 'perfect_score', name: 'Perfect Score', icon: '⭐', desc: 'Answered 100% questions right' },
            { id: 'speed_master', name: 'Speed Master', icon: '⚡', desc: 'Answered in under 3s correctly' },
            { id: 'five_quiz_streak', name: '5-Quiz Streak', icon: '🔥', desc: 'Achieved 5 correct answers in a row' },
            { id: 'top_performer', name: 'Top Performer', icon: '🥇', desc: 'Finished in top 3 on the podium' },
            { id: 'quiz_champion', name: 'Quiz Champion', icon: '👑', desc: 'Won 1st place in a live room' }
          ].map((badge) => {
            const isUnlocked = user?.badges?.some(
              (b) => b.name?.toLowerCase().includes(badge.name.toLowerCase()) || b.badgeType === badge.id
            );
            return (
              <div
                key={badge.id}
                className={`p-3 rounded-2xl border text-center transition-all ${
                  isUnlocked
                    ? 'bg-purple-950/40 border-purple-500/40 text-white shadow-lg shadow-purple-500/10'
                    : 'bg-slate-950/60 border-slate-800 text-slate-600 opacity-60'
                }`}
              >
                <div className="text-2xl mb-1">{badge.icon}</div>
                <p className="text-xs font-bold truncate">{badge.name}</p>
                <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{badge.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quiz History Table */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center space-x-2">
          <BookOpen className="w-5 h-5 text-indigo-400" />
          <span>Recent Quiz Battles</span>
        </h3>

        {loading ? (
          <div className="py-8 text-center text-slate-400">Loading your history...</div>
        ) : results.length === 0 ? (
          <div className="py-12 text-center text-slate-400 space-y-2">
            <Trophy className="w-10 h-10 text-slate-600 mx-auto" />
            <p className="font-semibold text-white">No quiz history yet.</p>
            <p className="text-xs">Enter a Room PIN above to participate in your first live battle!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="text-xs uppercase bg-slate-950 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4">Quiz Title</th>
                  <th className="px-6 py-4">Score</th>
                  <th className="px-6 py-4">Accuracy</th>
                  <th className="px-6 py-4">Rank</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4 text-right">Review</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {results.map((r) => (
                  <tr key={r._id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4 font-semibold text-white">{r.quizId?.title || 'Live Quiz Arena'}</td>
                    <td className="px-6 py-4 font-bold text-purple-400">{r.score} pts</td>
                    <td className="px-6 py-4 font-semibold text-emerald-400">{r.accuracy}%</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        #{r.rank}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">
                      {new Date(r.completedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      {r.quizId?._id && (
                        <Link
                          to={`/quiz/flashcards/${r.quizId._id}`}
                          className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-300 hover:bg-purple-500/20 text-xs font-bold transition-colors"
                        >
                          <Layers className="w-3.5 h-3.5" />
                          <span>Flashcards</span>
                        </Link>
                      )}
                      <Link
                        to={`/quiz/review/${r._id}`}
                        className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/20 text-xs font-bold transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Review</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
