const Quiz = require('../models/Quiz');
const Question = require('../models/Question');

// @desc    Create a new quiz
// @route   POST /api/quizzes
// @access  Private (Teacher / Admin)
exports.createQuiz = async (req, res, next) => {
  try {
    const { title, description, subject, category, difficulty, settings, questions, scheduledFor, scheduledEnd } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, message: 'Quiz title is required.' });
    }

    const quiz = await Quiz.create({
      title,
      description,
      subject: subject || 'General',
      category: category || 'General Knowledge',
      difficulty: difficulty || 'medium',
      settings: settings || {},
      createdBy: req.user.id,
      scheduledFor: scheduledFor ? new Date(scheduledFor) : undefined,
      scheduledEnd: scheduledEnd ? new Date(scheduledEnd) : undefined,
      status: 'published'
    });

    // If initial questions array provided, create Question records and associate with quiz
    if (Array.isArray(questions) && questions.length > 0) {
      const createdQuestions = [];
      for (const q of questions) {
        const createdQ = await Question.create({
          ...q,
          quizId: quiz._id,
          createdBy: req.user.id
        });
        createdQuestions.push(createdQ._id);
      }
      quiz.questions = createdQuestions;
      await quiz.save();
    }

    const populatedQuiz = await Quiz.findById(quiz._id).populate('questions');

    res.status(201).json({
      success: true,
      message: 'Quiz created successfully.',
      quiz: populatedQuiz
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all quizzes (with filtering & search)
// @route   GET /api/quizzes
// @access  Public / Private
exports.getQuizzes = async (req, res, next) => {
  try {
    const { subject, difficulty, search, myQuizzes, limit = 20, page = 1 } = req.query;
    const filter = {};

    if (myQuizzes === 'true' && req.user) {
      filter.createdBy = req.user.id;
    } else {
      filter.status = { $ne: 'archived' };
    }

    if (subject && subject !== 'All') {
      filter.subject = new RegExp(subject, 'i');
    }

    if (difficulty && difficulty !== 'All') {
      filter.difficulty = difficulty.toLowerCase();
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Quiz.countDocuments(filter);
    const quizzes = await Quiz.find(filter)
      .populate('createdBy', 'name email avatar')
      .populate('questions')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      count: quizzes.length,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      quizzes
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single quiz by ID with full questions
// @route   GET /api/quizzes/:id
// @access  Public / Private
exports.getQuizById = async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.id)
      .populate('createdBy', 'name email avatar')
      .populate('questions');

    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found.' });
    }

    res.status(200).json({
      success: true,
      quiz
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update a quiz
// @route   PUT /api/quizzes/:id
// @access  Private (Owner / Admin)
exports.updateQuiz = async (req, res, next) => {
  try {
    let quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found.' });
    }

    if (quiz.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this quiz.' });
    }

    const { title, description, subject, category, difficulty, settings, scheduledFor, scheduledEnd, status } = req.body;

    if (title) quiz.title = title;
    if (description !== undefined) quiz.description = description;
    if (subject) quiz.subject = subject;
    if (category) quiz.category = category;
    if (difficulty) quiz.difficulty = difficulty;
    if (settings) quiz.settings = { ...quiz.settings, ...settings };
    if (scheduledFor !== undefined) quiz.scheduledFor = scheduledFor ? new Date(scheduledFor) : null;
    if (scheduledEnd !== undefined) quiz.scheduledEnd = scheduledEnd ? new Date(scheduledEnd) : null;
    if (status) quiz.status = status;

    await quiz.save();
    const updated = await Quiz.findById(quiz._id).populate('questions');

    res.status(200).json({
      success: true,
      message: 'Quiz updated successfully.',
      quiz: updated
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete a quiz
// @route   DELETE /api/quizzes/:id
// @access  Private (Owner / Admin)
exports.deleteQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found.' });
    }

    if (quiz.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this quiz.' });
    }

    // Cascade delete associated questions
    await Question.deleteMany({ quizId: quiz._id });
    await quiz.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Quiz and associated questions deleted successfully.'
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Duplicate an existing quiz for reuse
// @route   POST /api/quizzes/:id/duplicate
// @access  Private (Teacher / Admin)
exports.duplicateQuiz = async (req, res, next) => {
  try {
    const originalQuiz = await Quiz.findById(req.params.id).populate('questions');
    if (!originalQuiz) {
      return res.status(404).json({ success: false, message: 'Original quiz not found.' });
    }

    const newQuiz = await Quiz.create({
      title: `${originalQuiz.title} (Copy)`,
      description: originalQuiz.description,
      subject: originalQuiz.subject,
      category: originalQuiz.category,
      difficulty: originalQuiz.difficulty,
      settings: originalQuiz.settings,
      createdBy: req.user.id,
      status: 'draft'
    });

    const newQuestionIds = [];
    for (const q of originalQuiz.questions) {
      const clonedQ = await Question.create({
        quizId: newQuiz._id,
        questionText: q.questionText,
        questionType: q.questionType,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        points: q.points,
        timeLimit: q.timeLimit,
        codeSnippet: q.codeSnippet,
        language: q.language,
        imageUrl: q.imageUrl,
        difficulty: q.difficulty,
        subject: q.subject,
        tags: q.tags,
        createdBy: req.user.id
      });
      newQuestionIds.push(clonedQ._id);
    }

    newQuiz.questions = newQuestionIds;
    await newQuiz.save();

    const populated = await Quiz.findById(newQuiz._id).populate('questions');

    res.status(201).json({
      success: true,
      message: 'Quiz duplicated successfully.',
      quiz: populated
    });
  } catch (err) {
    next(err);
  }
};
