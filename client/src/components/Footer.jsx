import React from 'react';
import { Zap, Heart, ShieldCheck, Terminal, Award } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full border-t border-slate-800/80 bg-slate-950/90 text-slate-400 py-10 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="md:col-span-2 space-y-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-blue-500 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white fill-white" />
            </div>
            <span className="text-lg font-bold text-white tracking-tight">QuizArena</span>
          </div>
          <p className="text-sm text-slate-400 max-w-sm">
            High-performance real-time multiplayer live quiz platform with AI quiz generation, interactive leaderboards, anti-cheating, and comprehensive analytics.
          </p>
          <div className="flex items-center space-x-2 text-xs text-slate-500 pt-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>MERN Stack + Socket.IO + Web Speech + Recharts</span>
          </div>
        </div>

        <div>
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">Roles & Portals</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="/login" className="hover:text-purple-400 transition-colors">Teacher Portal</a></li>
            <li><a href="/join" className="hover:text-purple-400 transition-colors">Student Join Room</a></li>
            <li><a href="/tournaments" className="hover:text-purple-400 transition-colors">Campus Tournaments</a></li>
            <li><a href="/admin" className="hover:text-purple-400 transition-colors">Admin Governance</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">Demo Quick Access</h4>
          <p className="text-xs text-slate-400 mb-2">Pre-seeded test accounts:</p>
          <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-lg text-xs font-mono space-y-1">
            <p><span className="text-purple-400">Teacher:</span> teacher@quizarena.com</p>
            <p><span className="text-blue-400">Student:</span> student@quizarena.com</p>
            <p><span className="text-slate-500">Pass:</span> Teacher@123456</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 pt-6 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
        <p>© {new Date().getFullYear()} QuizArena Platform. University Capstone Production Project.</p>
        <p className="flex items-center space-x-1 mt-2 sm:mt-0">
          <span>Engineered with precision for EdTech and Gamified Learning</span>
        </p>
      </div>
    </footer>
  );
}
