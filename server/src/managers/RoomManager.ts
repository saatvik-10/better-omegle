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
  private socketToRoom: Map<string, string>;

  constructor() {
    this.rooms = new Map<string, Room>();
    this.socketToRoom = new Map<string, string>();
  }

  createRoom(user1: User, user2: User) {
    const roomId = this.generate();

    this.rooms.set(roomId.toString(), {
      user1,
      user2,
    });

    this.socketToRoom.set(user1.socket.id, roomId.toString());
    this.socketToRoom.set(user2.socket.id, roomId.toString());

    user1?.socket.emit('new-room', {
      type: 'send-connection-req',
      roomId,
    });
    user2?.socket.emit('new-room', {
      type: 'wait-for-connection-req',
      roomId,
    });
  }

  removeRoomAndNotify(socketId: string) {
    const roomId = this.socketToRoom.get(socketId);

    if (!roomId) return;

    const room = this.rooms.get(roomId);

    if (room) {
      const receivingUser =
        room.user1.socket.id === socketId ? room.user2 : room.user1;

      receivingUser?.socket.emit('peer-left', {
        roomId,
      });

      this.socketToRoom.delete(room.user1.socket.id);
      this.socketToRoom.delete(room.user2.socket.id);

      this.rooms.delete(roomId);
    }
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
