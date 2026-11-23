import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend
} from 'recharts';
import {
  BarChart2,
  PieChart as PieIcon,
  Download,
  FileSpreadsheet,
  FileText,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Users,
  Award
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function AnalyticsDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const res = await axios.get('/api/analytics/teacher');
        if (res.data.success) {
          setData(res.data);
        }
      } catch (err) {
        toast.error('Failed to load teacher analytics.');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const handleDownloadPDF = () => {
    try {
      const doc = new jsPDF();
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(20);
      doc.setTextColor(124, 58, 237);
      doc.text('QuizArena – Performance & Analytics Report', 20, 20);

      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(50, 50, 50);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, 30);

      doc.setLineWidth(0.5);
      doc.line(20, 35, 190, 35);

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Executive Summary Metrics:', 20, 45);

      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.text(`• Total Quizzes Created: ${data?.metrics?.totalQuizzesCreated || 0}`, 25, 55);
      doc.text(`• Total Live Arenas Hosted: ${data?.metrics?.totalQuizzesHosted || 0}`, 25, 63);
      doc.text(`• Total Students Participated: ${data?.metrics?.totalStudentsParticipated || 0}`, 25, 71);
      doc.text(`• Average Student Accuracy: ${data?.metrics?.averageAccuracy || 0}%`, 25, 79);
      doc.text(`• Average Battle Score: ${data?.metrics?.averageQuizScore || 0} pts`, 25, 87);

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Question Difficulty Analysis:', 20, 105);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      let y = 115;
      (data?.charts?.questionAccuracy || []).slice(0, 5).forEach((q, i) => {
        doc.text(`${i + 1}. [${q.accuracy}% accuracy] ${q.questionText?.substring(0, 65)}...`, 25, y);
        y += 8;
      });

      doc.save('QuizArena_Analytics_Report.pdf');
      toast.success('PDF report downloaded successfully!');
    } catch (e) {
      toast.error('Failed to generate PDF.');
    }
  };

  const handleDownloadCSV = () => {
    try {
      let csv = 'Question,Accuracy (%),Total Answers,Correct Answers\n';
      (data?.charts?.questionAccuracy || []).forEach((q) => {
        csv += `"${q.questionText?.replace(/"/g, '""')}",${q.accuracy}%,${q.totalAnswers},${q.correctAnswers}\n`;
      });
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'QuizArena_Question_Accuracy.csv';
      a.click();
      toast.success('CSV data exported successfully!');
    } catch (e) {
      toast.error('Failed to export CSV.');
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-400">
        <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p>Synthesizing Platform Analytics with MongoDB Aggregations...</p>
      </div>
    );
  }

  const PIE_COLORS = ['#10B981', '#EF4444'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900 border border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <BarChart2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-white">Teacher Analytics & Gradebook</h1>
            <p className="text-xs text-slate-400">
              Aggregated student performance, accuracy distributions, and question difficulty breakdown
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleDownloadCSV}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center space-x-1.5 border border-slate-700 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handleDownloadPDF}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:brightness-110 text-white text-xs font-bold flex items-center space-x-1.5 shadow-lg shadow-purple-600/30 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Export PDF Report</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <span className="text-xs font-semibold text-slate-400 uppercase">Total Students</span>
          <p className="text-3xl font-extrabold text-white">{data?.metrics?.totalStudentsParticipated || 0}</p>
          <p className="text-xs text-slate-500">Across all hosted sessions</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <span className="text-xs font-semibold text-slate-400 uppercase">Average Accuracy</span>
          <p className="text-3xl font-extrabold text-emerald-400">{data?.metrics?.averageAccuracy || 0}%</p>
          <p className="text-xs text-slate-500">Class comprehension score</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <span className="text-xs font-semibold text-slate-400 uppercase">Average Quiz Score</span>
          <p className="text-3xl font-extrabold text-purple-400">{data?.metrics?.averageQuizScore || 0} pts</p>
          <p className="text-xs text-slate-500">Points per participant</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <span className="text-xs font-semibold text-slate-400 uppercase">Arenas Hosted</span>
          <p className="text-3xl font-extrabold text-blue-400">{data?.metrics?.totalQuizzesHosted || 0}</p>
          <p className="text-xs text-slate-500">Real-time games</p>
        </div>
      </div>

      {/* Recharts Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Score Distribution Bar Chart */}
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Score Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.charts?.scoreDistribution || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="range" stroke="#94A3B8" textAnchor="end" tick={{ fontSize: 11 }} />
                <YAxis stroke="#94A3B8" tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155' }} />
                <Bar dataKey="count" fill="#7C3AED" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Correct vs Incorrect Pie Chart */}
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Overall Answer Accuracy Ratio</h3>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data?.charts?.pieData || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {(data?.charts?.pieData || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155' }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Question-wise Accuracy Bar Chart */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Question-by-Question Accuracy (%)
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.charts?.questionAccuracy || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="questionText" stroke="#94A3B8" tick={{ fontSize: 10 }} />
                <YAxis stroke="#94A3B8" tick={{ fontSize: 11 }} domain={[0, 100]} />
                <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155' }} />
                <Bar dataKey="accuracy" fill="#10B981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
