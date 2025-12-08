import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { createServer } from 'http';
import { Server } from 'socket.io';
import crypto from 'crypto';

dotenv.config();

const app = express();
const httpServer = createServer(app); // Wrap Express in HTTP server for Socket.io
const io = new Server(httpServer, {
  cors: {
    origin: "*", // Allow connections from any origin (simplify dev/prod)
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
// INCREASED LIMIT TO 200MB for handling base64 videos and images
app.use(express.json({ limit: '200mb' }));
app.use(express.urlencoded({ limit: '200mb', extended: true }));

// --- MongoDB Connection ---
const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URL || process.env.DATABASE_URL;

let isDbConnected = false;
let dbConnectionError = null;

const connectDB = async () => {
    if (!MONGODB_URI) {
        const msg = "⚠️  MONGODB_URI is missing. App running in OFFLINE mode.";
        console.warn(msg);
        dbConnectionError = "Environment variable MONGODB_URI is missing.";
        return;
    }

    try {
        await mongoose.connect(MONGODB_URI);
        isDbConnected = true;
        dbConnectionError = null;
        console.log('✅ Connected to MongoDB');
    } catch (err) {
        isDbConnected = false;
        dbConnectionError = err.message;
        console.error('❌ MongoDB connection error:', err.message);
    }
};

connectDB();

// --- Schemas & Models ---
const userSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  hashedPassword: { type: String, required: true }
});
const UserModel = mongoose.model('User', userSchema);

// Updated Chat Schema for Real-Time
const chatSchema = new mongoose.Schema({
  id: String,
  senderId: String,
  message: String,
  timestamp: Number,
  type: { type: String, default: 'public' }, // 'public' or 'private'
  receiverId: String // For private messages
});
const ChatModel = mongoose.model('Chat', chatSchema);

const leadSchema = new mongoose.Schema({
  id: String,
  timestamp: Number,
  name: String,
  email: String,
  message: String
});
const LeadModel = mongoose.model('Lead', leadSchema);

const reportSchema = new mongoose.Schema({
  id: String,
  timestamp: Number,
  messageId: String,
  messageContent: String,
  messageAuthor: String
});
const ReportModel = mongoose.model('Report', reportSchema);

const portfolioSchema = new mongoose.Schema({
  identifier: { type: String, default: 'main' },
  data: { type: mongoose.Schema.Types.Mixed, required: true }
});
const PortfolioModel = mongoose.model('Portfolio', portfolioSchema);

// --- Real-Time Chat Logic (Socket.io) ---
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join_chat', (userId) => {
    socket.join('public'); // Everyone joins public channel
    socket.join(userId);   // Join a private channel named after their ID
    io.to('public').emit('user_status', { userId, status: 'online' });
  });

  socket.on('send_message', async (data) => {
    // Save to DB
    if (isDbConnected) {
      try {
        const newMsg = new ChatModel({
          id: crypto.randomUUID(),
          senderId: data.senderId,
          message: data.message,
          timestamp: Date.now(),
          type: 'public'
        });
        await newMsg.save();
        // Broadcast to everyone in public
        io.to('public').emit('receive_message', newMsg);
      } catch (e) {
        console.error("Error saving chat:", e);
      }
    } else {
        // Fallback for offline mode (just echo back)
        io.to('public').emit('receive_message', { ...data, timestamp: Date.now(), id: crypto.randomUUID() });
    }
  });

  socket.on('typing', (data) => {
    socket.broadcast.to('public').emit('user_typing', data.userId);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});


// --- Helper: Check DB Status ---
const dbCheck = (res) => {
    if (!isDbConnected) {
        res.status(503).json({ 
            error: 'Database unavailable', 
            details: dbConnectionError || 'Unknown connection error'
        });
        return false;
    }
    return true;
};

// --- API Routes ---

app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        database: isDbConnected ? 'connected' : 'disconnected',
        error: dbConnectionError
    });
});

// Portfolio - Splitting Logic
app.get('/api/portfolio', async (req, res) => {
  if (!dbCheck(res)) return;
  try {
    const sections = ['profile', 'education', 'skills', 'projects', 'experience', 'memories', 'notes'];
    const results = await Promise.all(
        sections.map(sec => PortfolioModel.findOne({ identifier: `main_${sec}` }))
    );
    
    const fullPortfolio = {};
    let foundAny = false;

    sections.forEach((sec, index) => {
        if (results[index]) {
            fullPortfolio[sec] = results[index].data;
            foundAny = true;
        }
    });
    
    if (!foundAny) {
         const legacy = await PortfolioModel.findOne({ identifier: 'main' });
         if (legacy) return res.json(legacy.data);
    }

    res.json(fullPortfolio);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/portfolio', async (req, res) => {
  if (!dbCheck(res)) return;
  try {
    const fullData = req.body;
    const sections = ['profile', 'education', 'skills', 'projects', 'experience', 'memories', 'notes'];
    
    const operations = sections.map(section => {
        if (fullData[section]) {
            return PortfolioModel.findOneAndUpdate(
                { identifier: `main_${section}` },
                { data: fullData[section] },
                { upsert: true, new: true }
            );
        }
    });
    
    await Promise.all(operations);
    res.json({ success: true });
  } catch (error) {
    console.error("Save Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Auth Routes
app.post('/api/auth/signup', async (req, res) => {
  if (!dbCheck(res)) return;
  try {
    const { id, hashedPassword } = req.body;
    const existing = await UserModel.findOne({ id });
    if (existing) return res.status(400).json({ error: 'User already exists' });
    const newUser = new UserModel({ id, hashedPassword });
    await newUser.save();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/auth/user/:id', async (req, res) => {
  if (!dbCheck(res)) return;
  try {
    const user = await UserModel.findOne({ id: req.params.id });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Chat History API (Load previous messages)
app.get('/api/chat/history', async (req, res) => {
  if (!dbCheck(res)) return;
  try {
    const limit = 50;
    const messages = await ChatModel.find({ type: 'public' }).sort({ timestamp: -1 }).limit(limit);
    res.json(messages.reverse()); // Oldest first for chat flow
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Leads & Reports
app.post('/api/leads', async (req, res) => {
  if (!dbCheck(res)) return;
  try {
    const newLead = new LeadModel({ ...req.body, id: crypto.randomUUID(), timestamp: Date.now() });
    await newLead.save();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/leads', async (req, res) => {
    if (!dbCheck(res)) return;
    try {
        const leads = await LeadModel.find().sort({ timestamp: -1 });
        res.json(leads);
    } catch(e) { res.status(500).json({error: e.message}) }
});

// --- Static Files ---
const distPath = path.join(process.cwd(), 'dist');

if (fs.existsSync(distPath)) {
  console.log(`📂 Serving static files from: ${distPath}`);
  app.use(express.static(distPath));
}

app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  const indexPath = path.join(distPath, 'index.html');
  if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
  } else {
      res.status(404).send('Frontend application not found. Ensure build was successful.');
  }
});

// Use httpServer.listen instead of app.listen for Socket.io
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
});