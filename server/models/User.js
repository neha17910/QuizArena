const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide your name'],
      trim: true,
      maxlength: [50, 'Name cannot exceed 50 characters']
    },
    email: {
      type: String,
      required: [true, 'Please provide an email address'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
    },
    passwordHash: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 6,
      select: false
    },
    role: {
      type: String,
      enum: ['admin', 'teacher', 'student'],
      default: 'student'
    },
    avatar: {
      type: String,
      default: 'https://api.dicebear.com/7.x/bottts/svg?seed=QuizArena'
    },
    preferences: {
      theme: {
        type: String,
        enum: ['dark', 'light'],
        default: 'dark'
      },
      language: {
        type: String,
        enum: ['en', 'hi'],
        default: 'en'
      },
      soundEffects: {
        type: Boolean,
        default: true
      }
    },
    xp: {
      type: Number,
      default: 0
    },
    level: {
      type: Number,
      default: 1
    },
    stats: {
      totalQuizzes: { type: Number, default: 0 },
      totalScore: { type: Number, default: 0 },
      correctAnswers: { type: Number, default: 0 },
      totalQuestionsAnswered: { type: Number, default: 0 },
      accuracy: { type: Number, default: 0 },
      currentStreak: { type: Number, default: 0 },
      maxStreak: { type: Number, default: 0 }
    },
    badges: [
      {
        badgeType: { type: String, required: true },
        name: { type: String, required: true },
        description: { type: String },
        icon: { type: String },
        awardedAt: { type: Date, default: Date.now }
      }
    ],
    status: {
      type: String,
      enum: ['active', 'suspended'],
      default: 'active'
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date
  },
  {
    timestamps: true
  }
);

// Method to compare candidate password with passwordHash
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.passwordHash);
};

// Method to generate JWT token
userSchema.methods.generateAuthToken = function () {
  return jwt.sign(
    { id: this._id, role: this.role, name: this.name, email: this.email },
    process.env.JWT_SECRET || 'quizarena_super_secret_jwt_key_2026_secure',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// Calculate level automatically based on XP
userSchema.methods.addXP = function (amount) {
  this.xp += amount;
  // Level threshold formula: level = Math.floor(Math.sqrt(xp / 100)) + 1
  this.level = Math.floor(Math.sqrt(this.xp / 100)) + 1;
};

module.exports = mongoose.model('User', userSchema);
