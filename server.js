
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// --- MongoDB Connection ---
const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URL || process.env.DATABASE_URL;

let isDbConnected = false;
let dbConnectionError = null;

const connectDB = async () => {
    if (!MONGODB_URI) {
        const msg = "⚠️  MONGODB_URI is missing. App running in OFFLINE mode (serving frontend, but data won't persist to DB).";
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

const guestbookSchema = new mongoose.Schema({
  id: String,
  userId: String,
  message: String,
  timestamp: Number,
  reactions: { type: Map, of: Number }
});
const GuestbookModel = mongoose.model('Guestbook', guestbookSchema);

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

// Health Check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        database: isDbConnected ? 'connected' : 'disconnected',
        error: dbConnectionError
    });
});

// Portfolio
app.get('/api/portfolio', async (req, res) => {
  if (!dbCheck(res)) return;
  try {
    const portfolio = await PortfolioModel.findOne({ identifier: 'main' });
    res.json(portfolio ? portfolio.data : {});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/portfolio', async (req, res) => {
  if (!dbCheck(res)) return;
  try {
    await PortfolioModel.findOneAndUpdate(
      { identifier: 'main' },
      { data: req.body },
      { upsert: true, new: true }
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Auth
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

app.put('/api/auth/user', async (req, res) => {
  if (!dbCheck(res)) return;
  try {
    const { id, hashedPassword } = req.body;
    await UserModel.findOneAndUpdate({ id }, { hashedPassword });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/auth/users', async (req, res) => {
  if (!dbCheck(res)) return;
  try {
    const users = await UserModel.find({}, { hashedPassword: 0 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/auth/user/:id', async (req, res) => {
  if (!dbCheck(res)) return;
  try {
    await UserModel.findOneAndDelete({ id: req.params.id });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Guestbook (Chat)
app.get('/api/guestbook', async (req, res) => {
  if (!dbCheck(res)) return;
  try {
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;
    const entries = await GuestbookModel.find().sort({ timestamp: -1 }).skip(offset).limit(limit);
    res.json(entries);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/guestbook/newer', async (req, res) => {
  if (!dbCheck(res)) return;
  try {
    const timestamp = parseInt(req.query.timestamp) || 0;
    const entries = await GuestbookModel.find({ timestamp: { $gt: timestamp } }).sort({ timestamp: -1 });
    res.json(entries);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/guestbook', async (req, res) => {
  if (!dbCheck(res)) return;
  try {
    const entry = req.body;
    const newEntry = new GuestbookModel({
      ...entry,
      id: entry.id || crypto.randomUUID(),
      timestamp: entry.timestamp || Date.now(),
      reactions: entry.reactions || {}
    });
    await newEntry.save();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/guestbook/:id', async (req, res) => {
  if (!dbCheck(res)) return;
  try {
    await GuestbookModel.findOneAndDelete({ id: req.params.id });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Leads & Reports
app.get('/api/leads', async (req, res) => {
  if (!dbCheck(res)) return;
  try {
    const leads = await LeadModel.find().sort({ timestamp: -1 });
    res.json(leads);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

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

app.get('/api/reports', async (req, res) => {
  if (!dbCheck(res)) return;
  try {
    const reports = await ReportModel.find().sort({ timestamp: -1 });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/reports', async (req, res) => {
  if (!dbCheck(res)) return;
  try {
    const newReport = new ReportModel({ ...req.body, id: crypto.randomUUID(), timestamp: Date.now() });
    await newReport.save();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/reports/:id', async (req, res) => {
  if (!dbCheck(res)) return;
  try {
    await ReportModel.findOneAndDelete({ id: req.params.id });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// --- Static Files ---
const distPath = path.join(process.cwd(), 'dist');

// Serve static assets
if (fs.existsSync(distPath)) {
  console.log(`📂 Serving static files from: ${distPath}`);
  app.use(express.static(distPath));
} else {
  console.warn(`⚠️  Dist folder not found. Please run 'npm run build'.`);
}

// Catch-all for SPA
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

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
