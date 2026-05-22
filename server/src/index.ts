import express from 'express';
import { createServer } from 'node:http';
import { Server, Socket } from 'socket.io';
import { RoomManager } from './managers/RoomManager';
import { UserManager } from './managers/UserManager';
import type { JoinPayload } from '../../shared/socketPayloads';
// import { connectRedis, registerRedisShutdown } from './config/redis';

const app = express();

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

const roomManager = new RoomManager();
const userManager = new UserManager(roomManager);

// await connectRedis();
// registerRedisShutdown();

app.get('/', (req, res) => {
  res.status(200).send('ok');
});

io.on('connection', (socket: Socket) => {
  console.log('a user connected');

  socket.on('join', ({ name }: JoinPayload) => {
    userManager.addUser(name, socket);
  });

  socket.on('disconnect', () => {
    userManager.removeUser(socket.id);
  });
});

const port = Number(process.env.PORT ?? 8000);

server.listen(port, () => {
  console.log(`Server running at PORT:${port}`);
});
