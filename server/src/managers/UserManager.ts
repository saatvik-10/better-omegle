import type { Socket } from 'socket.io';
import client from '../config/redis';
import type { RoomManager } from './RoomManager';
import type {
  AnswerPayload,
  IceCandidatePayload,
  OfferPayload,
} from '../../../shared/socketPayloads';

export interface User {
  name: string;
  socket: Socket;
}

export class UserManager {
  private users: User[];
  //   private queue: string[];
  private roomManager: RoomManager;

  constructor(roomManager: RoomManager) {
    this.users = [];
    this.roomManager = roomManager;
    // this.queue = [];
  }

  async addUser(name: string, socket: Socket) {
    this.initHandler(socket);

    const existingUser = this.users.find((u) => u.socket.id === socket.id);
    if (existingUser) {
      existingUser.name = name;
      return;
    }

    this.users.push({
      name,
      socket,
    });

    await client.rPush('queue', socket.id);
    const queueLength = await client.lLen('queue');
    if (queueLength < 2) {
      socket.emit('lobby');
      return;
    }
    // this.queue.push(socket.id);
    await this.clearQueue();
  }

  async removeUser(socketId: string) {
    this.users = this.users.filter((u) => u.socket.id !== socketId);
    await client.lRem('queue', 0, socketId);
  }

  async clearQueue() {
    const queueLength = await client.lLen('queue');
    if (queueLength < 2) return;

    const user1Id = await client.lPop('queue');
    const user2Id = await client.lPop('queue');

    if (!user1Id || !user2Id) return;

    const user1 = this.users.find((u) => u.socket.id === user1Id);
    const user2 = this.users.find((u) => u.socket.id === user2Id);

    if (user1 && user2) {
      this.roomManager.createRoom(user1, user2);
    }
  }

  initHandler(socket: Socket) {
    if (socket.data.userManagerHandlersInitialized === true) return;
    socket.data.userManagerHandlersInitialized = true;

    socket.on('offer', ({ roomId, sdp, senderSocketId }: OfferPayload) => {
      this.roomManager.onConnReqOffer({ roomId, sdp, senderSocketId });
    });

    socket.on('answer', ({ roomId, sdp, senderSocketId }: AnswerPayload) => {
      this.roomManager.onConnReqAns({ roomId, sdp, senderSocketId });
    });

    socket.on(
      'ice-candidate',
      ({ roomId, senderSocketId, candidate, type }: IceCandidatePayload) => {
        this.roomManager.onIceCandidate({
          roomId,
          senderSocketId: socket.id,
          candidate,
          type,
        });
      },
    );
  }
}
