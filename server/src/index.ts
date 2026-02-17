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

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

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
