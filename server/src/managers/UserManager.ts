import type { Socket } from 'socket.io';
// import client from '../config/redis';
import type { RoomManager } from './RoomManager';
import type {
  AnswerPayload,
  ChatMsgPayload,
  IceCandidatePayload,
  OfferPayload,
} from '../../../shared/socketPayloads';

export interface User {
  name: string;
  socket: Socket;
}

export class UserManager {
  private users: User[];
  private queue: string[];
  private roomManager: RoomManager;

  constructor(roomManager: RoomManager) {
    this.users = [];
    this.roomManager = roomManager;
    this.queue = [];
  }

  addUser(name: string, socket: Socket) {
    this.users.push({
      name,
      socket,
    });

    // await client.rPush('queue', socket.id);
    this.queue.push(socket.id);

    socket.emit('lobby');

    this.initHandler(socket);
    this.clearQueue();
  }

  reQueueUser(socket: Socket) {
    const user = this.users.find((u) => u.socket.id === socket.id);

    if (user) {
      this.queue = this.queue.filter((id) => id !== socket.id);

      // await client.rPush('queue', socket.id);
      this.queue.push(socket.id);

      socket.emit('lobby');

      this.clearQueue();
    }
  }

  removeUser(socketId: string) {
    this.users = this.users.filter((u) => u.socket.id !== socketId);
    // await client.lRem('queue', 0, socketId);
    this.queue = this.queue.filter((id) => id !== socketId);
  }

  clearQueue() {
    if (this.queue.length < 2) return;

    // const user1Id = await client.lPop('queue');
    // const user2Id = await client.lPop('queue');
    const user1Id = this.queue.pop();
    const user2Id = this.queue.pop();

    if (!user1Id || !user2Id) return;

    const user1 = this.users.find((u) => u.socket.id === user1Id);
    const user2 = this.users.find((u) => u.socket.id === user2Id);

    if (!user1 || !user2) return;

    this.roomManager.createRoom(user1, user2);
    this.clearQueue();
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

    socket.on('chat-message', ({ senderSocketId, payload }: ChatMsgPayload) => {
      this.roomManager.chatMsg({ senderSocketId: socket.id, payload });
    });
  }
}
