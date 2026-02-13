import { Router, Request, Response } from 'express';
import { mongoManager } from '../services/mongoClient';

const router = Router();

router.get('/:db/collections', async (req: Request, res: Response) => {
  try {
    const db = mongoManager.getDb(req.params.db);
    const collections = await db.listCollections().toArray();
    const result = await Promise.all(
      collections.map(async (col) => {
        try {
          const stats = await db.collection(col.name).estimatedDocumentCount();
          return { name: col.name, type: col.type, count: stats };
        } catch {
          return { name: col.name, type: col.type, count: 0 };
        }
      })
    );
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:db/collections', async (req: Request, res: Response) => {
  try {
    const db = mongoManager.getDb(req.params.db);
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Collection name is required' });
    }
    await db.createCollection(name);
    res.json({ success: true, message: `Collection '${name}' created` });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:db/collections/:col', async (req: Request, res: Response) => {
  try {
    const db = mongoManager.getDb(req.params.db);
    await db.collection(req.params.col).drop();
    res.json({ success: true, message: `Collection '${req.params.col}' dropped` });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
