const mongoose = require('mongoose');

const questionBankSchema = new mongoose.Schema(
  {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    questionText: {
      type: String,
      required: true,
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
    options: [
      {
        id: String,
        text: String,
        isCorrect: Boolean,
        matchPair: String,
        imageUrl: String
      }
    ],
    correctAnswer: mongoose.Schema.Types.Mixed,
    explanation: { type: String, default: '' },
    points: { type: Number, default: 100 },
    timeLimit: { type: Number, default: 30 },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
    subject: { type: String, default: 'General' },
    category: { type: String, default: 'General' },
    codeSnippet: { type: String, default: '' },
    codeLanguage: { type: String, default: 'javascript' },
    imageUrl: { type: String, default: '' },
    tags: [{ type: String, trim: true }],
    usageCount: { type: Number, default: 0 }
  },
  {
    timestamps: true
  }
);

questionBankSchema.index({ createdBy: 1, subject: 1, difficulty: 1 });
questionBankSchema.index({ questionText: 'text', tags: 'text' }, { language_override: 'none' });

module.exports = mongoose.model('QuestionBank', questionBankSchema);
