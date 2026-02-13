import { Router, Request, Response } from 'express';
import { mongoManager } from '../services/mongoClient';

const router = Router();

interface FieldInfo {
  types: Record<string, number>;
  count: number;
  children?: Record<string, FieldInfo>;
}

function analyzeValue(value: any): string {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  if (value instanceof Date) return 'date';
  if (typeof value === 'object' && value.constructor?.name === 'ObjectId') return 'ObjectId';
  return typeof value;
}

function analyzeDocument(doc: any, schema: Record<string, FieldInfo>, prefix: string = '') {
  for (const [key, value] of Object.entries(doc)) {
    const fieldPath = prefix ? `${prefix}.${key}` : key;
    if (!schema[fieldPath]) {
      schema[fieldPath] = { types: {}, count: 0 };
    }
    const field = schema[fieldPath];
    const type = analyzeValue(value);
    field.types[type] = (field.types[type] || 0) + 1;
    field.count++;

    if (type === 'object' && value !== null) {
      analyzeDocument(value, schema, fieldPath);
    }
  }
}

router.get('/:db/collections/:col/schema', async (req: Request, res: Response) => {
  try {
    const db = mongoManager.getDb(req.params.db);
    const collection = db.collection(req.params.col);
    const sampleSize = Math.min(parseInt(req.query.sample as string) || 1000, 5000);

    const documents = await collection.aggregate([{ $sample: { size: sampleSize } }]).toArray();
    const schema: Record<string, FieldInfo> = {};

    for (const doc of documents) {
      analyzeDocument(doc, schema);
    }

    const fields = Object.entries(schema).map(([path, info]) => ({
      path,
      types: Object.entries(info.types).map(([type, count]) => ({
        type,
        count,
        percentage: Math.round((count / documents.length) * 100),
      })),
      totalCount: info.count,
      probability: Math.round((info.count / documents.length) * 100),
    }));

    fields.sort((a, b) => a.path.localeCompare(b.path));

    res.json({ fields, sampleSize: documents.length });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
