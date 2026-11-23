const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema(
  {
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Session',
      required: true,
      index: true
    },
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question',
      required: true
    },
    questionIndex: {
      type: Number,
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
      default: null
    },
    playerName: {
      type: String,
      required: true
    },
    submittedAnswer: {
      type: mongoose.Schema.Types.Mixed
    },
    isCorrect: {
      type: Boolean,
      default: false
    },
    responseTime: {
      type: Number, // in seconds (fractional)
      default: 0
    },
    awardedPoints: {
      type: Number,
      default: 0
    },
    streak: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

// Prevent duplicate answers for the same player, session, and question
answerSchema.index({ sessionId: 1, questionId: 1, playerId: 1 }, { unique: true });

module.exports = mongoose.model('Answer', answerSchema);
