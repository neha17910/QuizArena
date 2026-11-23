const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Quiz title is required'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters']
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    subject: {
      type: String,
      required: true,
      default: 'General'
    },
    category: {
      type: String,
      default: 'General Knowledge'
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium'
    },
    coverImage: {
      type: String,
      default: ''
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    questions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question'
      }
    ],
    settings: {
      timeLimitPerQuestion: { type: Number, default: 30 },
      positiveMarking: { type: Number, default: 100 },
      negativeMarking: { type: Number, default: 0 },
      randomQuestionOrder: { type: Boolean, default: false },
      randomAnswerOrder: { type: Boolean, default: false },
      isPublic: { type: Boolean, default: true },
      showCorrectAnswers: { type: Boolean, default: true },
      enableLeaderboard: { type: Boolean, default: true },
      soundEffects: { type: Boolean, default: true }
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'published'
    },
    scheduledFor: {
      type: Date
    },
    scheduledEnd: {
      type: Date
    },
    playCount: {
      type: Number,
      default: 0
    },
    averageScore: {
      type: Number,
      default: 0
    },
    tags: [
      {
        type: String,
        trim: true
      }
    ]
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Quiz', quizSchema);
