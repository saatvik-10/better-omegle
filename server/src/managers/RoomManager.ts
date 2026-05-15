import crypto from 'crypto';
import type { User } from './UserManager';

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
      type: 'send-connection-req',
      roomId,
    });
  }

  onConnReqOffer(roomId: string, sdp: string) {
    const user2 = this.rooms.get(roomId)?.user2;

    user2?.socket.emit('offer', {
      sdp,
    });
  }

  onConnReqAns(roomId: string, sdp: string) {
    const user1 = this.rooms.get(roomId)?.user1;

    user1?.socket.emit('answer', {
      sdp,
    });
  }

  generate() {
    return crypto.randomUUID();
  }
}
