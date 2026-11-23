import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { sounds } from '../utils/soundEffects';
import {
  Zap,
  Moon,
  Sun,
  Globe,
  LogIn,
  LogOut,
  User,
  PlusCircle,
  Play,
  Trophy,
  Award,
  BookOpen,
  BarChart2,
  Sparkles,
  Shield,
  Volume2,
  VolumeX,
  Menu,
  X
} from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, logout, isTeacher, isAdmin } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { language, toggleLanguage, t } = useLanguage();
  const [soundOn, setSoundOn] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleToggleSound = () => {
    sounds.enabled = !soundOn;
    setSoundOn(!soundOn);
    if (!soundOn) sounds.playClick();
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md transition-colors dark:bg-slate-950/80 dark:border-slate-800/80 light:bg-white/80 light:border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link
          to="/"
          className="flex items-center space-x-3 group"
          onClick={() => sounds.playClick()}
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-500 to-blue-500 flex items-center justify-center shadow-lg shadow-purple-500/25 group-hover:scale-105 transition-transform duration-200">
            <Zap className="w-5 h-5 text-white fill-white" />
          </div>
          <div>
            <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-purple-400 via-indigo-300 to-blue-400 bg-clip-text text-transparent">
              QuizArena
            </span>
            <span className="hidden sm:inline-block ml-2 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
              AI LIVE
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
          <Link
            to="/join"
            className="flex items-center space-x-1.5 px-3 py-1.5 text-sm font-semibold rounded-lg text-emerald-400 hover:bg-emerald-500/10 transition-colors"
            onClick={() => sounds.playClick()}
          >
            <Play className="w-4 h-4 fill-emerald-400/20" />
            <span>{t('join_quiz')}</span>
          </Link>

          {isAuthenticated && isTeacher && (
            <>
              <Link
                to="/teacher"
                className="px-3 py-1.5 text-sm font-medium rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors"
              >
                {t('dashboard')}
              </Link>
              <Link
                to="/quiz/create"
                className="flex items-center space-x-1 px-3 py-1.5 text-sm font-medium rounded-lg text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 transition-colors"
              >
                <PlusCircle className="w-4 h-4" />
                <span>{t('create_quiz')}</span>
              </Link>
              <Link
                to="/ai-generator"
                className="flex items-center space-x-1 px-3 py-1.5 text-sm font-medium rounded-lg text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 transition-colors"
              >
                <Sparkles className="w-4 h-4" />
                <span>AI Generator</span>
              </Link>
              <Link
                to="/question-bank"
                className="px-3 py-1.5 text-sm font-medium rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors"
              >
                {t('question_bank')}
              </Link>
            </>
          )}

          {isAuthenticated && !isTeacher && (
            <Link
              to="/student"
              className="px-3 py-1.5 text-sm font-medium rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors"
            >
              {t('dashboard')}
            </Link>
          )}

          <Link
            to="/tournaments"
            className="flex items-center space-x-1 px-3 py-1.5 text-sm font-medium rounded-lg text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 transition-colors"
          >
            <Trophy className="w-4 h-4" />
            <span>{t('tournaments')}</span>
          </Link>

          <Link
            to="/leaderboard"
            className="flex items-center space-x-1 px-3 py-1.5 text-sm font-medium rounded-lg text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 transition-colors"
          >
            <Award className="w-4 h-4" />
            <span>Leaderboard</span>
          </Link>

          {isAdmin && (
            <Link
              to="/admin"
              className="flex items-center space-x-1 px-3 py-1.5 text-sm font-medium rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors"
            >
              <Shield className="w-4 h-4" />
              <span>Admin</span>
            </Link>
          )}
        </nav>

        {/* Right Action Icons & Auth */}
        <div className="flex items-center space-x-2">
          {/* Sound FX Toggle */}
          <button
            onClick={handleToggleSound}
            title={soundOn ? 'Sound On' : 'Sound Muted'}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            {soundOn ? <Volume2 className="w-4 h-4 text-purple-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>

          {/* Language Switcher */}
          <button
            onClick={() => {
              sounds.playClick();
              toggleLanguage();
            }}
            title="Toggle English / Hindi"
            className="flex items-center space-x-1 px-2 py-1 text-xs font-semibold rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700/60 transition-colors"
          >
            <Globe className="w-3.5 h-3.5 text-indigo-400" />
            <span>{language.toUpperCase()}</span>
          </button>

          {/* Theme Switcher */}
          <button
            onClick={() => {
              sounds.playClick();
              toggleTheme();
            }}
            title="Toggle Dark / Light Theme"
            className="p-2 rounded-lg text-slate-400 hover:text-amber-300 hover:bg-slate-800 transition-colors"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* User Account / Login */}
          {isAuthenticated ? (
            <div className="flex items-center space-x-2 pl-2 border-l border-slate-800">
              <Link
                to="/profile"
                className="flex items-center space-x-2 px-2 py-1 rounded-lg hover:bg-slate-800/70 transition-colors"
                title="View Profile"
              >
                <img
                  src={user?.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=Me'}
                  alt={user?.name}
                  className="w-7 h-7 rounded-full bg-slate-800 border border-purple-500/40"
                />
                <span className="hidden sm:inline-block text-sm font-semibold text-slate-200 truncate max-w-[100px]">
                  {user?.name}
                </span>
              </Link>
              <button
                onClick={() => {
                  sounds.playClick();
                  logout();
                  navigate('/');
                }}
                title={t('logout')}
                className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2 pl-2">
              <Link
                to="/login"
                className="px-3 py-1.5 text-sm font-semibold rounded-lg text-slate-200 hover:text-white hover:bg-slate-800 transition-colors"
              >
                {t('login')}
              </Link>
              <Link
                to="/register"
                className="px-3.5 py-1.5 text-sm font-semibold rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/30 hover:brightness-110 active:scale-95 transition-all"
              >
                {t('register')}
              </Link>
            </div>
          )}

          {/* Mobile hamburger button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden px-4 pt-2 pb-4 border-b border-slate-800 bg-slate-900/95 space-y-2">
          <Link
            to="/join"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md font-semibold text-emerald-400 bg-emerald-500/10"
          >
            {t('join_quiz')}
          </Link>
          {isAuthenticated && isTeacher && (
            <>
              <Link
                to="/teacher"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-slate-200 hover:bg-slate-800"
              >
                {t('dashboard')}
              </Link>
              <Link
                to="/quiz/create"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-purple-400 hover:bg-slate-800"
              >
                {t('create_quiz')}
              </Link>
              <Link
                to="/ai-generator"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-indigo-400 hover:bg-slate-800"
              >
                AI Generator
              </Link>
              <Link
                to="/question-bank"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-slate-200 hover:bg-slate-800"
              >
                {t('question_bank')}
              </Link>
            </>
          )}
          {isAuthenticated && !isTeacher && (
            <Link
              to="/student"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-slate-200 hover:bg-slate-800"
            >
              {t('dashboard')}
            </Link>
          )}
          <Link
            to="/tournaments"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-amber-400 hover:bg-slate-800"
          >
            {t('tournaments')}
          </Link>
          <Link
            to="/leaderboard"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-purple-400 hover:bg-slate-800"
          >
            Leaderboard
          </Link>
        </div>
      )}
    </header>
  );
}
