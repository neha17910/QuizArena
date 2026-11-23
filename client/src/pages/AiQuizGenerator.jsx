import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { sounds } from '../utils/soundEffects';
import {
  Sparkles,
  Zap,
  BookOpen,
  Sliders,
  Save,
  CheckCircle2,
  FileText,
  AlertCircle,
  Key,
  Layers,
  ArrowRight,
  Upload
} from 'lucide-react';

export default function AiQuizGenerator() {
  const navigate = useNavigate();

  const [topic, setTopic] = useState('');
  const [subject, setSubject] = useState('Computer Science');
  const [difficulty, setDifficulty] = useState('medium');
  const [numQuestions, setNumQuestions] = useState(5);
  const [questionType, setQuestionType] = useState('mcq');
  const [language, setLanguage] = useState('en');
  const [notes, setNotes] = useState('');
  const [customApiKey, setCustomApiKey] = useState('');

  const [loading, setLoading] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState([]);
  const [configNotice, setConfigNotice] = useState(null);

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    sounds.playClick();
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      if (text) {
        setNotes(String(text).substring(0, 5000));
        toast.success(`Loaded content from ${file.name}!`);
      }
    };
    reader.readAsText(file);
  };

  const handleGenerate = async (e, forceSmart = false) => {
    if (e) e.preventDefault();
    if (!topic && !notes) {
      return toast.error('Please specify a topic or paste reference notes.');
    }

    setLoading(true);
    setConfigNotice(null);
    sounds.playClick();

    try {
      const res = await axios.post('/api/ai/generate-quiz', {
        topic,
        subject,
        difficulty,
        numQuestions,
        questionType,
        language,
        notes,
        customApiKey: customApiKey.trim() || undefined,
        useSmartFallback: forceSmart
      });

      if (res.data.success && res.data.questions) {
        setGeneratedQuestions(res.data.questions);
        sounds.playCorrect();
        toast.success(`Generated ${res.data.questions.length} questions successfully!`);
      } else if (res.data.requiresApiKey) {
        setConfigNotice({
          message: res.data.message,
          sampleQuestions: res.data.sampleQuestions || []
        });
      }
    } catch (err) {
      toast.error('AI synthesis failed. Please check network or API key.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToQuiz = async () => {
    if (generatedQuestions.length === 0) return;
    try {
      sounds.playClick();
      const res = await axios.post('/api/quizzes', {
        title: `${topic || subject} AI Arena Challenge`,
        description: `Auto-generated assessment on ${topic} (${difficulty} difficulty).`,
        subject,
        difficulty,
        questions: generatedQuestions
      });

      if (res.data.success) {
        toast.success('Generated quiz saved and published to MongoDB!');
        navigate('/teacher');
      }
    } catch (err) {
      toast.error('Failed to save quiz.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-purple-900/60 via-indigo-900/40 to-slate-900 border border-purple-500/30">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-white">AI Quiz Synthesis Engine</h1>
            <p className="text-xs text-slate-300">
              Generate entire question banks and live assessments in seconds using Gemini or OpenAI
            </p>
          </div>
        </div>

        {generatedQuestions.length > 0 && (
          <button
            onClick={handleSaveToQuiz}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:brightness-110 text-white font-bold text-xs flex items-center space-x-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Save to My Quizzes ({generatedQuestions.length})</span>
          </button>
        )}
      </div>

      {/* Generator Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4">
          <h2 className="text-sm font-bold text-purple-400 uppercase tracking-wider flex items-center">
            <Sliders className="w-4 h-4 mr-1.5" />
            Prompt Parameters
          </h2>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Topic Name</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. React Hooks, Organic Chemistry"
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Subject</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Subject"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Difficulty</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white capitalize"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Question Count</label>
              <select
                value={numQuestions}
                onChange={(e) => setNumQuestions(parseInt(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
              >
                <option value={3}>3 Questions</option>
                <option value={5}>5 Questions</option>
                <option value={10}>10 Questions</option>
                <option value={15}>15 Questions</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
              >
                <option value="en">English</option>
                <option value="hi">Hindi (हिंदी)</option>
              </select>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-300">
                Notes / Syllabus / Textbook Chapter
              </label>
              <label className="text-xs text-purple-400 hover:text-purple-300 font-bold flex items-center space-x-1 cursor-pointer">
                <Upload className="w-3.5 h-3.5" />
                <span>Upload File</span>
                <input
                  type="file"
                  accept=".txt,.md,.json,.csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
            <textarea
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Paste lecture notes or upload a text file to auto-synthesize questions..."
              className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Optional API Key Input */}
          <div className="pt-2 border-t border-slate-800">
            <label className="block text-xs text-slate-400 mb-1 flex items-center">
              <Key className="w-3.5 h-3.5 mr-1 text-slate-500" />
              Custom Gemini / OpenAI Key (Optional)
            </label>
            <input
              type="password"
              value={customApiKey}
              onChange={(e) => setCustomApiKey(e.target.value)}
              placeholder="Loaded from server/.env if left blank"
              className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300"
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:brightness-110 text-white font-bold text-sm shadow-lg shadow-purple-600/30 active:scale-98 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate Questions</span>
              </>
            )}
          </button>
        </div>

        {/* Generated Questions List (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          {configNotice && (
            <div className="p-6 rounded-3xl bg-amber-950/40 border border-amber-500/40 space-y-3">
              <div className="flex items-center space-x-2 text-amber-400">
                <AlertCircle className="w-5 h-5" />
                <h3 className="font-bold text-sm">AI API Key Configuration Required</h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{configNotice.message}</p>
              <div className="flex flex-wrap gap-2 pt-2">
                <button
                  onClick={() => handleGenerate(null, true)}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-colors"
                >
                  Use Built-in Smart Curriculum Engine
                </button>
              </div>
            </div>
          )}

          {generatedQuestions.length === 0 && !configNotice && (
            <div className="p-12 text-center rounded-3xl bg-slate-900/60 border border-dashed border-slate-800 space-y-3">
              <Sparkles className="w-12 h-12 text-slate-600 mx-auto" />
              <h3 className="text-lg font-bold text-white">No questions generated yet</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Fill in the topic parameters on the left and click "Generate Questions".
              </p>
            </div>
          )}

          {generatedQuestions.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Generated Questions ({generatedQuestions.length})
                </span>
                <span className="text-xs text-emerald-400 font-semibold flex items-center">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                  Ready to Publish
                </span>
              </div>

              {generatedQuestions.map((q, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-purple-400">Question #{idx + 1}</span>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                      {q.questionType}
                    </span>
                  </div>

                  <p className="text-sm font-bold text-white">{q.questionText}</p>

                  {q.codeSnippet && (
                    <div className="p-2.5 rounded-xl bg-slate-950 font-mono text-xs text-emerald-400 border border-slate-800">
                      <pre>{q.codeSnippet}</pre>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    {(q.options || []).map((opt, i) => (
                      <div
                        key={i}
                        className={`p-2.5 rounded-xl text-xs font-medium border ${
                          opt.isCorrect || q.correctAnswer === opt.id
                            ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300 font-bold'
                            : 'bg-slate-950 border-slate-800 text-slate-400'
                        }`}
                      >
                        {opt.text}
                      </div>
                    ))}
                  </div>

                  {q.explanation && (
                    <p className="text-xs text-slate-400 italic pt-1 border-t border-slate-800/60">
                      💡 {q.explanation}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
