import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  Shield,
  Users,
  BookOpen,
  Play,
  CheckCircle2,
  AlertTriangle,
  Trash2,
  Search,
  Activity,
  Layers
} from 'lucide-react';

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/analytics/admin');
      if (res.data.success) {
        setAnalytics(res.data);
        setUsers(res.data.recentUsers || []);
        setQuizzes(res.data.recentQuizzes || []);
      }
    } catch (err) {
      toast.error('Failed to load admin telemetry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleDeleteQuiz = async (quizId) => {
    if (!window.confirm('Admin action: Are you sure you want to delete/disable this quiz?')) return;
    try {
      const res = await axios.delete(`/api/quizzes/${quizId}`);
      if (res.data.success) {
        toast.success('Quiz disabled/deleted by administrator.');
        setQuizzes(quizzes.filter((q) => q._id !== quizId));
      }
    } catch (err) {
      toast.error('Admin action failed.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900 border border-rose-500/30">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-white">Platform Governance & Admin</h1>
            <p className="text-xs text-slate-400">Supervisory control of users, quiz integrity, and live telemetry</p>
          </div>
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center space-x-1.5 self-start sm:self-auto">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Core Engine Active</span>
        </span>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <span className="text-xs font-semibold text-slate-400 uppercase">Total Users</span>
          <p className="text-3xl font-extrabold text-white">{analytics?.counts?.totalUsers || 0}</p>
          <p className="text-xs text-slate-500">
            {analytics?.counts?.totalTeachers || 0} Teachers • {analytics?.counts?.totalStudents || 0} Students
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <span className="text-xs font-semibold text-slate-400 uppercase">Published Quizzes</span>
          <p className="text-3xl font-extrabold text-purple-400">{analytics?.counts?.totalQuizzes || 0}</p>
          <p className="text-xs text-slate-500">Across all academic disciplines</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <span className="text-xs font-semibold text-slate-400 uppercase">Active Live Rooms</span>
          <p className="text-3xl font-extrabold text-emerald-400">{analytics?.counts?.activeRooms || 0}</p>
          <p className="text-xs text-slate-500">Currently in progress</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <span className="text-xs font-semibold text-slate-400 uppercase">Completed Battles</span>
          <p className="text-3xl font-extrabold text-blue-400">{analytics?.counts?.completedSessions || 0}</p>
          <p className="text-xs text-slate-500">Historically finished</p>
        </div>
      </div>

      {/* User Management Section */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center space-x-2">
          <Users className="w-5 h-5 text-purple-400" />
          <span>Registered Platform Users</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="text-xs uppercase bg-slate-950 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">XP / Level</th>
                <th className="px-6 py-4">Joined</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {users.map((u) => (
                <tr key={u._id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-6 py-4 flex items-center space-x-3">
                    <img src={u.avatar} alt={u.name} className="w-8 h-8 rounded-full bg-slate-800" />
                    <div>
                      <p className="font-bold text-white">{u.name}</p>
                      <p className="text-xs text-slate-400">{u.email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
                        u.role === 'admin'
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                          : u.role === 'teacher'
                          ? 'bg-purple-500/10 text-purple-400 border border-purple-500/30'
                          : 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs font-mono">
                    Level {u.level || 1} • {u.xp || 0} XP
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-500">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400">
                      Active
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quiz Moderation Table */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center space-x-2">
          <BookOpen className="w-5 h-5 text-indigo-400" />
          <span>Platform Quizzes Moderation</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="text-xs uppercase bg-slate-950 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">Title</th>
                <th className="px-6 py-4">Author</th>
                <th className="px-6 py-4">Subject</th>
                <th className="px-6 py-4">Questions</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {quizzes.map((q) => (
                <tr key={q._id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-6 py-4 font-bold text-white">{q.title}</td>
                  <td className="px-6 py-4 text-slate-400 text-xs">{q.createdBy?.name || 'Teacher'}</td>
                  <td className="px-6 py-4 text-xs font-semibold text-purple-400">{q.subject}</td>
                  <td className="px-6 py-4 text-xs">{q.questions?.length || 0}</td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleDeleteQuiz(q._id)}
                      className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Moderate / Delete Quiz"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
