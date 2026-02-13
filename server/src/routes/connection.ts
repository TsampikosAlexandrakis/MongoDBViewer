import { Router, Request, Response } from 'express';
import { mongoManager } from '../services/mongoClient';

const router = Router();

router.post('/connect', async (req: Request, res: Response) => {
  try {
    const { uri } = req.body;
    if (!uri) {
      return res.status(400).json({ error: 'Connection URI is required' });
    }
    await mongoManager.connect(uri);
    res.json({ success: true, message: 'Connected successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/disconnect', async (_req: Request, res: Response) => {
  try {
    await mongoManager.disconnect();
    res.json({ success: true, message: 'Disconnected' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/status', (_req: Request, res: Response) => {
  res.json({
    connected: mongoManager.isConnected(),
    uri: mongoManager.isConnected() ? mongoManager.getUri() : null,
  });
});

export default router;
