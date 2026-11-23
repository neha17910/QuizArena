const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    badgeType: {
      type: String,
      required: true,
      enum: [
        'first_quiz',
        'perfect_score',
        'speed_master',
        'five_quiz_streak',
        'top_performer',
        'quiz_champion',
        'ai_creator',
        'tournament_hero'
      ]
    },
    name: {
      type: String,
      required: true
    },
    description: {
      type: String
    },
    icon: {
      type: String
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed
    },
    awardedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

achievementSchema.index({ userId: 1, badgeType: 1 }, { unique: true });

module.exports = mongoose.model('Achievement', achievementSchema);
