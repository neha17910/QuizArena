import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { sounds } from '../utils/soundEffects';
import toast from 'react-hot-toast';
import {
  User,
  Settings,
  Moon,
  Sun,
  Globe,
  Volume2,
  Lock,
  Save,
  CheckCircle2,
  Award
} from 'lucide-react';

const AVATAR_OPTIONS = [
  'Atlas', 'Nova', 'Cyber', 'Viper', 'Astra', 'Falcon', 'Titan', 'Zenith', 'Echo', 'Bolt'
];

export default function ProfileSettings() {
  const { user, updateProfile } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { language, toggleLanguage } = useLanguage();

  const [name, setName] = useState(user?.name || '');
  const [avatarSeed, setAvatarSeed] = useState('Atlas');
  const [password, setPassword] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(sounds.enabled);
  const [saving, setSaving] = useState(false);

  const currentAvatarUrl = `https://api.dicebear.com/7.x/bottts/svg?seed=${avatarSeed}`;

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    sounds.playClick();

    sounds.enabled = soundEnabled;

    const updatePayload = {
      name,
      avatar: currentAvatarUrl,
      preferences: {
        theme: isDark ? 'dark' : 'light',
        language,
        soundEffects: soundEnabled
      }
    };

    if (password.trim()) {
      updatePayload.password = password.trim();
    }

    const res = await updateProfile(updatePayload);
    setSaving(false);
    if (res.success) {
      setPassword('');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 flex items-center space-x-3">
        <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
          <Settings className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-white">Profile & Preferences</h1>
          <p className="text-xs text-slate-400">Manage your avatar, security credentials, and accessibility settings</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Card */}
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center">
            <User className="w-4 h-4 mr-2 text-purple-400" />
            Identity Details
          </h3>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
            <input
              type="email"
              disabled
              value={user?.email || ''}
              className="w-full px-3 py-2 rounded-xl bg-slate-950/50 border border-slate-800 text-sm text-slate-500 cursor-not-allowed"
            />
          </div>

          {/* Avatar Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">Avatar Customization</label>
            <div className="flex items-center space-x-3 p-3 rounded-2xl bg-slate-950 border border-slate-800">
              <img src={currentAvatarUrl} alt="Avatar" className="w-12 h-12 rounded-xl bg-slate-900 p-1" />
              <div className="flex flex-wrap gap-1.5 flex-1">
                {AVATAR_OPTIONS.map((seed) => (
                  <button
                    key={seed}
                    type="button"
                    onClick={() => {
                      sounds.playClick();
                      setAvatarSeed(seed);
                    }}
                    className={`px-2 py-0.5 text-xs rounded-lg ${
                      avatarSeed === seed ? 'bg-purple-600 text-white font-bold' : 'bg-slate-900 text-slate-400'
                    }`}
                  >
                    {seed}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">New Password (Leave blank to keep)</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white"
            />
          </div>
        </div>

        {/* Preferences & Accessibility Card */}
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center">
            <Globe className="w-4 h-4 mr-2 text-indigo-400" />
            Accessibility & Preferences
          </h3>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-white">Visual Theme</p>
              <p className="text-xs text-slate-400">Toggle Dark / Light appearance</p>
            </div>
            <button
              type="button"
              onClick={toggleTheme}
              className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-slate-300 flex items-center space-x-1.5"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
              <span>{isDark ? 'Dark Mode' : 'Light Mode'}</span>
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-white">Interface Language</p>
              <p className="text-xs text-slate-400">English or Hindi (हिंदी)</p>
            </div>
            <button
              type="button"
              onClick={toggleLanguage}
              className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-indigo-300 flex items-center space-x-1.5"
            >
              <Globe className="w-4 h-4" />
              <span>{language === 'en' ? 'English' : 'हिंदी'}</span>
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-white">Synthesized Audio FX</p>
              <p className="text-xs text-slate-400">Game buzzer, ticks & chimes</p>
            </div>
            <input
              type="checkbox"
              checked={soundEnabled}
              onChange={(e) => setSoundEnabled(e.target.checked)}
              className="w-5 h-5 accent-purple-600 rounded"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:brightness-110 text-white font-bold text-sm shadow-lg shadow-purple-600/30 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 mt-4"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
