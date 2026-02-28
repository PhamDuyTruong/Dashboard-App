import http from 'http';
import { Server } from 'socket.io';
import { createApp } from './app';
import { createAnalyticsRoutes } from './routes/analytics.routes';

const app = createApp();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

app.use('/api', createAnalyticsRoutes(io));

const PORT = process.env.PORT || 3001;

if (process.env.NODE_ENV !== 'test') {
  server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

export { app, server, io };
