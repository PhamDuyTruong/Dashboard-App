import express from 'express';
import cors from 'cors';

const corsOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

export function createApp(): express.Express {
  const app = express();
  app.use(cors({ origin: corsOrigin }));
  app.use(express.json());
  return app;
}
