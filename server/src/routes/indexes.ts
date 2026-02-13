import { Router, Request, Response } from 'express';
import { mongoManager } from '../services/mongoClient';

const router = Router();

router.get('/:db/collections/:col/indexes', async (req: Request, res: Response) => {
  try {
    const db = mongoManager.getDb(req.params.db);
    const collection = db.collection(req.params.col);
    const indexes = await collection.indexes();
    res.json(indexes);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:db/collections/:col/indexes', async (req: Request, res: Response) => {
  try {
    const db = mongoManager.getDb(req.params.db);
    const collection = db.collection(req.params.col);
    const { keys, options } = req.body;
    if (!keys) {
      return res.status(400).json({ error: 'Index keys are required' });
    }
    const result = await collection.createIndex(keys, options || {});
    res.json({ success: true, indexName: result });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:db/collections/:col/indexes/:name', async (req: Request, res: Response) => {
  try {
    const db = mongoManager.getDb(req.params.db);
    const collection = db.collection(req.params.col);
    await collection.dropIndex(req.params.name);
    res.json({ success: true, message: `Index '${req.params.name}' dropped` });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
