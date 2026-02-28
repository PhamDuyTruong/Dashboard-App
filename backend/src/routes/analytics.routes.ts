/**
 * Analytics routes: wire HTTP methods to controller actions.
 */

import { Router } from 'express';
import type { Server as SocketIOServer } from 'socket.io';
import { getList, getSummary, createEntry } from '../controllers/analytics.controller';

export function createAnalyticsRoutes(io: SocketIOServer | null): Router {
  const router = Router();

  router.get('/analytics', getList);
  router.get('/analytics/summary', getSummary);
  router.post('/analytics', createEntry(io));

  return router;
}
