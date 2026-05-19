import express from 'express';
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { Server, Socket } from 'socket.io';
import { RoomManager } from './managers/RoomManager';
import { UserManager } from './managers/UserManager';
import type { JoinPayload } from '../../shared/socketPayloads';
import { connectRedis, registerRedisShutdown } from './config/redis';

const app = express();

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

const roomManager = new RoomManager();
const userManager = new UserManager(roomManager);

const __dirname = dirname(fileURLToPath(import.meta.url));

await connectRedis();
registerRedisShutdown();

app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'index.html'));
});

io.on('connection', (socket: Socket) => {
  console.log('a user connected');

  socket.on('join', async ({ name }: JoinPayload) => {
    await userManager.addUser(name, socket);
  });

  socket.on('disconnect', () => {
    userManager.removeUser(socket.id);
  });
});

server.listen(8000, () => {
  console.log('Server running at PORT:8000');
});
