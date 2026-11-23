import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { sounds } from '../utils/soundEffects';
import {
  PlusCircle,
  Play,
  Sparkles,
  BookOpen,
  BarChart2,
  Trophy,
  Copy,
  Trash2,
  Edit,
  Clock,
  Users,
  CheckCircle,
  Search,
  Filter,
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';

export default function TeacherDashboard() {
  const { user } = useAuth();
  const { socket } = useSocket();
  const navigate = useNavigate();

  const [quizzes, setQuizzes] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('quizzes');
  const [hostingQuizId, setHostingQuizId] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [quizzesRes, sessionsRes] = await Promise.all([
        axios.get('/api/quizzes?myQuizzes=true'),
        axios.get('/api/sessions')
      ]);

      if (quizzesRes.data.success) {
        setQuizzes(quizzesRes.data.quizzes);
      }
      if (sessionsRes.data.success) {
        setSessions(sessionsRes.data.sessions);
      }
    } catch (err) {
      toast.error('Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Listen for socket room creation
  useEffect(() => {
    if (!socket) return;

    const handleRoomCreated = ({ roomCode, sessionId }) => {
      sounds.playCorrect();
      toast.success(`Live Arena Room ${roomCode} Created!`);
      navigate(`/host/${roomCode}`);
    };

    socket.on('room:created', handleRoomCreated);

    return () => {
      socket.off('room:created', handleRoomCreated);
    };
  }, [socket, navigate]);

  // Host live quiz session
  const handleHostLive = (quiz) => {
    if (!socket) {
      return toast.error('Connecting to live server. Please wait...');
    }
    sounds.playClick();
    setHostingQuizId(quiz._id);
    socket.emit('room:create', {
      quizId: quiz._id,
      hostId: user?.id,
      settings: quiz.settings
    });
  };

  // Delete quiz
  const handleDeleteQuiz = async (quizId, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      const res = await axios.delete(`/api/quizzes/${quizId}`);
      if (res.data.success) {
        toast.success('Quiz deleted.');
        setQuizzes(quizzes.filter((q) => q._id !== quizId));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete quiz.');
    }
  };

  // Duplicate quiz
  const handleDuplicateQuiz = async (quizId) => {
    try {
      sounds.playClick();
      const res = await axios.post(`/api/quizzes/${quizId}/duplicate`);
      if (res.data.success) {
        toast.success('Quiz duplicated successfully!');
        setQuizzes([res.data.quiz, ...quizzes]);
      }
    } catch (err) {
      toast.error('Failed to duplicate quiz.');
    }
  };

  const filteredQuizzes = quizzes.filter(
    (q) =>
      q.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalQuestionsCreated = quizzes.reduce((acc, q) => acc + (q.questions?.length || 0), 0);
  const totalStudentsTaught = sessions.reduce((acc, s) => acc + (s.participants?.length || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-900/60 via-indigo-900/40 to-slate-900 border border-purple-500/30 p-6 sm:p-8 backdrop-blur-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30">
              Teacher Command Center
            </span>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white">
              Welcome back, {user?.name}! 🎓
            </h1>
            <p className="text-sm text-slate-300 max-w-xl">
              Create interactive real-time live quizzes, launch multi-round tournaments, or auto-generate complete assessments with AI.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/quiz/create"
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-sm shadow-lg shadow-purple-600/30 hover:brightness-110 active:scale-95 transition-all flex items-center space-x-2"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create New Quiz</span>
            </Link>
            <Link
              to="/ai-generator"
              className="px-5 py-3 rounded-xl bg-slate-800 border border-purple-500/40 text-purple-300 font-bold text-sm hover:bg-slate-700 active:scale-95 transition-all flex items-center space-x-2"
            >
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>AI Quiz Generator</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase">Total Quizzes</span>
            <BookOpen className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-white">{quizzes.length}</p>
          <p className="text-xs text-slate-500">{totalQuestionsCreated} questions created</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase">Live Arenas Hosted</span>
            <Play className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-white">{sessions.length}</p>
          <p className="text-xs text-slate-500">Real-time room sessions</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase">Student Participations</span>
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-white">{totalStudentsTaught}</p>
          <p className="text-xs text-slate-500">Across all hosted battles</p>
        </div>

        <Link
          to="/analytics"
          className="p-5 rounded-2xl bg-gradient-to-br from-indigo-950/40 to-slate-900/80 border border-indigo-500/30 hover:border-indigo-500/60 transition-all space-y-1 group"
        >
          <div className="flex items-center justify-between text-indigo-300">
            <span className="text-xs font-semibold uppercase">Performance Analytics</span>
            <BarChart2 className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
          </div>
          <p className="text-lg font-bold text-white flex items-center">
            <span>View Reports</span>
            <ArrowRight className="w-4 h-4 ml-1 text-indigo-400" />
          </p>
          <p className="text-xs text-slate-400">PDF & CSV exports</p>
        </Link>
      </div>

      {/* Tabs & Search */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('quizzes')}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                activeTab === 'quizzes'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                  : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              My Quizzes ({quizzes.length})
            </button>
            <button
              onClick={() => setActiveTab('sessions')}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                activeTab === 'sessions'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                  : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              Session History ({sessions.length})
            </button>
          </div>

          {activeTab === 'quizzes' && (
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search quizzes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>
          )}
        </div>

        {/* Tab 1: Quizzes List */}
        {activeTab === 'quizzes' && (
          <div>
            {loading ? (
              <div className="py-16 text-center">
                <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-sm text-slate-400">Loading your quizzes...</p>
              </div>
            ) : filteredQuizzes.length === 0 ? (
              <div className="p-12 text-center rounded-3xl bg-slate-900/50 border border-dashed border-slate-800 space-y-4">
                <BookOpen className="w-12 h-12 text-slate-600 mx-auto" />
                <h3 className="text-lg font-bold text-white">No quizzes found</h3>
                <p className="text-sm text-slate-400 max-w-sm mx-auto">
                  Get started by creating a quiz manually or generate one with the AI Quiz Generator.
                </p>
                <div className="flex justify-center gap-3 pt-2">
                  <Link
                    to="/quiz/create"
                    className="px-4 py-2 rounded-xl bg-purple-600 text-white font-bold text-sm"
                  >
                    Create Quiz
                  </Link>
                  <Link
                    to="/ai-generator"
                    className="px-4 py-2 rounded-xl bg-slate-800 text-purple-300 font-bold text-sm border border-purple-500/30"
                  >
                    AI Generator
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredQuizzes.map((quiz) => (
                  <div
                    key={quiz._id}
                    className="flex flex-col justify-between rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-purple-500/40 p-5 transition-all shadow-lg group"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                          {quiz.subject}
                        </span>
                        <span
                          className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${
                            quiz.difficulty === 'easy'
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : quiz.difficulty === 'hard'
                              ? 'bg-rose-500/10 text-rose-400'
                              : 'bg-amber-500/10 text-amber-400'
                          }`}
                        >
                          {quiz.difficulty}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors line-clamp-1">
                        {quiz.title}
                      </h3>

                      <p className="text-xs text-slate-400 line-clamp-2">
                        {quiz.description || 'No description provided.'}
                      </p>

                      <div className="flex items-center space-x-4 text-xs text-slate-400 pt-2 border-t border-slate-800/80">
                        <div className="flex items-center space-x-1">
                          <Layers className="w-3.5 h-3.5 text-slate-500" />
                          <span>{quiz.questions?.length || 0} questions</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3.5 h-3.5 text-slate-500" />
                          <span>{quiz.settings?.timeLimitPerQuestion || 30}s / q</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Users className="w-3.5 h-3.5 text-slate-500" />
                          <span>{quiz.playCount || 0} plays</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between">
                      {/* Host Live Button */}
                      <button
                        onClick={() => handleHostLive(quiz)}
                        disabled={hostingQuizId === quiz._id}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-xs flex items-center space-x-1.5 shadow-md shadow-emerald-500/20 hover:brightness-110 active:scale-95 transition-all"
                      >
                        <Play className="w-3.5 h-3.5 fill-white" />
                        <span>{hostingQuizId === quiz._id ? 'Starting...' : 'Host Live'}</span>
                      </button>

                      {/* Management actions */}
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleDuplicateQuiz(quiz._id)}
                          title="Duplicate Quiz"
                          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <Link
                          to={`/quiz/edit/${quiz._id}`}
                          title="Edit Quiz"
                          className="p-2 rounded-lg text-slate-400 hover:text-purple-300 hover:bg-slate-800 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDeleteQuiz(quiz._id, quiz.title)}
                          title="Delete Quiz"
                          className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Sessions History */}
        {activeTab === 'sessions' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            {sessions.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                <Play className="w-10 h-10 mx-auto text-slate-600 mb-2" />
                <p>No live sessions hosted yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="text-xs uppercase bg-slate-950 text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="px-6 py-4">Room PIN</th>
                      <th className="px-6 py-4">Quiz Name</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Participants</th>
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {sessions.map((s) => (
                      <tr key={s._id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="px-6 py-4 font-mono font-bold text-purple-400">{s.roomCode}</td>
                        <td className="px-6 py-4 font-semibold text-white">{s.quizId?.title || 'Live Quiz'}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2 py-0.5 text-xs font-semibold rounded-full capitalize ${
                              s.status === 'completed'
                                ? 'bg-emerald-500/10 text-emerald-400'
                                : 'bg-blue-500/10 text-blue-400'
                            }`}
                          >
                            {s.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">{s.participants?.length || 0} students</td>
                        <td className="px-6 py-4 text-xs text-slate-500">
                          {new Date(s.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link
                            to={`/analytics/session/${s._id}`}
                            className="px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/20 text-xs font-bold transition-colors"
                          >
                            View Report
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
