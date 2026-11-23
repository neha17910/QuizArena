require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Quiz = require('../models/Quiz');
const Question = require('../models/Question');
const QuestionBank = require('../models/QuestionBank');
const Tournament = require('../models/Tournament');
const connectDB = require('../config/db');

async function seedData() {
  await connectDB();
  console.log('[Seed] Dropping and cleaning old database...');
  await mongoose.connection.dropDatabase();

  console.log('[Seed] Creating demo users...');
  const salt = await bcrypt.genSalt(10);
  const adminPass = await bcrypt.hash('Admin@123456', salt);
  const teacherPass = await bcrypt.hash('Teacher@123456', salt);
  const studentPass = await bcrypt.hash('Student@123456', salt);

  const admin = await User.create({
    name: 'Admin Supervisor',
    email: 'admin@quizarena.com',
    passwordHash: adminPass,
    role: 'admin',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=AdminArena',
    preferences: { theme: 'dark', language: 'en', soundEffects: true },
    xp: 5000,
    level: 8
  });

  const teacher = await User.create({
    name: 'Prof. Evelyn Reed',
    email: 'teacher@quizarena.com',
    passwordHash: teacherPass,
    role: 'teacher',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=EvelynTeacher',
    preferences: { theme: 'dark', language: 'en', soundEffects: true },
    xp: 3200,
    level: 6
  });

  const student = await User.create({
    name: 'Alex Johnson',
    email: 'student@quizarena.com',
    passwordHash: studentPass,
    role: 'student',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=AlexStudent',
    preferences: { theme: 'dark', language: 'en', soundEffects: true },
    xp: 850,
    level: 3,
    badges: [
      { badgeType: 'first_quiz', name: 'First Quiz Completed', description: 'Finished your first arena battle!', icon: '🎯' },
      { badgeType: 'speed_master', name: 'Speed Master', description: 'Answered within 3 seconds accurately', icon: '⚡' }
    ],
    stats: {
      totalQuizzes: 4,
      totalScore: 2150,
      correctAnswers: 18,
      totalQuestionsAnswered: 20,
      accuracy: 90,
      currentStreak: 3,
      maxStreak: 6
    }
  });

  console.log('[Seed] Creating Quizzes with all 10 Question Types...');

  // Quiz 1: Full-Stack Web Development Challenge
  const quiz1 = await Quiz.create({
    title: 'Full Stack Web Mastery Challenge',
    description: 'Test your knowledge on React, Node.js, REST APIs, and asynchronous JavaScript fundamentals.',
    subject: 'Computer Science',
    category: 'Web Development',
    difficulty: 'medium',
    coverImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80',
    createdBy: teacher._id,
    settings: {
      timeLimitPerQuestion: 25,
      positiveMarking: 100,
      negativeMarking: 0,
      randomQuestionOrder: false,
      randomAnswerOrder: false,
      isPublic: true,
      showCorrectAnswers: true,
      enableLeaderboard: true,
      soundEffects: true
    },
    status: 'published'
  });

  const q1_1 = await Question.create({
    quizId: quiz1._id,
    questionText: 'Which React Hook should you use to run side-effects such as subscriptions or fetching data?',
    questionType: 'mcq',
    options: [
      { id: 'opt_1', text: 'useEffect', isCorrect: true },
      { id: 'opt_2', text: 'useState', isCorrect: false },
      { id: 'opt_3', text: 'useMemo', isCorrect: false },
      { id: 'opt_4', text: 'useContext', isCorrect: false }
    ],
    correctAnswer: 'opt_1',
    explanation: 'useEffect is specifically designated in React for invoking lifecycle side-effects.',
    points: 100,
    timeLimit: 25,
    difficulty: 'easy',
    subject: 'Computer Science',
    createdBy: teacher._id
  });

  const q1_2 = await Question.create({
    quizId: quiz1._id,
    questionText: 'What is the exact output of this asynchronous code snippet?',
    questionType: 'code_based',
    codeSnippet: 'console.log("A");\nsetTimeout(() => console.log("B"), 0);\nPromise.resolve().then(() => console.log("C"));\nconsole.log("D");',
    language: 'javascript',
    options: [
      { id: 'opt_1', text: 'A, D, C, B', isCorrect: true },
      { id: 'opt_2', text: 'A, B, C, D', isCorrect: false },
      { id: 'opt_3', text: 'A, D, B, C', isCorrect: false },
      { id: 'opt_4', text: 'A, C, D, B', isCorrect: false }
    ],
    correctAnswer: 'opt_1',
    explanation: 'Synchronous code runs first (A, D), then microtasks in Promise.resolve (C), and finally macrotasks in setTimeout (B).',
    points: 120,
    timeLimit: 30,
    difficulty: 'hard',
    subject: 'Computer Science',
    createdBy: teacher._id
  });

  const q1_3 = await Question.create({
    quizId: quiz1._id,
    questionText: 'HTTP/2 supports multiplexing over a single TCP connection.',
    questionType: 'true_false',
    options: [
      { id: 'opt_1', text: 'True', isCorrect: true },
      { id: 'opt_2', text: 'False', isCorrect: false }
    ],
    correctAnswer: 'opt_1',
    explanation: 'HTTP/2 introduced binary frames and stream multiplexing, eliminating head-of-line blocking on single connections.',
    points: 100,
    timeLimit: 20,
    difficulty: 'easy',
    subject: 'Computer Science',
    createdBy: teacher._id
  });

  const q1_4 = await Question.create({
    quizId: quiz1._id,
    questionText: 'Select ALL valid HTTP status codes indicating successful responses (2xx):',
    questionType: 'multiple_select',
    options: [
      { id: 'opt_1', text: '200 OK', isCorrect: true },
      { id: 'opt_2', text: '201 Created', isCorrect: true },
      { id: 'opt_3', text: '204 No Content', isCorrect: true },
      { id: 'opt_4', text: '304 Not Modified', isCorrect: false }
    ],
    correctAnswer: ['opt_1', 'opt_2', 'opt_3'],
    explanation: '200, 201, and 204 are 2xx Success codes. 304 is a 3xx Redirection code.',
    points: 150,
    timeLimit: 30,
    difficulty: 'medium',
    subject: 'Computer Science',
    createdBy: teacher._id
  });

  const q1_5 = await Question.create({
    quizId: quiz1._id,
    questionText: 'Fill in the blank: In Node.js, the built-in module used to handle filesystem operations is called _______.',
    questionType: 'fill_in_blank',
    correctAnswer: 'fs',
    explanation: 'The `fs` (File System) module provides asynchronous and synchronous file operations in Node.js.',
    points: 100,
    timeLimit: 25,
    difficulty: 'easy',
    subject: 'Computer Science',
    createdBy: teacher._id
  });

  quiz1.questions = [q1_1._id, q1_2._id, q1_3._id, q1_4._id, q1_5._id];
  await quiz1.save();

  // Quiz 2: Data Structures & Algorithms
  const quiz2 = await Quiz.create({
    title: 'Data Structures & Algorithms Sprint',
    description: 'Fast-paced algorithmic challenge featuring Big-O, Trees, Graphs, and Hash Tables.',
    subject: 'Computer Science',
    category: 'Algorithms',
    difficulty: 'hard',
    coverImage: 'https://images.unsplash.com/photo-1516116211227-bbc07efdb9d8?w=600&auto=format&fit=crop&q=80',
    createdBy: teacher._id,
    settings: {
      timeLimitPerQuestion: 30,
      positiveMarking: 100,
      negativeMarking: 25,
      isPublic: true,
      showCorrectAnswers: true,
      enableLeaderboard: true,
      soundEffects: true
    },
    status: 'published'
  });

  const q2_1 = await Question.create({
    quizId: quiz2._id,
    questionText: 'What is the average time complexity of searching in a Hash Table?',
    questionType: 'mcq',
    options: [
      { id: 'opt_1', text: 'O(1)', isCorrect: true },
      { id: 'opt_2', text: 'O(log n)', isCorrect: false },
      { id: 'opt_3', text: 'O(n)', isCorrect: false },
      { id: 'opt_4', text: 'O(n log n)', isCorrect: false }
    ],
    correctAnswer: 'opt_1',
    explanation: 'Hash tables offer O(1) constant time average lookup due to direct bucket indexing.',
    points: 100,
    timeLimit: 20,
    difficulty: 'easy',
    subject: 'Computer Science',
    createdBy: teacher._id
  });

  const q2_2 = await Question.create({
    quizId: quiz2._id,
    questionText: 'How many total edges are in a complete undirected graph with 5 vertices? (Enter numerical value)',
    questionType: 'numerical',
    correctAnswer: { value: 10, tolerance: 0 },
    explanation: 'Formula for complete graph edges is n*(n-1)/2. For n=5: 5*4/2 = 10 edges.',
    points: 120,
    timeLimit: 30,
    difficulty: 'medium',
    subject: 'Computer Science',
    createdBy: teacher._id
  });

  const q2_3 = await Question.create({
    quizId: quiz2._id,
    questionText: 'Which sorting algorithm is NOT in-place by default?',
    questionType: 'mcq',
    options: [
      { id: 'opt_1', text: 'Merge Sort', isCorrect: true },
      { id: 'opt_2', text: 'Quick Sort', isCorrect: false },
      { id: 'opt_3', text: 'Bubble Sort', isCorrect: false },
      { id: 'opt_4', text: 'Heap Sort', isCorrect: false }
    ],
    correctAnswer: 'opt_1',
    explanation: 'Standard Merge Sort requires O(n) auxiliary memory space to merge sub-arrays.',
    points: 100,
    timeLimit: 25,
    difficulty: 'medium',
    subject: 'Computer Science',
    createdBy: teacher._id
  });

  quiz2.questions = [q2_1._id, q2_2._id, q2_3._id];
  await quiz2.save();

  // Create QuestionBank items
  console.log('[Seed] Populating Question Bank...');
  await QuestionBank.create([
    {
      questionText: 'What is the role of the DNS server in computer networks?',
      questionType: 'mcq',
      options: [
        { id: 'opt_1', text: 'Translates domain names to IP addresses', isCorrect: true },
        { id: 'opt_2', text: 'Assigns MAC addresses to network interfaces', isCorrect: false },
        { id: 'opt_3', text: 'Encrypts HTTP traffic into HTTPS', isCorrect: false },
        { id: 'opt_4', text: 'Caches static web assets', isCorrect: false }
      ],
      correctAnswer: 'opt_1',
      explanation: 'DNS maps human-readable domain names (like google.com) to machine-readable IP addresses.',
      subject: 'Networking',
      difficulty: 'easy',
      createdBy: teacher._id
    },
    {
      questionText: 'Which CSS property is used to create a flex container?',
      questionType: 'mcq',
      options: [
        { id: 'opt_1', text: 'display: flex', isCorrect: true },
        { id: 'opt_2', text: 'flex-direction: row', isCorrect: false },
        { id: 'opt_3', text: 'position: flex', isCorrect: false },
        { id: 'opt_4', text: 'align-items: center', isCorrect: false }
      ],
      correctAnswer: 'opt_1',
      explanation: 'Setting display to flex initiates a flex formatting context.',
      subject: 'Web Development',
      difficulty: 'easy',
      createdBy: teacher._id
    }
  ]);

  // Create sample Tournament
  console.log('[Seed] Creating sample Tournament...');
  await Tournament.create({
    title: 'Inter-Collegiate Web Engineering Championship 2026',
    description: 'The ultimate 2-round showdown to crown the fastest and most accurate web developers.',
    organizerId: teacher._id,
    rules: 'Compete in Round 1 and Round 2. Total points determine final rank and golden certificate!',
    rounds: [
      {
        roundNumber: 1,
        name: 'Round 1: Full Stack Fundamentals',
        quizId: quiz1._id,
        scheduledAt: new Date(Date.now() + 86400000),
        status: 'upcoming'
      },
      {
        roundNumber: 2,
        name: 'Round 2: Algorithms & Data Structures Finale',
        quizId: quiz2._id,
        scheduledAt: new Date(Date.now() + 172800000),
        status: 'upcoming'
      }
    ],
    participants: [
      {
        userId: student._id,
        name: student.name,
        email: student.email,
        totalScore: 450,
        roundScores: [{ roundNumber: 1, score: 450, rank: 1 }]
      }
    ],
    status: 'upcoming'
  });

  console.log('[Seed] Database seeded successfully!');
  console.log('--- DEMO CREDENTIALS ---');
  console.log('Admin:   admin@quizarena.com   / Admin@123456');
  console.log('Teacher: teacher@quizarena.com / Teacher@123456');
  console.log('Student: student@quizarena.com / Student@123456');
  process.exit(0);
}

seedData().catch((err) => {
  console.error('[Seed] Failed:', err);
  process.exit(1);
});
