import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { sounds } from '../utils/soundEffects';
import {
  Save,
  Plus,
  Trash2,
  Copy,
  Clock,
  Sparkles,
  HelpCircle,
  Code2,
  Image as ImageIcon,
  Check,
  CheckCircle2,
  Eye,
  Settings,
  ArrowLeft,
  X
} from 'lucide-react';

const QUESTION_TYPES = [
  { value: 'mcq', label: 'Multiple Choice (MCQ)' },
  { value: 'true_false', label: 'True / False' },
  { value: 'multiple_select', label: 'Multiple Select' },
  { value: 'fill_in_blank', label: 'Fill in the Blanks' },
  { value: 'short_answer', label: 'Short Answer' },
  { value: 'code_based', label: 'Code-Based Question' },
  { value: 'image_based', label: 'Image-Based Question' },
  { value: 'poll', label: 'Poll / Survey' },
  { value: 'matching', label: 'Matching Pairs' },
  { value: 'numerical', label: 'Numerical Answer' }
];

export default function QuizBuilder() {
  const { id } = useParams(); // If edit mode
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subject, setSubject] = useState('Computer Science');
  const [category, setCategory] = useState('General');
  const [difficulty, setDifficulty] = useState('medium');
  const [settings, setSettings] = useState({
    timeLimitPerQuestion: 30,
    positiveMarking: 100,
    negativeMarking: 0,
    randomQuestionOrder: false,
    randomAnswerOrder: false,
    isPublic: true,
    showCorrectAnswers: true,
    enableLeaderboard: true,
    soundEffects: true
  });

  const [questions, setQuestions] = useState([
    {
      questionText: 'What is the primary function of an operating system kernel?',
      questionType: 'mcq',
      options: [
        { id: 'opt_1', text: 'Manage hardware resources & execution', isCorrect: true },
        { id: 'opt_2', text: 'Compile user source code', isCorrect: false },
        { id: 'opt_3', text: 'Format text documents', isCorrect: false },
        { id: 'opt_4', text: 'Render 3D web animations', isCorrect: false }
      ],
      correctAnswer: 'opt_1',
      explanation: 'The kernel is the central core of an operating system managing CPU, memory, and devices.',
      points: 100,
      timeLimit: 30,
      codeSnippet: '',
      codeLanguage: 'javascript',
      imageUrl: '',
      difficulty: 'medium'
    }
  ]);

  const [selectedQIndex, setSelectedQIndex] = useState(0);
  const [saving, setSaving] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);

  useEffect(() => {
    if (id) {
      const fetchQuiz = async () => {
        try {
          const res = await axios.get(`/api/quizzes/${id}`);
          if (res.data.success && res.data.quiz) {
            const q = res.data.quiz;
            setTitle(q.title);
            setDescription(q.description || '');
            setSubject(q.subject || 'General');
            setCategory(q.category || 'General');
            setDifficulty(q.difficulty || 'medium');
            if (q.settings) setSettings({ ...settings, ...q.settings });
            if (q.questions && q.questions.length > 0) {
              setQuestions(q.questions);
            }
          }
        } catch (err) {
          toast.error('Failed to load quiz details.');
        }
      };
      fetchQuiz();
    }
  }, [id]);

  const currentQ = questions[selectedQIndex] || questions[0];

  const updateCurrentQuestion = (fields) => {
    const updated = [...questions];
    updated[selectedQIndex] = { ...updated[selectedQIndex], ...fields };
    setQuestions(updated);
  };

  const handleAddQuestion = () => {
    sounds.playClick();
    const newQ = {
      questionText: `New Question ${questions.length + 1}`,
      questionType: 'mcq',
      options: [
        { id: 'opt_1', text: 'Option A', isCorrect: true },
        { id: 'opt_2', text: 'Option B', isCorrect: false },
        { id: 'opt_3', text: 'Option C', isCorrect: false },
        { id: 'opt_4', text: 'Option D', isCorrect: false }
      ],
      correctAnswer: 'opt_1',
      explanation: '',
      points: 100,
      timeLimit: settings.timeLimitPerQuestion || 30,
      codeSnippet: '',
      codeLanguage: 'javascript',
      imageUrl: '',
      difficulty: 'medium'
    };
    setQuestions([...questions, newQ]);
    setSelectedQIndex(questions.length);
  };

  const handleDeleteQuestion = (idx) => {
    if (questions.length <= 1) {
      return toast.error('A quiz must have at least one question.');
    }
    const updated = questions.filter((_, i) => i !== idx);
    setQuestions(updated);
    setSelectedQIndex(Math.max(0, idx - 1));
  };

  const handleOptionChange = (optIndex, text) => {
    const newOptions = [...(currentQ.options || [])];
    newOptions[optIndex] = { ...newOptions[optIndex], text };
    updateCurrentQuestion({ options: newOptions });
  };

  const handleCorrectOptionSelect = (optId) => {
    const newOptions = (currentQ.options || []).map((opt) => ({
      ...opt,
      isCorrect: opt.id === optId
    }));
    updateCurrentQuestion({ options: newOptions, correctAnswer: optId });
  };

  const handleSaveQuiz = async () => {
    if (!title.trim()) {
      return toast.error('Please enter a quiz title.');
    }
    setSaving(true);
    sounds.playClick();

    try {
      const payload = {
        title,
        description,
        subject,
        category,
        difficulty,
        settings,
        questions
      };

      if (id) {
        await axios.put(`/api/quizzes/${id}`, payload);
        toast.success('Quiz updated successfully!');
      } else {
        await axios.post('/api/quizzes', payload);
        toast.success('Quiz published successfully!');
      }
      navigate('/teacher');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save quiz.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/teacher')}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-extrabold text-white">
              {id ? 'Edit Quiz Arena' : 'Quiz Builder Studio'}
            </h1>
            <p className="text-xs text-slate-400">{questions.length} Questions configured</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setPreviewModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center space-x-1.5 transition-colors"
          >
            <Eye className="w-4 h-4 text-purple-400" />
            <span>Preview</span>
          </button>
          <button
            onClick={handleSaveQuiz}
            disabled={saving}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:brightness-110 text-white text-xs font-bold flex items-center space-x-2 shadow-lg shadow-purple-600/30 transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Publishing...' : 'Publish Arena'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left Questions List, Center Question Form, Right Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Questions Thumbnails (3 cols) */}
        <div className="lg:col-span-3 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Question Slides
            </span>
            <button
              onClick={handleAddQuestion}
              className="flex items-center space-x-1 text-xs text-purple-400 hover:text-purple-300 font-bold"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </div>

          <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-1">
            {questions.map((q, idx) => (
              <div
                key={idx}
                onClick={() => setSelectedQIndex(idx)}
                className={`p-3 rounded-2xl border text-left cursor-pointer transition-all flex items-start justify-between ${
                  selectedQIndex === idx
                    ? 'bg-purple-900/30 border-purple-500 shadow-md shadow-purple-500/10'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="space-y-1 overflow-hidden pr-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono font-bold text-purple-400">#{idx + 1}</span>
                    <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                      {q.questionType}
                    </span>
                  </div>
                  <p className="text-xs text-slate-200 font-medium truncate">
                    {q.questionText || 'Untitled Question'}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteQuestion(idx);
                  }}
                  className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            <button
              onClick={handleAddQuestion}
              className="w-full py-3 rounded-2xl border border-dashed border-slate-700 hover:border-purple-500/60 text-slate-400 hover:text-purple-300 text-xs font-bold flex items-center justify-center space-x-1.5 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Question</span>
            </button>
          </div>
        </div>

        {/* Center Column: Question Editor (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-5">
            {/* Question Type Selector */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">
                Question #{selectedQIndex + 1}
              </span>
              <select
                value={currentQ.questionType}
                onChange={(e) => updateCurrentQuestion({ questionType: e.target.value })}
                className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold text-white focus:outline-none focus:border-purple-500"
              >
                {QUESTION_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Question Text Prompt */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Question Prompt</label>
              <textarea
                rows={3}
                value={currentQ.questionText}
                onChange={(e) => updateCurrentQuestion({ questionText: e.target.value })}
                placeholder="Type your question prompt here..."
                className="w-full p-3 rounded-2xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 placeholder-slate-500"
              />
            </div>

            {/* Code Snippet Input (if code_based) */}
            {currentQ.questionType === 'code_based' && (
              <div className="space-y-2 p-3 rounded-2xl bg-slate-950 border border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-cyan-400 flex items-center">
                    <Code2 className="w-4 h-4 mr-1" />
                    Code Snippet (Syntax Box)
                  </span>
                  <select
                    value={currentQ.codeLanguage || 'javascript'}
                    onChange={(e) => updateCurrentQuestion({ codeLanguage: e.target.value })}
                    className="text-xs bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-300"
                  >
                    <option value="javascript">JavaScript</option>
                    <option value="python">Python</option>
                    <option value="java">Java</option>
                    <option value="cpp">C++</option>
                    <option value="html">HTML/CSS</option>
                  </select>
                </div>
                <textarea
                  rows={4}
                  value={currentQ.codeSnippet || ''}
                  onChange={(e) => updateCurrentQuestion({ codeSnippet: e.target.value })}
                  placeholder="// Paste or write code snippet here..."
                  className="w-full p-2.5 rounded-xl bg-slate-900 font-mono text-xs text-emerald-400 border border-slate-800 focus:outline-none focus:border-cyan-500"
                />
              </div>
            )}

            {/* Image URL Input (if image_based) */}
            {currentQ.questionType === 'image_based' && (
              <div className="space-y-2 p-3 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-xs font-bold text-amber-400 flex items-center">
                  <ImageIcon className="w-4 h-4 mr-1" />
                  Image URL / Diagram
                </span>
                <input
                  type="url"
                  value={currentQ.imageUrl || ''}
                  onChange={(e) => updateCurrentQuestion({ imageUrl: e.target.value })}
                  placeholder="https://example.com/diagram.png"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 text-xs text-white border border-slate-800 focus:outline-none focus:border-amber-500"
                />
                {currentQ.imageUrl && (
                  <img
                    src={currentQ.imageUrl}
                    alt="Preview"
                    className="max-h-40 rounded-xl object-contain mx-auto border border-slate-800"
                  />
                )}
              </div>
            )}

            {/* Answer Options for MCQ, True/False, Multiple Select, Code-based */}
            {['mcq', 'true_false', 'multiple_select', 'code_based', 'image_based', 'poll'].includes(
              currentQ.questionType
            ) && (
              <div className="space-y-2.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Answer Options & Correct Answer
                </label>
                <div className="space-y-2">
                  {(currentQ.options || []).map((opt, optIdx) => (
                    <div
                      key={opt.id || optIdx}
                      className="flex items-center space-x-2 p-2 rounded-2xl bg-slate-950 border border-slate-800"
                    >
                      <button
                        type="button"
                        onClick={() => handleCorrectOptionSelect(opt.id)}
                        className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all ${
                          opt.isCorrect || currentQ.correctAnswer === opt.id
                            ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30'
                            : 'bg-slate-900 text-slate-600 hover:text-slate-400 border border-slate-800'
                        }`}
                        title="Mark as correct answer"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <input
                        type="text"
                        value={opt.text}
                        onChange={(e) => handleOptionChange(optIdx, e.target.value)}
                        placeholder={`Option ${optIdx + 1}`}
                        className="flex-1 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-purple-500"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Fill in Blank / Short Answer */}
            {['fill_in_blank', 'short_answer'].includes(currentQ.questionType) && (
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-300">Accepted Correct Answer</label>
                <input
                  type="text"
                  value={currentQ.correctAnswer || ''}
                  onChange={(e) => updateCurrentQuestion({ correctAnswer: e.target.value })}
                  placeholder="e.g. fs or React.createElement"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            )}

            {/* Numerical Answer */}
            {currentQ.questionType === 'numerical' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Target Number</label>
                  <input
                    type="number"
                    value={currentQ.correctAnswer?.value ?? (currentQ.correctAnswer || '')}
                    onChange={(e) =>
                      updateCurrentQuestion({
                        correctAnswer: {
                          value: parseFloat(e.target.value),
                          tolerance: currentQ.correctAnswer?.tolerance || 0
                        }
                      })
                    }
                    placeholder="e.g. 42"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Allowed Tolerance (±)</label>
                  <input
                    type="number"
                    value={currentQ.correctAnswer?.tolerance || 0}
                    onChange={(e) =>
                      updateCurrentQuestion({
                        correctAnswer: {
                          value: currentQ.correctAnswer?.value || 0,
                          tolerance: parseFloat(e.target.value) || 0
                        }
                      })
                    }
                    placeholder="0"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>
            )}

            {/* Explanation */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Explanation (Shown after question closes)
              </label>
              <textarea
                rows={2}
                value={currentQ.explanation || ''}
                onChange={(e) => updateCurrentQuestion({ explanation: e.target.value })}
                placeholder="Explain why this is correct..."
                className="w-full p-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Quiz Settings & Rules (3 cols) */}
        <div className="lg:col-span-3 space-y-4">
          <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center">
              <Settings className="w-4 h-4 mr-1 text-purple-400" />
              Arena Metadata
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Quiz Title"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Subject</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Physics, CS"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Difficulty</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-purple-500 capitalize"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            <div className="pt-3 border-t border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Scoring Rules</h4>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Time Limit Per Question (sec)</label>
                <select
                  value={settings.timeLimitPerQuestion}
                  onChange={(e) => setSettings({ ...settings, timeLimitPerQuestion: parseInt(e.target.value) })}
                  className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                >
                  <option value={10}>10 Seconds (Speed)</option>
                  <option value={20}>20 Seconds</option>
                  <option value={30}>30 Seconds (Default)</option>
                  <option value={60}>60 Seconds</option>
                  <option value={90}>90 Seconds</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Negative Marking</label>
                <input
                  type="number"
                  value={settings.negativeMarking}
                  onChange={(e) => setSettings({ ...settings, negativeMarking: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                />
              </div>

              <div className="flex items-center justify-between text-xs text-slate-300">
                <span>Sound FX</span>
                <input
                  type="checkbox"
                  checked={settings.soundEffects}
                  onChange={(e) => setSettings({ ...settings, soundEffects: e.target.checked })}
                  className="w-4 h-4 accent-purple-600 rounded"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Live Preview Modal */}
      {previewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="max-w-2xl w-full bg-slate-900 border border-purple-500/40 rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                <h3 className="font-bold text-white">Student View Preview</h3>
              </div>
              <button
                onClick={() => setPreviewModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-4">
              <span className="text-xs font-mono font-bold text-purple-400 uppercase">
                Question {selectedQIndex + 1} of {questions.length} • {currentQ.points || 100} Points
              </span>
              <h2 className="text-xl font-bold text-white">{currentQ.questionText}</h2>

              {currentQ.codeSnippet && (
                <div className="text-left p-3 rounded-xl bg-slate-900 font-mono text-xs text-emerald-400 border border-slate-800">
                  <pre>{currentQ.codeSnippet}</pre>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 pt-2">
                {(currentQ.options || []).map((opt, i) => (
                  <div
                    key={opt.id || i}
                    className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-white font-semibold text-sm hover:border-purple-500 transition-colors"
                  >
                    {opt.text}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
