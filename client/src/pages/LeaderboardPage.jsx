import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { sounds } from '../utils/soundEffects';
import {
  Trophy,
  Award,
  Zap,
  Flame,
  Search,
  Users,
  Sparkles,
  CheckCircle2,
  Crown
} from 'lucide-react';

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        const res = await axios.get('/api/analytics/global-leaderboard');
        if (res.data.success) {
          setLeaderboard(res.data.leaderboard || []);
        }
      } catch (e) {
        console.warn('Failed to load global leaderboard:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  const filtered = leaderboard.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold">
          <Trophy className="w-3.5 h-3.5 text-amber-400" />
          <span>Campus Hall of Fame</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white">Global Arena Leaderboard</h1>
        <p className="text-sm text-slate-400 max-w-xl mx-auto">
          Honoring the top scholars and fastest minds across all live battles and tournaments
        </p>
      </div>

      {/* Top 3 Champions Showcase Podium */}
      {leaderboard.length >= 3 && (
        <div className="flex items-end justify-center gap-4 pt-6 pb-2">
          {/* 2nd Place */}
          <div className="flex flex-col items-center w-28 sm:w-36 space-y-2">
            <img
              src={leaderboard[1].avatar}
              alt={leaderboard[1].name}
              className="w-14 h-14 rounded-2xl bg-slate-800 border-2 border-slate-300 p-1"
            />
            <span className="text-xs font-bold text-white truncate max-w-full">
              {leaderboard[1].name}
            </span>
            <span className="text-xs font-mono text-slate-300 font-extrabold">
              {leaderboard[1].xp} XP
            </span>
            <div className="w-full h-24 rounded-t-2xl bg-gradient-to-b from-slate-400 to-slate-600 flex items-center justify-center font-black text-2xl text-slate-900 shadow-lg">
              2
            </div>
          </div>

          {/* 1st Place */}
          <div className="flex flex-col items-center w-32 sm:w-44 space-y-2 -translate-y-4">
            <Crown className="w-8 h-8 text-amber-400 animate-bounce" />
            <img
              src={leaderboard[0].avatar}
              alt={leaderboard[0].name}
              className="w-18 h-18 rounded-2xl bg-slate-800 border-4 border-amber-400 p-1 shadow-xl shadow-amber-400/30"
            />
            <span className="text-sm font-extrabold text-white truncate max-w-full">
              {leaderboard[0].name}
            </span>
            <span className="text-xs font-mono text-amber-300 font-extrabold">
              {leaderboard[0].xp} XP
            </span>
            <div className="w-full h-36 rounded-t-2xl bg-gradient-to-b from-amber-400 to-amber-600 flex items-center justify-center font-black text-4xl text-slate-950 shadow-2xl shadow-amber-500/20">
              1
            </div>
          </div>

          {/* 3rd Place */}
          <div className="flex flex-col items-center w-28 sm:w-36 space-y-2">
            <img
              src={leaderboard[2].avatar}
              alt={leaderboard[2].name}
              className="w-14 h-14 rounded-2xl bg-slate-800 border-2 border-amber-700 p-1"
            />
            <span className="text-xs font-bold text-white truncate max-w-full">
              {leaderboard[2].name}
            </span>
            <span className="text-xs font-mono text-amber-500 font-extrabold">
              {leaderboard[2].xp} XP
            </span>
            <div className="w-full h-18 rounded-t-2xl bg-gradient-to-b from-amber-700 to-amber-900 flex items-center justify-center font-black text-xl text-white shadow-lg">
              3
            </div>
          </div>
        </div>
      )}

      {/* Search & Full Rankings Table */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="text-lg font-bold text-white flex items-center space-x-2">
            <Users className="w-5 h-5 text-purple-400" />
            <span>Complete Roster</span>
          </h3>
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search scholar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-400">Loading Hall of Fame...</div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-slate-400">No students found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="text-xs uppercase bg-slate-950 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4">Rank</th>
                  <th className="px-6 py-4">Scholar</th>
                  <th className="px-6 py-4">Level</th>
                  <th className="px-6 py-4">Total XP</th>
                  <th className="px-6 py-4">Accuracy</th>
                  <th className="px-6 py-4">Streak</th>
                  <th className="px-6 py-4 text-right">Badges</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filtered.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold">
                      <span
                        className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black ${
                          s.rank === 1
                            ? 'bg-amber-400 text-slate-950'
                            : s.rank === 2
                            ? 'bg-slate-300 text-slate-950'
                            : s.rank === 3
                            ? 'bg-amber-700 text-white'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        #{s.rank}
                      </span>
                    </td>
                    <td className="px-6 py-4 flex items-center space-x-3">
                      <img src={s.avatar} alt={s.name} className="w-8 h-8 rounded-full bg-slate-800" />
                      <span className="font-bold text-white">{s.name}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-500/10 text-blue-400">
                        Lvl {s.level}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-purple-400">{s.xp} XP</td>
                    <td className="px-6 py-4 font-semibold text-emerald-400">{s.accuracy}%</td>
                    <td className="px-6 py-4 font-mono text-amber-400 flex items-center">
                      <Flame className="w-3.5 h-3.5 mr-1 fill-amber-400" />
                      {s.maxStreak}x
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-xs text-slate-400">
                      {s.badgesCount} 🏅
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
