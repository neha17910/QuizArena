const Question = require('../models/Question');
const Quiz = require('../models/Quiz');

// @desc    Add a question to a quiz
// @route   POST /api/questions
// @access  Private (Teacher / Admin)
exports.addQuestion = async (req, res, next) => {
  try {
    const {
      quizId,
      questionText,
      questionType,
      options,
      correctAnswer,
      explanation,
      points,
      timeLimit,
      codeSnippet,
      language,
      imageUrl,
      difficulty,
      subject,
      tags
    } = req.body;

    if (!questionText) {
      return res.status(400).json({ success: false, message: 'Question text is required.' });
    }

    const question = await Question.create({
      quizId,
      questionText,
      questionType: questionType || 'mcq',
      options: options || [],
      correctAnswer,
      explanation: explanation || '',
      points: points || 100,
      timeLimit: timeLimit || 30,
      codeSnippet: codeSnippet || '',
      language: language || 'javascript',
      imageUrl: imageUrl || '',
      difficulty: difficulty || 'medium',
      subject: subject || 'General',
      tags: tags || [],
      createdBy: req.user.id
    });

    if (quizId) {
      await Quiz.findByIdAndUpdate(quizId, {
        $push: { questions: question._id }
      });
    }

    res.status(201).json({
      success: true,
      message: 'Question created successfully.',
      question
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update a question
// @route   PUT /api/questions/:id
// @access  Private (Teacher / Admin)
exports.updateQuestion = async (req, res, next) => {
  try {
    let question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found.' });
    }

    const updated = await Question.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      message: 'Question updated successfully.',
      question: updated
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete a question
// @route   DELETE /api/questions/:id
// @access  Private (Teacher / Admin)
exports.deleteQuestion = async (req, res, next) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found.' });
    }

    if (question.quizId) {
      await Quiz.findByIdAndUpdate(question.quizId, {
        $pull: { questions: question._id }
      });
    }

    await question.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Question deleted successfully.'
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Bulk add questions to a quiz
// @route   POST /api/questions/bulk
// @access  Private (Teacher / Admin)
exports.bulkAddQuestions = async (req, res, next) => {
  try {
    const { quizId, questions } = req.body;
    if (!quizId || !Array.isArray(questions)) {
      return res.status(400).json({ success: false, message: 'QuizId and questions array are required.' });
    }

    const insertedIds = [];
    for (const q of questions) {
      const createdQ = await Question.create({
        ...q,
        quizId,
        createdBy: req.user.id
      });
      insertedIds.push(createdQ._id);
    }

    await Quiz.findByIdAndUpdate(quizId, {
      $push: { questions: { $each: insertedIds } }
    });

    res.status(201).json({
      success: true,
      message: `Successfully added ${insertedIds.length} questions to quiz.`,
      questionIds: insertedIds
    });
  } catch (err) {
    next(err);
  }
};
