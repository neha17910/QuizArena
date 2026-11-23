const { generateQuizFromAI, explainAnswerWithAI } = require('../services/aiService');

// @desc    Generate quiz questions using AI
// @route   POST /api/ai/generate-quiz
// @access  Private (Teacher / Admin)
exports.generateQuiz = async (req, res, next) => {
  try {
    const {
      topic,
      subject,
      difficulty,
      numQuestions,
      questionType,
      language,
      notes,
      customApiKey,
      useSmartFallback
    } = req.body;

    if (!topic && !notes) {
      return res.status(400).json({
        success: false,
        message: 'Please provide either a topic name or paste notes to generate questions.'
      });
    }

    const result = await generateQuizFromAI({
      topic: topic || 'General Knowledge',
      subject: subject || 'General',
      difficulty: difficulty || 'medium',
      numQuestions: parseInt(numQuestions) || 5,
      questionType: questionType || 'mcq',
      language: language || 'en',
      notes: notes || '',
      customApiKey
    });

    if (result.success) {
      return res.status(200).json({
        success: true,
        source: result.source,
        questions: result.questions
      });
    }

    // If API key is missing, check if user requested smart fallback
    if (useSmartFallback && result.sampleQuestions) {
      return res.status(200).json({
        success: true,
        source: 'curriculum-engine',
        questions: result.sampleQuestions,
        message: 'Generated using QuizArena built-in Smart Curriculum Engine.'
      });
    }

    // Return configuration prompt as required by project specification
    return res.status(200).json({
      success: false,
      requiresApiKey: true,
      message: result.message,
      sampleQuestions: result.sampleQuestions
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Explain answer with AI Socratic tutor
// @route   POST /api/ai/explain-answer
// @access  Public / Private
exports.explainAnswer = async (req, res, next) => {
  try {
    const { questionText, submittedAnswer, correctAnswer, explanation, customApiKey } = req.body;
    if (!questionText) {
      return res.status(400).json({ success: false, message: 'Question text is required.' });
    }

    const result = await explainAnswerWithAI({
      questionText,
      submittedAnswer,
      correctAnswer,
      explanation,
      customApiKey
    });

    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};
