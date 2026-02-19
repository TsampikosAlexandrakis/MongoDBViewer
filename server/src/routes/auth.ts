import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import crypto from 'crypto';

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many login attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/login', loginLimiter, (req: Request, res: Response) => {
  const { password } = req.body;

  if (!password || typeof password !== 'string') {
    res.status(401).json({ error: 'Invalid password' });
    return;
  }

  const expected = process.env.ADMIN_PASSWORD as string;

  // Constant-time comparison to prevent timing attacks
  const passwordBuf = Buffer.from(password);
  const expectedBuf = Buffer.from(expected);
  const match =
    passwordBuf.length === expectedBuf.length &&
    crypto.timingSafeEqual(passwordBuf, expectedBuf);

  if (!match) {
    res.status(401).json({ error: 'Invalid password' });
    return;
  }

  const token = jwt.sign({}, process.env.JWT_SECRET as string, { expiresIn: '8h' });
  res.json({ token });
});

export default router;
