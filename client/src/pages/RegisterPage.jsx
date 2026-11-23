import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { sounds } from '../utils/soundEffects';
import { Zap, User, Mail, Lock, GraduationCap, School, Check, RefreshCw } from 'lucide-react';

const PRESET_AVATARS = [
  'Atlas', 'Nova', 'Cyber', 'Viper', 'Astra', 'Falcon', 'Titan', 'Zenith'
];

export default function RegisterPage() {
  const [role, setRole] = useState('student');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [avatarSeed, setAvatarSeed] = useState('Nova');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const currentAvatarUrl = `https://api.dicebear.com/7.x/bottts/svg?seed=${avatarSeed}`;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) return;
    setLoading(true);
    sounds.playClick();
    const result = await register({
      name,
      email,
      password,
      role,
      avatar: currentAvatarUrl
    });
    setLoading(false);
    if (result.success) {
      if (role === 'teacher') navigate('/teacher');
      else navigate('/student');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-md w-full space-y-6 bg-slate-900/90 border border-slate-800 p-8 rounded-3xl shadow-2xl backdrop-blur-xl">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-blue-500 mx-auto flex items-center justify-center shadow-lg shadow-purple-500/30">
            <Zap className="w-6 h-6 text-white fill-white" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Create Your Account
          </h2>
          <p className="text-sm text-slate-400">
            Join QuizArena to host live quizzes or compete in learning tournaments
          </p>
        </div>

        {/* Role Toggle */}
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Select Your Role
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                setRole('student');
              }}
              className={`p-3.5 rounded-2xl border flex flex-col items-center justify-center space-y-1.5 transition-all ${
                role === 'student'
                  ? 'bg-blue-600/20 border-blue-500 text-white shadow-lg shadow-blue-500/20'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <GraduationCap className={`w-5 h-5 ${role === 'student' ? 'text-blue-400' : 'text-slate-500'}`} />
              <span className="text-sm font-bold">Student / Player</span>
            </button>
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                setRole('teacher');
              }}
              className={`p-3.5 rounded-2xl border flex flex-col items-center justify-center space-y-1.5 transition-all ${
                role === 'teacher'
                  ? 'bg-purple-600/20 border-purple-500 text-white shadow-lg shadow-purple-500/20'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <School className={`w-5 h-5 ${role === 'teacher' ? 'text-purple-400' : 'text-slate-500'}`} />
              <span className="text-sm font-bold">Teacher / Host</span>
            </button>
          </div>
        </div>

        {/* Avatar Picker */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Choose Avatar
            </label>
            <button
              type="button"
              onClick={() => setAvatarSeed(`Bot_${Math.floor(Math.random() * 9999)}`)}
              className="flex items-center space-x-1 text-xs text-purple-400 hover:text-purple-300"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Random</span>
            </button>
          </div>
          <div className="flex items-center space-x-3 bg-slate-950 p-2.5 rounded-2xl border border-slate-800">
            <img
              src={currentAvatarUrl}
              alt="Avatar"
              className="w-12 h-12 rounded-xl bg-slate-900 border border-purple-500/30 p-1"
            />
            <div className="flex-1 flex flex-wrap gap-1.5">
              {PRESET_AVATARS.map((seed) => (
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

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
            <div className="relative">
              <User className="w-5 h-5 text-slate-500 absolute left-3 top-3" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Jordan Miller"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-5 h-5 text-slate-500 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jordan@domain.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-5 h-5 text-slate-500 absolute left-3 top-3" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-sm shadow-lg shadow-purple-600/30 hover:brightness-110 active:scale-98 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 mt-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <span>Create {role === 'teacher' ? 'Teacher' : 'Student'} Account</span>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-slate-400">
          Already registered?{' '}
          <Link to="/login" className="font-semibold text-purple-400 hover:text-purple-300 ml-1">
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
}
