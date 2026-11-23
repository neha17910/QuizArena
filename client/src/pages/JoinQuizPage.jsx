import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { sounds } from '../utils/soundEffects';
import { Zap, Play, User, RefreshCw, ArrowRight } from 'lucide-react';

const AVATAR_SEEDS = ['Nova', 'Apex', 'Cyber', 'Bolt', 'Ghost', 'Viper', 'Echo', 'Orbit'];

export default function JoinQuizPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, guestPlayer, updateGuest } = useAuth();

  const [roomCode, setRoomCode] = useState(searchParams.get('code') || '');
  const [playerName, setPlayerName] = useState(user?.name || guestPlayer?.name || '');
  const [avatarSeed, setAvatarSeed] = useState('Apex');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (searchParams.get('code')) {
      setRoomCode(searchParams.get('code').toUpperCase());
    }
  }, [searchParams]);

  const currentAvatarUrl = `https://api.dicebear.com/7.x/bottts/svg?seed=${avatarSeed}`;

  const handleJoin = async (e) => {
    e.preventDefault();
    const cleanCode = roomCode.trim().toUpperCase();
    const cleanName = playerName.trim();

    if (!cleanCode) return toast.error('Please enter the 6-character room PIN.');
    if (!cleanName) return toast.error('Please enter your player nickname.');

    setLoading(true);
    sounds.playClick();

    try {
      // 1. Verify room exists and is active on backend
      const res = await axios.post('/api/sessions/join', { roomCode: cleanCode });
      if (res.data.success) {
        sounds.playCorrect();
        // Update guest or active player info in storage
        if (!user) {
          updateGuest(cleanName, currentAvatarUrl);
        }
        // Navigate to live room
        navigate(`/room/${cleanCode}`, {
          state: {
            playerName: cleanName,
            avatar: user?.avatar || currentAvatarUrl,
            quizTitle: res.data.quiz?.title
          }
        });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not join room. Please check PIN.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 sm:px-6 py-12">
      <div className="max-w-md w-full bg-slate-900/90 border border-purple-500/30 p-8 rounded-3xl shadow-2xl backdrop-blur-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/30">
            <Play className="w-6 h-6 text-white fill-white ml-0.5" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Join Live Quiz Arena
          </h2>
          <p className="text-xs text-slate-400">
            Enter the host PIN and step up to the synchronized multiplayer leaderboard
          </p>
        </div>

        <form onSubmit={handleJoin} className="space-y-4">
          {/* Room PIN Input */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              Game Room PIN
            </label>
            <input
              type="text"
              required
              maxLength={6}
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              placeholder="e.g. QA8821"
              className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-purple-500/40 text-center font-mono font-extrabold text-2xl tracking-widest text-white placeholder-slate-600 focus:outline-none focus:border-purple-400 uppercase shadow-inner"
            />
          </div>

          {/* Nickname Input */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              Your Player Nickname
            </label>
            <div className="relative">
              <User className="w-5 h-5 text-slate-500 absolute left-3 top-3" />
              <input
                type="text"
                required
                maxLength={20}
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="e.g. SpeedDemon or Alex"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm font-semibold text-white placeholder-slate-600 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {/* Choose Avatar */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Select Battle Bot
              </label>
              <button
                type="button"
                onClick={() => setAvatarSeed(`Bot_${Math.floor(Math.random() * 9999)}`)}
                className="flex items-center space-x-1 text-xs text-purple-400 hover:text-purple-300 font-semibold"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Shuffle</span>
              </button>
            </div>
            <div className="flex items-center space-x-3 bg-slate-950 p-2.5 rounded-2xl border border-slate-800">
              <img
                src={user?.avatar || currentAvatarUrl}
                alt="Avatar"
                className="w-12 h-12 rounded-xl bg-slate-900 border border-purple-500/40 p-1"
              />
              <div className="flex-1 flex flex-wrap gap-1.5">
                {AVATAR_SEEDS.map((seed) => (
                  <button
                    key={seed}
                    type="button"
                    onClick={() => {
                      sounds.playClick();
                      setAvatarSeed(seed);
                    }}
                    className={`px-2 py-1 text-xs rounded-lg font-medium transition-all ${
                      avatarSeed === seed
                        ? 'bg-purple-600 text-white font-bold'
                        : 'bg-slate-900 text-slate-400 hover:text-white'
                    }`}
                  >
                    {seed}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:brightness-110 active:scale-98 text-white font-extrabold text-sm shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 pt-3"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <span>Enter Battle Arena</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
