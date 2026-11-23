import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import JoinQuizPage from './pages/JoinQuizPage';
import WaitingRoom from './pages/WaitingRoom';
import HostControlPanel from './pages/HostControlPanel';
import TeacherDashboard from './pages/TeacherDashboard';
import StudentDashboard from './pages/StudentDashboard';
import AdminDashboard from './pages/AdminDashboard';
import QuizBuilder from './pages/QuizBuilder';
import AiQuizGenerator from './pages/AiQuizGenerator';
import QuestionBankPage from './pages/QuestionBankPage';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import TournamentDashboard from './pages/TournamentDashboard';
import QuizReviewPage from './pages/QuizReviewPage';
import ProfileSettings from './pages/ProfileSettings';
import LeaderboardPage from './pages/LeaderboardPage';
import FlashcardsPage from './pages/FlashcardsPage';

export default function App() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 transition-colors dark:bg-slate-950 light:bg-slate-50 light:text-slate-900">
      <Navbar />

      <main className="flex-1">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/join" element={<JoinQuizPage />} />
          <Route path="/room/:roomCode" element={<WaitingRoom />} />
          <Route path="/tournaments" element={<TournamentDashboard />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/quiz/flashcards/:id" element={<FlashcardsPage />} />

          {/* Teacher Routes */}
          <Route element={<ProtectedRoute allowedRoles={['teacher', 'admin']} />}>
            <Route path="/teacher" element={<TeacherDashboard />} />
            <Route path="/host/:roomCode" element={<HostControlPanel />} />
            <Route path="/quiz/create" element={<QuizBuilder />} />
            <Route path="/quiz/edit/:id" element={<QuizBuilder />} />
            <Route path="/ai-generator" element={<AiQuizGenerator />} />
            <Route path="/question-bank" element={<QuestionBankPage />} />
            <Route path="/analytics" element={<AnalyticsDashboard />} />
          </Route>

          {/* Student Routes */}
          <Route element={<ProtectedRoute allowedRoles={['student', 'admin', 'teacher']} />}>
            <Route path="/student" element={<StudentDashboard />} />
            <Route path="/quiz/review/:id" element={<QuizReviewPage />} />
          </Route>

          {/* Admin Routes */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>

          {/* Common Authenticated Routes */}
          <Route element={<ProtectedRoute allowedRoles={['student', 'teacher', 'admin']} />}>
            <Route path="/profile" element={<ProfileSettings />} />
          </Route>

          {/* 404 Fallback */}
          <Route path="*" element={<LandingPage />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}
