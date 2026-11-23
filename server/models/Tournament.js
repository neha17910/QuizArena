const mongoose = require('mongoose');

const tournamentRoundSchema = new mongoose.Schema({
  roundNumber: { type: Number, required: true },
  name: { type: String, default: 'Round' },
  quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
  scheduledAt: { type: Date },
  status: { type: String, enum: ['upcoming', 'active', 'completed'], default: 'upcoming' },
  sessionCode: { type: String, default: '' },
  winner: { type: String, default: '' }
});

const tournamentParticipantSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: { type: String, required: true },
  email: { type: String },
  totalScore: { type: Number, default: 0 },
  roundScores: [
    {
      roundNumber: Number,
      score: Number,
      rank: Number
    }
  ],
  registeredAt: { type: Date, default: Date.now }
});

const tournamentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Tournament title is required'],
      trim: true
    },
    description: {
      type: String,
      default: ''
    },
    organizerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    bannerImage: {
      type: String,
      default: ''
    },
    rounds: [tournamentRoundSchema],
    participants: [tournamentParticipantSchema],
    status: {
      type: String,
      enum: ['upcoming', 'ongoing', 'completed'],
      default: 'upcoming'
    },
    rules: {
      type: String,
      default: 'Compete in all rounds. Cumulative highest score takes the championship trophy!'
    },
    startDate: {
      type: Date
    },
    endDate: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Tournament', tournamentSchema);
