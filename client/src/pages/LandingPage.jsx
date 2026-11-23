import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { sounds } from '../utils/soundEffects';
import {
  Zap,
  Play,
  Sparkles,
  Trophy,
  BarChart2,
  Users,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  HelpCircle,
  Clock,
  Layers
} from 'lucide-react';

export default function LandingPage() {
  const { isAuthenticated, isTeacher } = useAuth();
  const { t } = useLanguage();
  const [roomCode, setRoomCode] = useState('');
  const navigate = useNavigate();

  const handleQuickJoin = (e) => {
    e.preventDefault();
    if (!roomCode.trim()) return;
    sounds.playClick();
    navigate(`/join?code=${encodeURIComponent(roomCode.trim().toUpperCase())}`);
  };

  const heroTitle = t('hero_title') || 'Transform Learning into Epic Live Arenas';
  const titleParts = heroTitle.split(' ');
  const firstPart = titleParts.slice(0, 3).join(' ');
  const secondPart = titleParts.slice(3).join(' ') || 'Live Quiz Arena';

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 overflow-hidden">
      {/* Background Decorative Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-40 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[128px]"></div>
        <div className="absolute -top-20 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[128px]"></div>
      </div>

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/25 text-purple-300 text-xs font-semibold mb-6 animate-pulse-slow">
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span>Next-Generation Live Classroom & Multiplayer Arena</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight max-w-5xl mx-auto leading-tight md:leading-none">
          {firstPart}{' '}
          <span className="bg-gradient-to-r from-purple-400 via-indigo-300 to-cyan-400 bg-clip-text text-transparent">
            {secondPart}
          </span>
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-slate-400 max-w-3xl mx-auto">
          {t('hero_subtitle')}
        </p>

        {/* Quick Join Game PIN Card */}
        <div className="mt-10 max-w-md mx-auto p-4 sm:p-6 rounded-2xl bg-slate-900/90 border border-purple-500/30 shadow-2xl shadow-purple-500/10 backdrop-blur-xl">
          <form onSubmit={handleQuickJoin} className="space-y-3">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider text-left">
              Have a Game Room PIN?
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                maxLength={6}
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                placeholder="e.g. QA8821"
                className="flex-1 px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 font-mono font-bold text-lg text-center tracking-widest text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 transition-all uppercase"
              />
              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold flex items-center space-x-2 shadow-lg shadow-emerald-500/20 hover:brightness-110 active:scale-95 transition-all"
              >
                <Play className="w-5 h-5 fill-white" />
                <span>{t('join_button')}</span>
              </button>
            </div>
            <p className="text-xs text-slate-500 text-left">
              Instant join • No registration mandatory for players • Live synchronized leaderboard
            </p>
          </form>
        </div>

        {/* Call to Actions for Teachers / Organizers */}
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          {isAuthenticated ? (
            <Link
              to={isTeacher ? '/teacher' : '/student'}
              className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold shadow-lg shadow-purple-600/30 hover:brightness-110 active:scale-95 transition-all flex items-center space-x-2"
            >
              <span>Go to Your Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <>
              <Link
                to="/register"
                className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold shadow-lg shadow-purple-600/30 hover:brightness-110 active:scale-95 transition-all flex items-center space-x-2"
              >
                <span>{t('get_started_free')}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/login"
                className="px-6 py-3.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 font-bold hover:bg-slate-800 hover:text-white transition-all"
              >
                Teacher Sign In
              </Link>
            </>
          )}
          <Link
            to="/tournaments"
            className="px-6 py-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 font-bold hover:bg-amber-500/20 transition-all flex items-center space-x-2"
          >
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>{t('explore_tournaments')}</span>
          </Link>
        </div>
      </section>

      {/* Feature Pillars */}
      <section className="py-16 bg-slate-900/50 border-y border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <h2 className="text-xs font-bold text-purple-400 uppercase tracking-widest">Platform Capabilities</h2>
            <p className="mt-2 text-3xl sm:text-4xl font-extrabold text-white">
              Engineered for Modern Classrooms & High-Stakes Arenas
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-8 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-purple-500/40 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-6 group-hover:scale-110 transition-transform">
                <Zap className="w-6 h-6 fill-purple-400/20" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Real-Time Multiplayer Rooms</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Socket.IO powered ultra-low latency multiplayer. Authoritative server timers, live synchronized answer distribution, and animated leaderboards.
              </p>
              <ul className="mt-4 space-y-2 text-xs text-slate-300">
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Unique 6-character room codes</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Zero-delay synchronized countdown</span>
                </li>
              </ul>
            </div>

            {/* Feature 2 */}
            <div className="p-8 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/40 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-6 group-hover:scale-110 transition-transform">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">AI Quiz Generation Engine</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Generate 100% curriculum-ready quizzes in seconds. Paste textbook chapters or enter topics to auto-synthesize questions, options, and explanations.
              </p>
              <ul className="mt-4 space-y-2 text-xs text-slate-300">
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                  <span>Topic, difficulty & question type targeting</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                  <span>Smart curriculum fallback built-in</span>
                </li>
              </ul>
            </div>

            {/* Feature 3 */}
            <div className="p-8 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-blue-500/40 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-6 group-hover:scale-110 transition-transform">
                <BarChart2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Deep Analytics & Anti-Cheat</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Visual performance charts with Recharts, CSV & PDF export, tab-switch monitoring, speed bonuses, and student XP progression.
              </p>
              <ul className="mt-4 space-y-2 text-xs text-slate-300">
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-400" />
                  <span>Question-wise difficulty & accuracy analytics</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-400" />
                  <span>Instant downloadable PDF & CSV reports</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 10 Question Types Visual Showcase */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Question Diversity</h2>
          <p className="mt-2 text-3xl font-extrabold text-white">Support for 10 Advanced Question Formats</p>
          <p className="mt-2 text-sm text-slate-400">Beyond standard multiple choice—built for coding, science, and interactive learning.</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {[
            { label: 'Multiple Choice', desc: 'Single select with 4 choices', color: 'from-purple-500/20 to-purple-600/10 border-purple-500/30' },
            { label: 'True / False', desc: 'Binary rapid validation', color: 'from-blue-500/20 to-blue-600/10 border-blue-500/30' },
            { label: 'Multiple Select', desc: 'Multi-option check system', color: 'from-indigo-500/20 to-indigo-600/10 border-indigo-500/30' },
            { label: 'Fill in Blanks', desc: 'Exact string matching', color: 'from-teal-500/20 to-teal-600/10 border-teal-500/30' },
            { label: 'Short Answer', desc: 'Keyword & text answer', color: 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/30' },
            { label: 'Code-Based', desc: 'Syntax highlighted snippets', color: 'from-cyan-500/20 to-cyan-600/10 border-cyan-500/30' },
            { label: 'Image-Based', desc: 'Diagrams & visual prompts', color: 'from-amber-500/20 to-amber-600/10 border-amber-500/30' },
            { label: 'Poll / Survey', desc: 'Sentiment & opinions', color: 'from-rose-500/20 to-rose-600/10 border-rose-500/30' },
            { label: 'Matching Pairs', desc: 'Relational column mapping', color: 'from-violet-500/20 to-violet-600/10 border-violet-500/30' },
            { label: 'Numerical Answer', desc: 'Formula calculation + tolerance', color: 'from-orange-500/20 to-orange-600/10 border-orange-500/30' }
          ].map((type, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-xl bg-gradient-to-b ${type.color} border text-left hover:scale-[1.02] transition-transform`}
            >
              <span className="text-xs font-mono font-bold text-slate-400">0{idx + 1}</span>
              <h4 className="text-sm font-bold text-white mt-1">{type.label}</h4>
              <p className="text-xs text-slate-400 mt-1">{type.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Role Comparison Banner */}
      <section className="py-16 bg-slate-900/60 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Host Role */}
            <div className="p-6 rounded-2xl bg-slate-950 border border-purple-500/30 space-y-3">
              <span className="px-2.5 py-1 text-xs font-bold rounded-md bg-purple-500/20 text-purple-300">Teacher / Host</span>
              <h3 className="text-xl font-bold text-white">Create, Host & Analyze</h3>
              <p className="text-sm text-slate-400">
                Launch multiplayer rooms with 1 click, control live quiz flow, generate questions with AI, and download detailed grade reports.
              </p>
              <Link to="/register" className="inline-flex items-center text-sm font-semibold text-purple-400 hover:text-purple-300">
                <span>Register as Teacher</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>

            {/* Student Role */}
            <div className="p-6 rounded-2xl bg-slate-950 border border-emerald-500/30 space-y-3">
              <span className="px-2.5 py-1 text-xs font-bold rounded-md bg-emerald-500/20 text-emerald-300">Student / Player</span>
              <h3 className="text-xl font-bold text-white">Compete & Level Up</h3>
              <p className="text-sm text-slate-400">
                Join with room PIN, submit timed answers, earn XP, unlock achievements, climb tournament leaderboards, and review past performance.
              </p>
              <Link to="/join" className="inline-flex items-center text-sm font-semibold text-emerald-400 hover:text-emerald-300">
                <span>Join Game Room</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>

            {/* Admin Role */}
            <div className="p-6 rounded-2xl bg-slate-950 border border-blue-500/30 space-y-3">
              <span className="px-2.5 py-1 text-xs font-bold rounded-md bg-blue-500/20 text-blue-300">Admin Supervisor</span>
              <h3 className="text-xl font-bold text-white">Platform Governance</h3>
              <p className="text-sm text-slate-400">
                Oversee registered teachers & students, inspect platform telemetry, monitor active live sessions, and maintain platform security.
              </p>
              <Link to="/login" className="inline-flex items-center text-sm font-semibold text-blue-400 hover:text-blue-300">
                <span>Admin Login</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
