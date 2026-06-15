import cors from 'cors';
import express from 'express';
import { env } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';
import { prisma } from './lib/prisma.js';
import paymentsRouter from './routes/payments.js';
import supportersRouter from './routes/supporters.js';
import webhooksRouter from './routes/webhooks.js';

const app = express();

app.use(cors({ origin: env.webUrl }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ ok: true, service: 'simba-api' });
  } catch {
    res.status(503).json({ ok: false, service: 'simba-api', database: 'unavailable' });
  }
});

app.use('/api/supporters', supportersRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/webhooks', webhooksRouter);

app.use(errorHandler);

app.listen(env.port, () => {
  console.log(`API ready on http://localhost:${env.port}`);
  if (!env.flexpay.token) {
    console.warn('FLEXPAY_TOKEN manquant — les paiements FlexPay échoueront.');
  }
});
