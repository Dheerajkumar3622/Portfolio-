
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
app.use(express.json({ limit: '50mb' })); // Increased limit for base64 images

// MongoDB Connection Logic
const MONGODB_URI = process.env.MONGODB_URI;

let isDbConnected = false;

const connectDB = async () => {
    if (!MONGODB_URI) {
        console.warn("⚠️  MONGODB_URI is not defined. Database features will not work.");
        return;
    }

    try {
        await mongoose.connect(MONGODB_URI);
        isDbConnected = true;
        console.log('✅ Connected to MongoDB');
    } catch (err) {
        console.error('❌ MongoDB connection error:', err.message);
    }
};

connectDB();


// --- Schemas & Models ---

// User Schema
const userSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true }, // Username
  hashedPassword: { type: String, required: true }
});
const UserModel = mongoose.model('User', userSchema);

// Guestbook Schema
const guestbookSchema = new mongoose.Schema({
  id: String,
  userId: String,
  message: String,
  timestamp: Number,
  reactions: { type: Map, of: Number }
});
const GuestbookModel = mongoose.model('Guestbook', guestbookSchema);

// Lead Schema
const leadSchema = new mongoose.Schema({
  id: String,
  timestamp: Number,
  name: String,
  email: String,
  message: String
});
const LeadModel = mongoose.model('Lead', leadSchema);

// Report Schema
const reportSchema = new mongoose.Schema({
  id: String,
  timestamp: Number,
  messageId: String,
  messageContent: String,
  messageAuthor: String
});
const ReportModel = mongoose.model('Report', reportSchema);

// Portfolio Data Schema (Loose schema to accommodate nested objects easily)
const portfolioSchema = new mongoose.Schema({
  identifier: { type: String, default: 'main' }, // Singleton identifier
  data: { type: mongoose.Schema.Types.Mixed, required: true }
});
const PortfolioModel = mongoose.model('Portfolio', portfolioSchema);


// --- Helper for DB Safety ---
const dbCheck = (res) => {
    if (!isDbConnected) {
        res.status(503).json({ error: 'Database service unavailable' });
        return false;
    }
    return true;
};

// --- API Routes ---

// 1. Portfolio Routes
app.get('/api/portfolio', async (req, res) => {
  if (!dbCheck(res)) return;
  try {
    const portfolio = await PortfolioModel.findOne({ identifier: 'main' });
    if (portfolio) {
      res.json(portfolio.data);
    } else {
      res.json({}); // Return empty object if not initialized
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/portfolio', async (req, res) => {
  if (!dbCheck(res)) return;
  try {
    const newData = req.body;
    await PortfolioModel.findOneAndUpdate(
      { identifier: 'main' },
      { data: newData },
      { upsert: true, new: true }
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. Auth Routes
app.post('/api/auth/signup', async (req, res) => {
  if (!dbCheck(res)) return;
  try {
    const { id, hashedPassword } = req.body;
    const existing = await UserModel.findOne({ id });
    if (existing) {
      return res.status(400).json({ error: 'User already exists' });
    }
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
    const users = await UserModel.find({}, { hashedPassword: 0 }); // Exclude passwords
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

// 3. Guestbook Routes
app.get('/api/guestbook', async (req, res) => {
  if (!dbCheck(res)) return;
  try {
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;
    
    const entries = await GuestbookModel.find()
      .sort({ timestamp: -1 })
      .skip(offset)
      .limit(limit);
    
    res.json(entries);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/guestbook/newer', async (req, res) => {
  if (!dbCheck(res)) return;
  try {
    const timestamp = parseInt(req.query.timestamp) || 0;
    const entries = await GuestbookModel.find({ timestamp: { $gt: timestamp } })
      .sort({ timestamp: -1 });
    res.json(entries);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/guestbook', async (req, res) => {
  if (!dbCheck(res)) return;
  try {
    const entry = req.body;
    // Ensure ID and Timestamp are set
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

app.put('/api/guestbook/:id', async (req, res) => {
  if (!dbCheck(res)) return;
  try {
    await GuestbookModel.findOneAndUpdate({ id: req.params.id }, req.body);
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

// 4. Leads Routes
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
    const lead = req.body;
    const newLead = new LeadModel({
      ...lead,
      id: crypto.randomUUID(),
      timestamp: Date.now()
    });
    await newLead.save();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 5. Reports Routes
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
    const report = req.body;
    const newReport = new ReportModel({
      ...report,
      id: crypto.randomUUID(),
      timestamp: Date.now()
    });
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


// Serve static files in production
// Use process.cwd() for reliable path resolution on render
const distPath = path.join(process.cwd(), 'dist');

if (fs.existsSync(distPath)) {
  console.log(`📂 Serving static files from: ${distPath}`);
  app.use(express.static(distPath));
} else {
  console.warn(`⚠️  Dist folder not found at ${distPath}. Frontend will not be served.`);
}

// Catch-all route to serve React App for client-side routing
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  
  if (fs.existsSync(path.join(distPath, 'index.html'))) {
      res.sendFile(path.join(distPath, 'index.html'));
  } else {
      res.status(404).send('Frontend not built or index.html missing.');
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
