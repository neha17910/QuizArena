# ⚡ QuizArena – AI-Powered Live Quiz & Learning Platform

A production-ready, full-stack **MERN (MongoDB, Express, React, Node.js)** real-time multiplayer quiz and learning platform. Teachers can create and host live quizzes, students join using unique room PINs, answer synchronized timed questions, compete with classmates on animated live leaderboards, and view comprehensive performance analytics.

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js**: v18+ (tested on Node v25)
- **MongoDB**: Local MongoDB instance running on port `27017` or a MongoDB Atlas connection string.

### 2. Installation
Install all root, backend, and frontend dependencies:
```bash
npm run install:all
```
*(Or install inside `server` and `client` folders via `npm install --prefix server && npm install --prefix client`)*

### 3. Database Seeding (Pre-configured Quizzes & Accounts)
Pre-populate demo users (Admin, Teacher, Student), sample quizzes across all 10 question types, question bank, and a championship tournament:
```bash
npm run seed
```

### 4. Start Development Server
Start both backend (Express + Socket.IO on port 5000) and frontend (Vite React on port 5173) concurrently:
```bash
npm run dev
```

Open your browser at:
👉 **[http://localhost:5173](http://localhost:5173)**

---

## 🔑 Demo Login Credentials

For quick evaluation, click the **1-Click Demo Login** buttons on the login page or use:

| Role | Email | Password | Access Capabilities |
| :--- | :--- | :--- | :--- |
| **Teacher / Host** | `teacher@quizarena.com` | `Teacher@123456` | Create quizzes, AI generator, Host live rooms, View analytics |
| **Student / Player** | `student@quizarena.com` | `Student@123456` | Join rooms with PIN, view badges, level progression, review answers |
| **Admin** | `admin@quizarena.com` | `Admin@123456` | Governance, user management, quiz moderation |
| **Guest Player** | *No account needed* | *None* | Join directly from the homepage with any 6-digit room PIN |

---

## 🌟 Key Features

### 1. Real-Time Multiplayer Gameplay (Socket.IO)
- **Authoritative Server Timer**: Zero client-side clock drift; countdown synchronized across all connected devices.
- **Dynamic Scannable QR Code**: Host screen and Waiting Room render interactive QR codes so students can point their smartphone cameras and join instantly!
- **In-Game Power-Ups & Lifelines**:
  - ⚡ **50/50 Lifeline**: Automatically eliminates 2 incorrect options.
  - 🔥 **2X Points Booster**: Doubles points on correct answer.
  - ❄️ **Time Freeze**: Adds +5 seconds bonus buffer.
- **Rhythmic Suspense Battle BGM & Heartbeat**: Web Audio API rhythm that loops during live questions and accelerates heartbeat thump in the last 5 seconds.
- **Live Response Histogram**: Real-time bar distribution on the teacher's screen showing student picks across option colors.
- **Unique 6-Character Room Codes**: e.g., `QA8821` for instant joining without mandatory registration.
- **Dynamic Leaderboard & Podium**: Real-time rank animations, streak counters, speed bonuses, and Olympic-style 3D final podium with confetti.
- **Anti-Cheating & Fair Play**: Automatic detection of tab switches and browser blurring during active questions with real-time host alert toasts.

### 2. AI Capabilities & Study Modes
- **AI Socratic Tutor ("Ask AI Explainer")**: One-click interactive AI tutoring during answer review to explain misconceptions and memory tricks.
- **Interactive Flashcards Study Mode**: 3D flip card active recall deck with spaced repetition for every quiz.
- **Document & Notes File Reader**: Drag-and-drop `.txt`, `.md`, `.json`, or `.csv` files directly into the AI Quiz Generator.
- **Topic & Chapter Targeting**: Generate complete assessments from topics, subjects, difficulty, and languages (English & Hindi).
- **Smart Curriculum Engine**: Built-in fallback database for immediate testing without external API key.

### 3. Gamification & Campus Hall of Fame
- **Global Leaderboard (`/leaderboard`)**: Campus-wide Hall of Fame showcasing top scholars with 3D Olympic podium, levels, accuracy %, and max streaks.
- **Daily Practice Quests**: Daily streak tracker with +50 XP claim rewards.
- **Visual Performance Charts**: Built with Recharts (Score distributions, Accuracy pie chart, Question-wise difficulty).
- **Export Formats**: One-click **PDF Report Generation** (via `jspdf`) and **CSV Gradebook Export**.
- **Campus Tournaments**: Multi-round structured championships with downloadable verified certificates of achievement.

### 5. Accessibility & Design
- **Theme**: Dark Mode & Light Mode toggle.
- **Languages**: Full English & Hindi (हिंदी) interface translations.
- **Text-to-Speech (TTS)**: Built-in Web Speech API audio button reads question prompts aloud.
- **Web Audio API**: Synthesized sounds for countdown ticks, correct chimes, wrong buzzers, and victory fanfare without external assets.

---

## 📁 Project Structure

```
QuizArena/
├── client/                     # Vite + React 18 Frontend
│   ├── src/
│   │   ├── components/         # Navbar, Footer, ProtectedRoute
│   │   ├── context/            # AuthContext, ThemeContext, LanguageContext, SocketContext
│   │   ├── pages/              # Landing, Login, Register, Dashboards, Host, Room, Analytics
│   │   ├── utils/              # SoundEffects (Web Audio), Speech (Web Speech), helpers
│   │   ├── App.jsx             # React Router routing setup
│   │   ├── main.jsx            # Application root
│   │   └── index.css           # Tailwind base & glassmorphism utilities
│   ├── package.json
│   └── vite.config.js
│
├── server/                     # Node.js + Express + Socket.IO Backend
│   ├── config/                 # MongoDB connection & auto-spawn utility
│   ├── controllers/            # Auth, Quiz, Question, Session, Result, Analytics, AI
│   ├── middleware/             # JWT auth, role validation, error handler
│   ├── models/                 # User, Quiz, Question, Session, Answer, Result, Tournament
│   ├── routes/                 # REST API endpoints
│   ├── services/               # AI generation service (Gemini / OpenAI / Smart Fallback)
│   ├── sockets/                # quizSocket.js authoritative real-time state machine
│   ├── utils/                  # Scoring algorithms, seed.js demo seeder
│   ├── server.js               # Entry point
│   ├── package.json
│   └── .env
│
├── .env.example
├── package.json                # Root package.json with concurrent dev runner
└── README.md
```

---

## 🛠️ Environment Configuration

`server/.env`:
```env
PORT=5000
CLIENT_URL=http://localhost:5173
MONGODB_URI=mongodb://127.0.0.1:27017/quizarena
JWT_SECRET=quizarena_super_secret_jwt_key_2026_secure
JWT_EXPIRES_IN=7d

# Optional: Add your AI API key for live LLM generation
# GEMINI_API_KEY=your_gemini_api_key_here
# OPENAI_API_KEY=your_openai_api_key_here
```

---

## 🧪 Testing Multiplayer Locally in VS Code

1. Open **[http://localhost:5173/login](http://localhost:5173/login)** in your primary browser window.
2. Click **Teacher** 1-Click Demo Login and click **Host Live** on "Full Stack Web Mastery Challenge".
3. A unique 6-character room PIN (e.g. `QA9912`) will be created.
4. Open an **Incognito Window** or secondary browser tab at **[http://localhost:5173/join](http://localhost:5173/join)**.
5. Enter the PIN and nickname "SpeedyPlayer" and click **Enter Battle Arena**.
6. The host screen will immediately show the student connected in the lobby.
7. Click **Start Live Quiz** on the host screen to begin the synchronized countdown!
