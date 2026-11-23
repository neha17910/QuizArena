const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema(
  {
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Session',
      required: true,
      index: true
    },
    quizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quiz',
      required: true,
      index: true
    },
    hostId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    playerId: {
      type: String,
      required: true,
      index: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true
    },
    playerName: {
      type: String,
      required: true
    },
    avatar: {
      type: String
    },
    isGuest: {
      type: Boolean,
      default: false
    },
    score: {
      type: Number,
      default: 0
    },
    correctAnswers: {
      type: Number,
      default: 0
    },
    totalQuestions: {
      type: Number,
      default: 0
    },
    accuracy: {
      type: Number,
      default: 0
    },
    rank: {
      type: Number,
      default: 1
    },
    streakMax: {
      type: Number,
      default: 0
    },
    awardedXP: {
      type: Number,
      default: 0
    },
    badgesEarned: [
      {
        type: String
      }
    ],
    detailedAnswers: [
      {
        questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
        questionText: String,
        questionType: String,
        submittedAnswer: mongoose.Schema.Types.Mixed,
        correctAnswer: mongoose.Schema.Types.Mixed,
        isCorrect: Boolean,
        responseTime: Number,
        awardedPoints: Number,
        explanation: String
      }
    ],
    completedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Result', resultSchema);
