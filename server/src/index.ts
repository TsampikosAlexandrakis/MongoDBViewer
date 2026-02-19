import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import connectionRoutes from './routes/connection';
import databaseRoutes from './routes/databases';
import collectionRoutes from './routes/collections';
import documentRoutes from './routes/documents';
import indexRoutes from './routes/indexes';
import aggregationRoutes from './routes/aggregation';
import schemaRoutes from './routes/schema';
import authRoutes from './routes/auth';
import { requireAuth } from './middleware/auth';

dotenv.config();

// Startup guard: crash early if required env vars are missing or placeholder
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const JWT_SECRET = process.env.JWT_SECRET;

if (!ADMIN_PASSWORD || ADMIN_PASSWORD === 'change_me_to_something_strong') {
  console.error('ERROR: ADMIN_PASSWORD is not set or is still the placeholder value. Set it in .env');
  process.exit(1);
}
if (!JWT_SECRET || JWT_SECRET === 'replace_with_64_byte_random_hex_string') {
  console.error('ERROR: JWT_SECRET is not set or is still the placeholder value. Set it in .env');
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: process.env.ALLOWED_ORIGIN || 'http://localhost:5173',
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '10mb' }));

// Auth routes are public (no JWT required)
app.use('/api/auth', authRoutes);

// All /api routes below require a valid JWT
app.use('/api', requireAuth);

app.use('/api', connectionRoutes);
app.use('/api/databases', databaseRoutes);
app.use('/api/databases', collectionRoutes);
app.use('/api/databases', documentRoutes);
app.use('/api/databases', indexRoutes);
app.use('/api/databases', aggregationRoutes);
app.use('/api/databases', schemaRoutes);

// Serve client in production
const clientPath = path.join(__dirname, '..', 'client-dist');
app.use(express.static(clientPath));
app.get('*', (_req, res) => {
  res.sendFile(path.join(clientPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`MongoDB Viewer server running on port ${PORT}`);
});
