import { Router, Request, Response } from 'express';
import { mongoManager } from '../services/mongoClient';

const router = Router();

router.post('/:db/collections/:col/aggregate', async (req: Request, res: Response) => {
  try {
    const db = mongoManager.getDb(req.params.db);
    const collection = db.collection(req.params.col);
    const { pipeline } = req.body;

    if (!Array.isArray(pipeline)) {
      return res.status(400).json({ error: 'Pipeline must be an array of stages' });
    }

    const results = await collection.aggregate(pipeline).toArray();
    res.json({ results, count: results.length });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
