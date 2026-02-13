import { Router, Request, Response } from 'express';
import { mongoManager } from '../services/mongoClient';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  try {
    const client = mongoManager.getClient();
    const adminDb = client.db('admin');
    const result = await adminDb.admin().listDatabases();
    res.json(result.databases);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:db/stats', async (req: Request, res: Response) => {
  try {
    const db = mongoManager.getDb(req.params.db);
    const stats = await db.stats();
    res.json(stats);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
