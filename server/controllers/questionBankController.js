const QuestionBank = require('../models/QuestionBank');
const Quiz = require('../models/Quiz');
const Question = require('../models/Question');

// @desc    Add a question to the question bank
// @route   POST /api/question-bank
// @access  Private (Teacher / Admin)
exports.addToQuestionBank = async (req, res, next) => {
  try {
    const question = await QuestionBank.create({
      ...req.body,
      createdBy: req.user.id
    });

    res.status(201).json({
      success: true,
      message: 'Question added to question bank.',
      question
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get questions from bank with search & filtering
// @route   GET /api/question-bank
// @access  Private (Teacher / Admin)
exports.getQuestionBank = async (req, res, next) => {
  try {
    const { subject, difficulty, questionType, search, page = 1, limit = 20 } = req.query;
    const filter = {
      $or: [{ createdBy: req.user.id }, { createdBy: { $exists: true } }]
    };

    if (subject && subject !== 'All') {
      filter.subject = new RegExp(subject, 'i');
    }
    if (difficulty && difficulty !== 'All') {
      filter.difficulty = difficulty.toLowerCase();
    }
    if (questionType && questionType !== 'All') {
      filter.questionType = questionType;
    }
    if (search) {
      filter.$or = [
        { questionText: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await QuestionBank.countDocuments(filter);
    const questions = await QuestionBank.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      count: questions.length,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      questions
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update a question in the bank
// @route   PUT /api/question-bank/:id
// @access  Private (Teacher / Admin)
exports.updateQuestionInBank = async (req, res, next) => {
  try {
    const question = await QuestionBank.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found in bank.' });
    }

    const updated = await QuestionBank.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({
      success: true,
      message: 'Question updated in question bank.',
      question: updated
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete a question from the bank
// @route   DELETE /api/question-bank/:id
// @access  Private (Teacher / Admin)
exports.deleteQuestionFromBank = async (req, res, next) => {
  try {
    await QuestionBank.findByIdAndDelete(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Question removed from question bank.'
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Copy questions from bank to an existing or new quiz
// @route   POST /api/question-bank/add-to-quiz
// @access  Private (Teacher / Admin)
exports.addBankQuestionsToQuiz = async (req, res, next) => {
  try {
    const { quizId, questionBankIds } = req.body;
    if (!quizId || !Array.isArray(questionBankIds) || questionBankIds.length === 0) {
      return res.status(400).json({ success: false, message: 'quizId and questionBankIds are required.' });
    }

    const bankQuestions = await QuestionBank.find({ _id: { $in: questionBankIds } });
    const newQuestionIds = [];

    for (const bq of bankQuestions) {
      const createdQ = await Question.create({
        quizId,
        questionText: bq.questionText,
        questionType: bq.questionType,
        options: bq.options,
        correctAnswer: bq.correctAnswer,
        explanation: bq.explanation,
        points: bq.points,
        timeLimit: bq.timeLimit,
        codeSnippet: bq.codeSnippet,
        language: bq.language,
        imageUrl: bq.imageUrl,
        difficulty: bq.difficulty,
        subject: bq.subject,
        tags: bq.tags,
        createdBy: req.user.id
      });
      newQuestionIds.push(createdQ._id);
      // Increment bank question usageCount
      bq.usageCount = (bq.usageCount || 0) + 1;
      await bq.save();
    }

    await Quiz.findByIdAndUpdate(quizId, {
      $push: { questions: { $each: newQuestionIds } }
    });

    res.status(200).json({
      success: true,
      message: `Successfully added ${newQuestionIds.length} questions to the quiz!`,
      addedCount: newQuestionIds.length
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Import questions from CSV text
// @route   POST /api/question-bank/import-csv
// @access  Private (Teacher / Admin)
exports.importQuestionsFromCSV = async (req, res, next) => {
  try {
    const { csvData, subject = 'General', difficulty = 'medium' } = req.body;
    if (!csvData) {
      return res.status(400).json({ success: false, message: 'CSV data is required.' });
    }

    const lines = csvData.trim().split('\n');
    if (lines.length < 2) {
      return res.status(400).json({ success: false, message: 'CSV must contain at least a header and one data row.' });
    }

    const importedQuestions = [];
    // Format: Question,OptionA,OptionB,OptionC,OptionD,CorrectOption(A/B/C/D),Explanation
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      const parts = line.split(',').map((p) => p.trim().replace(/^"|"$/g, ''));
      if (parts.length >= 6) {
        const [qText, optA, optB, optC, optD, correctLetter, explanation] = parts;
        const correctIndex = ['A', 'B', 'C', 'D'].indexOf((correctLetter || '').toUpperCase());

        const options = [
          { id: 'opt_1', text: optA, isCorrect: correctIndex === 0 },
          { id: 'opt_2', text: optB, isCorrect: correctIndex === 1 },
          { id: 'opt_3', text: optC, isCorrect: correctIndex === 2 },
          { id: 'opt_4', text: optD, isCorrect: correctIndex === 3 }
        ];

        const q = await QuestionBank.create({
          questionText: qText,
          questionType: 'mcq',
          options,
          correctAnswer: correctIndex >= 0 ? `opt_${correctIndex + 1}` : 'opt_1',
          explanation: explanation || '',
          difficulty: difficulty.toLowerCase(),
          subject,
          createdBy: req.user.id
        });
        importedQuestions.push(q);
      }
    }

    res.status(201).json({
      success: true,
      message: `Successfully imported ${importedQuestions.length} questions from CSV!`,
      count: importedQuestions.length
    });
  } catch (err) {
    next(err);
  }
};
