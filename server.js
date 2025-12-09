
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
    methods: ["GET", "POST", "PUT", "DELETE"]
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

const roomSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: String,
  type: { type: String, default: 'dm' }, // 'dm', 'group', 'global'
  participants: [String],
  updatedAt: Number,
  admins: [String]
});
const RoomModel = mongoose.model('Room', roomSchema);

// Updated Chat Schema for Full Features
const chatSchema = new mongoose.Schema({
  id: String,
  roomId: { type: String, required: true },
  senderId: String,
  message: String,
  timestamp: Number,
  type: { type: String, default: 'text' }, // 'text', 'image', 'file'
  mediaUrl: String, // Base64 or URL
  replyTo: { type: Object, default: null }, // Snapshot of quoted message
  reactions: { type: Map, of: [String], default: {} }, // emoji -> [userIds]
  readBy: [String] // List of users who read it
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
const onlineUsers = new Map(); // userId -> socketId

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join_app', (userId) => {
    onlineUsers.set(userId, socket.id);
    io.emit('online_users', Array.from(onlineUsers.keys()));
  });

  socket.on('join_room', (roomId) => {
    socket.join(roomId);
  });

  socket.on('leave_room', (roomId) => {
    socket.leave(roomId);
  });

  socket.on('typing', ({ roomId, userId }) => {
    socket.to(roomId).emit('user_typing', { roomId, userId });
  });

  socket.on('send_message', async (data) => {
    // data: { roomId, senderId, message, type, mediaUrl, replyTo, ... }
    const msgData = {
        ...data,
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        reactions: {},
        readBy: [data.senderId]
    };

    if (isDbConnected) {
      try {
        const newMsg = new ChatModel(msgData);
        await newMsg.save();
        
        // Update Room's updatedAt
        await RoomModel.findOneAndUpdate({ id: data.roomId }, { updatedAt: Date.now() });

        io.to(data.roomId).emit('receive_message', newMsg);
      } catch (e) {
        console.error("Error saving chat:", e);
      }
    } else {
        // Fallback
        io.to(data.roomId).emit('receive_message', msgData);
    }
  });

  socket.on('mark_read', async ({ roomId, messageIds, userId }) => {
      if (isDbConnected && messageIds.length > 0) {
          await ChatModel.updateMany(
              { id: { $in: messageIds } },
              { $addToSet: { readBy: userId } }
          );
      }
      io.to(roomId).emit('messages_read', { messageIds, userId });
  });

  socket.on('add_reaction', async ({ roomId, messageId, userId, emoji }) => {
      if (isDbConnected) {
          const msg = await ChatModel.findOne({ id: messageId });
          if (msg) {
             const current = msg.reactions.get(emoji) || [];
             if (!current.includes(userId)) {
                 current.push(userId);
                 msg.reactions.set(emoji, current);
                 await msg.save();
                 io.to(roomId).emit('reaction_update', { messageId, reactions: msg.reactions });
             }
          }
      }
  });

  socket.on('disconnect', () => {
    for (const [uid, sid] of onlineUsers.entries()) {
        if (sid === socket.id) {
            onlineUsers.delete(uid);
            break;
        }
    }
    io.emit('online_users', Array.from(onlineUsers.keys()));
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

// Portfolio API
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

app.get('/api/auth/users', async (req, res) => {
    if (!dbCheck(res)) return;
    try {
        const users = await UserModel.find({}, 'id');
        res.json(users);
    } catch(e) { res.status(500).json({error: e.message})}
});

// --- Chat API ---

// Create or Get DM Room
app.post('/api/chat/room/dm', async (req, res) => {
    if (!dbCheck(res)) return;
    try {
        const { participants } = req.body; // [id1, id2]
        participants.sort();
        const roomId = `dm-${participants.join('-')}`;
        
        let room = await RoomModel.findOne({ id: roomId });
        if (!room) {
            room = new RoomModel({
                id: roomId,
                type: 'dm',
                participants: participants,
                updatedAt: Date.now()
            });
            await room.save();
        }
        res.json(room);
    } catch (e) { res.status(500).json({error: e.message})}
});

// Create Group
app.post('/api/chat/room/group', async (req, res) => {
    if (!dbCheck(res)) return;
    try {
        const { name, participants, adminId } = req.body;
        const roomId = `group-${crypto.randomUUID()}`;
        const room = new RoomModel({
            id: roomId,
            name,
            type: 'group',
            participants: [...participants, adminId],
            admins: [adminId],
            updatedAt: Date.now()
        });
        await room.save();
        res.json(room);
    } catch (e) { res.status(500).json({error: e.message})}
});

// Get User Rooms
app.get('/api/chat/rooms/:userId', async (req, res) => {
    if (!dbCheck(res)) return;
    try {
        const userId = req.params.userId;
        // Find rooms where user is participant OR global room
        const rooms = await RoomModel.find({ 
            $or: [
                { participants: userId },
                { type: 'global' }
            ] 
        }).sort({ updatedAt: -1 });

        // Ensure global exists
        if (!rooms.some(r => r.id === 'global')) {
            const global = new RoomModel({ id: 'global', name: 'Global Chat', type: 'global', participants: [], updatedAt: Date.now() });
            await global.save();
            rooms.unshift(global);
        }

        // Attach last message
        const roomsWithMsg = await Promise.all(rooms.map(async (r) => {
            const lastMsg = await ChatModel.findOne({ roomId: r.id }).sort({ timestamp: -1 });
            return { ...r.toObject(), lastMessage: lastMsg };
        }));

        res.json(roomsWithMsg);
    } catch (e) { res.status(500).json({error: e.message})}
});

// Get Messages
app.get('/api/chat/messages/:roomId', async (req, res) => {
    if (!dbCheck(res)) return;
    try {
        const { roomId } = req.params;
        const limit = parseInt(req.query.limit) || 50;
        const messages = await ChatModel.find({ roomId }).sort({ timestamp: -1 }).limit(limit);
        res.json(messages.reverse());
    } catch (e) { res.status(500).json({error: e.message})}
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

app.post('/api/reports', async (req, res) => {
    if (!dbCheck(res)) return;
    try {
        const report = new ReportModel({ ...req.body, id: crypto.randomUUID(), timestamp: Date.now() });
        await report.save();
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/reports', async (req, res) => {
    if (!dbCheck(res)) return;
    try {
        const reports = await ReportModel.find().sort({ timestamp: -1 });
        res.json(reports);
    } catch(e) { res.status(500).json({ error: e.message }); }
});

// Static Files
const distPath = path.join(process.cwd(), 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
}

app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  const indexPath = path.join(distPath, 'index.html');
  if (fs.existsSync(indexPath)) res.sendFile(indexPath);
  else res.status(404).send('Frontend application not found.');
});

httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
