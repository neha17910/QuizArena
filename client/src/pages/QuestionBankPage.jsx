import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { sounds } from '../utils/soundEffects';
import {
  BookOpen,
  Plus,
  Search,
  Upload,
  Trash2,
  Edit,
  CheckCircle2,
  Filter,
  Layers,
  ArrowRight,
  FileSpreadsheet
} from 'lucide-react';

export default function QuestionBankPage() {
  const [questions, setQuestions] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearchTerm] = useState('');
  const [subject, setSubject] = useState('All');
  const [difficulty, setDifficulty] = useState('All');

  const [selectedQuestionIds, setSelectedQuestionIds] = useState([]);
  const [targetQuizId, setTargetQuizId] = useState('');
  const [csvModalOpen, setCsvModalOpen] = useState(false);
  const [csvText, setCsvText] = useState('');

  const fetchBankData = async () => {
    try {
      setLoading(true);
      const [bankRes, quizRes] = await Promise.all([
        axios.get(`/api/question-bank?search=${search}&subject=${subject}&difficulty=${difficulty}`),
        axios.get('/api/quizzes?myQuizzes=true')
      ]);
      if (bankRes.data.success) {
        setQuestions(bankRes.data.questions);
      }
      if (quizRes.data.success) {
        setQuizzes(quizRes.data.quizzes);
        if (quizRes.data.quizzes.length > 0 && !targetQuizId) {
          setTargetQuizId(quizRes.data.quizzes[0]._id);
        }
      }
    } catch (err) {
      toast.error('Failed to load question bank.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBankData();
  }, [search, subject, difficulty]);

  const toggleSelect = (id) => {
    if (selectedQuestionIds.includes(id)) {
      setSelectedQuestionIds(selectedQuestionIds.filter((item) => item !== id));
    } else {
      setSelectedQuestionIds([...selectedQuestionIds, id]);
    }
  };

  const handleAddSelectedToQuiz = async () => {
    if (selectedQuestionIds.length === 0) {
      return toast.error('Please select at least one question.');
    }
    if (!targetQuizId) {
      return toast.error('Please select a target quiz.');
    }
    try {
      sounds.playClick();
      const res = await axios.post('/api/question-bank/add-to-quiz', {
        quizId: targetQuizId,
        questionBankIds: selectedQuestionIds
      });
      if (res.data.success) {
        toast.success(res.data.message);
        setSelectedQuestionIds([]);
      }
    } catch (err) {
      toast.error('Failed to add questions to quiz.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove question from repository?')) return;
    try {
      await axios.delete(`/api/question-bank/${id}`);
      toast.success('Question removed.');
      setQuestions(questions.filter((q) => q._id !== id));
    } catch (err) {
      toast.error('Failed to delete question.');
    }
  };

  const handleImportCSV = async (e) => {
    e.preventDefault();
    if (!csvText.trim()) return;
    try {
      sounds.playClick();
      const res = await axios.post('/api/question-bank/import-csv', {
        csvData: csvText,
        subject: 'General'
      });
      if (res.data.success) {
        toast.success(res.data.message);
        setCsvModalOpen(false);
        setCsvText('');
        fetchBankData();
      }
    } catch (err) {
      toast.error('Failed to import CSV.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900 border border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-white">Question Repository Bank</h1>
            <p className="text-xs text-slate-400">
              Reusable question library with search, filtering, and CSV bulk import
            </p>
          </div>
        </div>

        <button
          onClick={() => setCsvModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center space-x-2 border border-slate-700 transition-colors"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
          <span>Import CSV</span>
        </button>
      </div>

      {/* Action Toolbar: Add to Quiz bar if items selected */}
      {selectedQuestionIds.length > 0 && (
        <div className="p-4 rounded-2xl bg-purple-900/40 border border-purple-500/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-sm font-bold text-purple-300">
            {selectedQuestionIds.length} questions selected
          </span>
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <select
              value={targetQuizId}
              onChange={(e) => setTargetQuizId(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
            >
              {quizzes.map((qz) => (
                <option key={qz._id} value={qz._id}>
                  {qz.title}
                </option>
              ))}
            </select>
            <button
              onClick={handleAddSelectedToQuiz}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-colors"
            >
              Add to Selected Quiz
            </button>
          </div>
        </div>
      )}

      {/* Filter Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search questions by text or keyword..."
            value={search}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
          />
        </div>

        <select
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-purple-500"
        >
          <option value="All">All Subjects</option>
          <option value="Computer Science">Computer Science</option>
          <option value="Networking">Networking</option>
          <option value="Web Development">Web Development</option>
          <option value="General">General</option>
        </select>

        <select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
          className="px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-purple-500 capitalize"
        >
          <option value="All">All Difficulties</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
      </div>

      {/* Questions Grid */}
      {loading ? (
        <div className="py-12 text-center text-slate-400">Loading questions from bank...</div>
      ) : questions.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-slate-900/50 border border-slate-800 space-y-2">
          <BookOpen className="w-10 h-10 text-slate-600 mx-auto" />
          <p className="font-semibold text-white">No questions found</p>
          <p className="text-xs text-slate-400">Try adjusting your filters or import new questions.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {questions.map((q) => {
            const isSelected = selectedQuestionIds.includes(q._id);
            return (
              <div
                key={q._id}
                onClick={() => toggleSelect(q._id)}
                className={`p-5 rounded-2xl border text-left cursor-pointer transition-all space-y-3 ${
                  isSelected
                    ? 'bg-purple-950/30 border-purple-500 shadow-md shadow-purple-500/10'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                      className="w-4 h-4 accent-purple-600 rounded"
                    />
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-purple-500/10 text-purple-400">
                      {q.subject || 'General'}
                    </span>
                    <span className="text-xs capitalize px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                      {q.difficulty}
                    </span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(q._id);
                    }}
                    className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <p className="text-sm font-bold text-white line-clamp-2">{q.questionText}</p>

                <div className="grid grid-cols-2 gap-1.5 pt-1">
                  {(q.options || []).map((opt, i) => (
                    <div
                      key={i}
                      className={`text-[11px] p-2 rounded-lg truncate ${
                        opt.isCorrect || q.correctAnswer === opt.id
                          ? 'bg-emerald-950/40 text-emerald-400 font-bold border border-emerald-500/30'
                          : 'bg-slate-950 text-slate-400'
                      }`}
                    >
                      {opt.text}
                    </div>
                  ))}
                </div>

                {q.explanation && (
                  <p className="text-[11px] text-slate-400 italic">💡 {q.explanation}</p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* CSV Import Modal */}
      {csvModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="max-w-xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center">
              <FileSpreadsheet className="w-5 h-5 mr-2 text-emerald-400" />
              Import Questions via CSV
            </h3>
            <p className="text-xs text-slate-400">
              CSV Format Header: <br />
              <code className="text-purple-300">
                Question,OptionA,OptionB,OptionC,OptionD,CorrectOption(A/B/C/D),Explanation
              </code>
            </p>
            <textarea
              rows={6}
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              placeholder={`Question,OptionA,OptionB,OptionC,OptionD,CorrectOption,Explanation\nWhat is React?,A library,A fruit,A car,A planet,A,React is a UI library`}
              className="w-full p-3 rounded-xl bg-slate-950 font-mono text-xs text-slate-200 border border-slate-800 focus:outline-none focus:border-purple-500"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setCsvModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleImportCSV}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors"
              >
                Import Questions
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
