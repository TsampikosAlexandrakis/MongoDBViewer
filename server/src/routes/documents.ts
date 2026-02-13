import { Router, Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import { mongoManager } from '../services/mongoClient';

const router = Router();

router.get('/:db/collections/:col/documents', async (req: Request, res: Response) => {
  try {
    const db = mongoManager.getDb(req.params.db);
    const collection = db.collection(req.params.col);

    const filter = req.query.filter ? JSON.parse(req.query.filter as string) : {};
    const sort = req.query.sort ? JSON.parse(req.query.sort as string) : {};
    const projection = req.query.projection ? JSON.parse(req.query.projection as string) : {};
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const skip = (page - 1) * limit;

    const [documents, total] = await Promise.all([
      collection.find(filter, { projection }).sort(sort).skip(skip).limit(limit).toArray(),
      collection.countDocuments(filter),
    ]);

    res.json({
      documents,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:db/collections/:col/documents', async (req: Request, res: Response) => {
  try {
    const db = mongoManager.getDb(req.params.db);
    const collection = db.collection(req.params.col);
    const result = await collection.insertOne(req.body);
    res.json({ success: true, insertedId: result.insertedId });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:db/collections/:col/documents/:id', async (req: Request, res: Response) => {
  try {
    const db = mongoManager.getDb(req.params.db);
    const collection = db.collection(req.params.col);
    const { _id, ...updateData } = req.body;

    let filter: any;
    try {
      filter = { _id: new ObjectId(req.params.id) };
    } catch {
      filter = { _id: req.params.id };
    }

    const result = await collection.replaceOne(filter, updateData);
    res.json({ success: true, modifiedCount: result.modifiedCount });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:db/collections/:col/documents/:id', async (req: Request, res: Response) => {
  try {
    const db = mongoManager.getDb(req.params.db);
    const collection = db.collection(req.params.col);

    let filter: any;
    try {
      filter = { _id: new ObjectId(req.params.id) };
    } catch {
      filter = { _id: req.params.id };
    }

    const result = await collection.deleteOne(filter);
    res.json({ success: true, deletedCount: result.deletedCount });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
