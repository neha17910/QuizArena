const mongoose = require('mongoose');

const sessionParticipantSchema = new mongoose.Schema({
  socketId: { type: String },
  playerId: { type: String, required: true }, // Persistent UUID / token per player session
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  name: { type: String, required: true, trim: true },
  avatar: { type: String, default: 'https://api.dicebear.com/7.x/bottts/svg?seed=Guest' },
  isGuest: { type: Boolean, default: false },
  score: { type: Number, default: 0 },
  streak: { type: Number, default: 0 },
  maxStreak: { type: Number, default: 0 },
  correctCount: { type: Number, default: 0 },
  tabSwitches: { type: Number, default: 0 },
  isConnected: { type: Boolean, default: true },
  joinedAt: { type: Date, default: Date.now }
});

const sessionSchema = new mongoose.Schema(
  {
    quizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quiz',
      required: true
    },
    hostId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    roomCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true
    },
    status: {
      type: String,
      enum: ['waiting', 'active', 'question_active', 'question_ended', 'completed', 'cancelled'],
      default: 'waiting',
      index: true
    },
    participants: [sessionParticipantSchema],
    currentQuestionIndex: {
      type: Number,
      default: 0
    },
    questionStartTime: {
      type: Date
    },
    questionEndTime: {
      type: Date
    },
    totalQuestions: {
      type: Number,
      default: 0
    },
    settings: {
      timeLimitPerQuestion: { type: Number, default: 30 },
      positiveMarking: { type: Number, default: 100 },
      negativeMarking: { type: Number, default: 0 },
      showCorrectAnswers: { type: Boolean, default: true },
      enableLeaderboard: { type: Boolean, default: true },
      soundEffects: { type: Boolean, default: true }
    },
    startedAt: {
      type: Date
    },
    endedAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Session', sessionSchema);
