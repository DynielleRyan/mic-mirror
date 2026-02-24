import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '5000', 10);
const MONGODB_URI = process.env.MONGODB_URI;

app.use(cors());
app.use(express.json());

if (MONGODB_URI) {
  mongoose.connect(MONGODB_URI).then(() => {
    console.log('📦 MongoDB connected');
  }).catch((err) => {
    console.warn('MongoDB connection skipped:', err.message);
  });
}

app.use(express.static(path.join(__dirname, 'client')));

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    message: 'Mic Mirror API running',
    mongodb: mongoose.connection.readyState === 1,
  });
});

app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'client/index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
