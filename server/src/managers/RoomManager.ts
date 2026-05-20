import crypto from 'crypto';
import type { User } from './UserManager';
import type {
  OfferPayload,
  AnswerPayload,
  IceCandidatePayload,
} from '../../../shared/socketPayloads';

interface Room {
  user1: User;
  user2: User;
}

export class RoomManager {
  private rooms: Map<string, Room>;

  constructor() {
    this.rooms = new Map<string, Room>();
  }

  createRoom(user1: User, user2: User) {
    const roomId = this.generate();

    this.rooms.set(roomId.toString(), {
      user1,
      user2,
    });

    user1?.socket.emit('new-room', {
      type: 'send-connection-req',
      roomId,
    });
    user2?.socket.emit('new-room', {
      type: 'wait-for-connection-req',
      roomId,
    });
  }

  onConnReqOffer({ roomId, sdp, senderSocketId }: OfferPayload) {
    const room = this.rooms.get(roomId);

    if (!room) return;

    const receivingUser =
      room.user1.socket.id === senderSocketId ? room.user2 : room.user1;

    receivingUser?.socket.emit('offer', {
      sdp,
      roomId,
    });
  }

  onConnReqAns({ roomId, sdp, senderSocketId }: AnswerPayload) {
    const room = this.rooms.get(roomId);

    if (!room) return;

    const receivingUser =
      room.user1.socket.id === senderSocketId ? room.user2 : room.user1;

    receivingUser?.socket.emit('answer', {
      sdp,
      roomId,
    });
  }

  onIceCandidate({
    roomId,
    senderSocketId,
    candidate,
    type,
  }: IceCandidatePayload) {
    const room = this.rooms.get(roomId);

    if (!room) return;

    const receivingUser =
      room.user1.socket.id === senderSocketId ? room.user2 : room.user1;

    receivingUser.socket.emit('ice-candidate', { candidate, type });
  }

  generate() {
    return crypto.randomUUID();
  }
}
