const mongoose = require('mongoose');

const optionSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  text: {
    type: String,
    required: true
  },
  isCorrect: {
    type: Boolean,
    default: false
  },
  matchPair: {
    type: String // For 'matching' question types (e.g., Left item matches Right item)
  },
  imageUrl: {
    type: String
  }
});

const questionSchema = new mongoose.Schema(
  {
    quizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quiz',
      required: false, // Can be standalone in QuestionBank
      index: true
    },
    questionText: {
      type: String,
      required: [true, 'Question text is required'],
      trim: true
    },
    questionType: {
      type: String,
      enum: [
        'mcq',
        'true_false',
        'multiple_select',
        'fill_in_blank',
        'short_answer',
        'image_based',
        'code_based',
        'poll',
        'matching',
        'numerical'
      ],
      default: 'mcq',
      required: true
    },
    options: [optionSchema],
    // Correct answer for various types:
    // mcq/true_false: option id or text
    // multiple_select: array of option ids
    // fill_in_blank/short_answer: string or array of accepted answers
    // numerical: number or { value: number, tolerance: number }
    // matching: array of { left: string, right: string }
    correctAnswer: {
      type: mongoose.Schema.Types.Mixed
    },
    explanation: {
      type: String,
      default: ''
    },
    points: {
      type: Number,
      default: 100,
      min: 10
    },
    timeLimit: {
      type: Number,
      default: 30, // seconds
      min: 5,
      max: 300
    },
    codeSnippet: {
      type: String,
      default: ''
    },
    codeLanguage: {
      type: String,
      default: 'javascript'
    },
    imageUrl: {
      type: String,
      default: ''
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium'
    },
    subject: {
      type: String,
      default: 'General'
    },
    tags: [
      {
        type: String,
        trim: true
      }
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Question', questionSchema);
