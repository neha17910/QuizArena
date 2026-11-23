import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { sounds } from '../utils/soundEffects';
import { jsPDF } from 'jspdf';
import {
  Trophy,
  Award,
  Users,
  Calendar,
  Plus,
  Play,
  ArrowRight,
  ShieldCheck,
  Download
} from 'lucide-react';

export default function TournamentDashboard() {
  const { user, isTeacher } = useAuth();
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');

  const fetchTournaments = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/tournaments');
      if (res.data.success) {
        setTournaments(res.data.tournaments);
      }
    } catch (err) {
      toast.error('Failed to load tournaments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTournaments();
  }, []);

  const handleRegister = async (tournamentId) => {
    if (!user) {
      return toast.error('Please log in as a student to register for tournaments.');
    }
    try {
      sounds.playClick();
      const res = await axios.post(`/api/tournaments/${tournamentId}/register`);
      if (res.data.success) {
        toast.success(res.data.message);
        fetchTournaments();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed.');
    }
  };

  const handleCreateTournament = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    try {
      sounds.playClick();
      const res = await axios.post('/api/tournaments', {
        title: newTitle,
        description: newDescription
      });
      if (res.data.success) {
        toast.success('Tournament created!');
        setCreateModalOpen(false);
        setNewTitle('');
        setNewDescription('');
        fetchTournaments();
      }
    } catch (err) {
      toast.error('Failed to create tournament.');
    }
  };

  const handleDownloadCertificate = (tTitle, pName) => {
    try {
      const doc = new jsPDF({ orientation: 'landscape' });
      doc.setFillColor(15, 23, 42);
      doc.rect(0, 0, 297, 210, 'F');

      doc.setDrawColor(124, 58, 237);
      doc.setLineWidth(3);
      doc.rect(10, 10, 277, 190);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(28);
      doc.setTextColor(245, 158, 11);
      doc.text('CERTIFICATE OF ACADEMIC EXCELLENCE', 148.5, 45, { align: 'center' });

      doc.setFontSize(14);
      doc.setTextColor(200, 200, 200);
      doc.text('This official certificate is proudly awarded to:', 148.5, 65, { align: 'center' });

      doc.setFontSize(26);
      doc.setTextColor(255, 255, 255);
      doc.text(pName || 'Alex Johnson', 148.5, 85, { align: 'center' });

      doc.setFontSize(14);
      doc.setTextColor(200, 200, 200);
      doc.text(`For outstanding competitive achievement and mastery in`, 148.5, 105, { align: 'center' });

      doc.setFontSize(18);
      doc.setTextColor(124, 58, 237);
      doc.text(tTitle, 148.5, 120, { align: 'center' });

      doc.setFontSize(11);
      doc.setTextColor(150, 150, 150);
      doc.text(`Awarded on: ${new Date().toLocaleDateString()} • Verified by QuizArena Governance`, 148.5, 155, { align: 'center' });

      doc.save(`Certificate_${tTitle.substring(0, 15)}.pdf`);
      toast.success('Certificate downloaded successfully!');
    } catch (e) {
      toast.error('Certificate generation failed.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900 border border-amber-500/30">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-white">Campus & Academic Tournaments</h1>
            <p className="text-xs text-slate-400">
              Multi-round scheduled championships with cumulative leaderboards and verified certificates
            </p>
          </div>
        </div>

        {isTeacher && (
          <button
            onClick={() => setCreateModalOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:brightness-110 text-slate-950 font-bold text-xs flex items-center space-x-1.5 shadow-lg shadow-amber-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create Tournament</span>
          </button>
        )}
      </div>

      {/* Tournaments Grid */}
      {loading ? (
        <div className="py-20 text-center text-slate-400">Loading tournaments...</div>
      ) : tournaments.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-slate-900 border border-slate-800 space-y-2">
          <Trophy className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-white">No tournaments currently scheduled</h3>
          <p className="text-xs text-slate-400">Teachers can create tournament championships anytime.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tournaments.map((t) => {
            const isRegistered = t.participants?.some(
              (p) => p.userId && p.userId.toString() === user?.id
            );

            return (
              <div
                key={t._id}
                className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/40 transition-all space-y-4"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    {t.status || 'Upcoming'}
                  </span>
                  <div className="flex items-center space-x-1 text-xs text-slate-400">
                    <Users className="w-4 h-4" />
                    <span>{t.participants?.length || 0} Registered</span>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-white">{t.title}</h3>
                  <p className="text-xs text-slate-400 mt-1">{t.description || 'Championship Battle'}</p>
                </div>

                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                  <span className="font-bold text-slate-300">Rounds & Schedule:</span>
                  <div className="space-y-1">
                    {(t.rounds || []).map((r, i) => (
                      <div key={i} className="flex items-center justify-between text-slate-400">
                        <span>• {r.name || `Round ${r.roundNumber}`}</span>
                        <span className="font-mono text-purple-400">
                          {r.scheduledAt ? new Date(r.scheduledAt).toLocaleDateString() : 'Upcoming'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <button
                    onClick={() => handleDownloadCertificate(t.title, user?.name)}
                    className="flex items-center space-x-1 text-xs text-amber-400 hover:text-amber-300 font-bold"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Certificate</span>
                  </button>

                  {user?.role === 'student' && (
                    <button
                      onClick={() => handleRegister(t._id)}
                      disabled={isRegistered}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                        isRegistered
                          ? 'bg-slate-800 text-slate-500 cursor-default'
                          : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20'
                      }`}
                    >
                      {isRegistered ? '✓ Registered' : 'Register Now'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Tournament Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <form
            onSubmit={handleCreateTournament}
            className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4"
          >
            <h3 className="text-lg font-bold text-white">Create New Tournament</h3>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Title</label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Science Olympiad 2026"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
              <textarea
                rows={3}
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Tournament guidelines and details"
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setCreateModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-400 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold"
              >
                Create
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
