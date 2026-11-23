const mongoose = require('mongoose');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

let mongodProcess = null;

const startLocalMongo = () => {
  const possiblePaths = [
    'C:\\Program Files\\MongoDB\\Server\\8.3\\bin\\mongod.exe',
    'C:\\Program Files\\MongoDB\\Server\\8.0\\bin\\mongod.exe',
    'C:\\Program Files\\MongoDB\\Server\\7.0\\bin\\mongod.exe',
    'mongod'
  ];

  let execPath = null;
  for (const p of possiblePaths) {
    if (p === 'mongod' || fs.existsSync(p)) {
      execPath = p;
      break;
    }
  }

  if (!execPath) return null;

  const dbDir = path.join(process.cwd(), '.mongodata');
  if (!fs.existsSync(dbDir)) {
    try {
      fs.mkdirSync(dbDir, { recursive: true });
    } catch (e) {
      console.warn('Could not create db directory:', e.message);
    }
  }

  console.log(`[Database] Attempting to spawn local MongoDB instance from ${execPath}...`);
  try {
    mongodProcess = spawn(execPath, ['--dbpath', dbDir, '--port', '27017'], {
      detached: true,
      stdio: 'ignore'
    });
    mongodProcess.unref();
    return true;
  } catch (err) {
    console.warn('[Database] Failed to spawn mongod process:', err.message);
    return false;
  }
};

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/quizarena';

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000
    });
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (err) {
    console.warn(`[Database] Direct connection failed: ${err.message}`);
    if (uri.includes('127.0.0.1') || uri.includes('localhost')) {
      const started = startLocalMongo();
      if (started) {
        // Wait 2.5 seconds for mongod to bind port
        await new Promise((res) => setTimeout(res, 2500));
        try {
          const conn = await mongoose.connect(uri);
          console.log(`[Database] MongoDB Connected to local instance: ${conn.connection.host}`);
          return conn;
        } catch (retryErr) {
          console.error('[Database] Local MongoDB retry failed:', retryErr.message);
        }
      }
    }
    console.error('[Database] Please ensure MongoDB is running or provide a valid MONGODB_URI in server/.env');
  }
};

module.exports = connectDB;
