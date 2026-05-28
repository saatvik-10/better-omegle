export type ConnectionRequestType =
  | 'send-connection-req'
  | 'wait-for-connection-req';

export interface JoinPayload {
  name: string;
}

export interface NewRoomPayload {
  type: ConnectionRequestType;
  roomId: string;
}

export interface OfferPayload {
  roomId: string;
  sdp: string;
  senderSocketId: string;
}

export interface AnswerPayload {
  roomId: string;
  sdp: string;
  senderSocketId: string;
}

export interface IceCandidatePayload {
  roomId: string;
  senderSocketId: string | null;
  candidate: any;
  type: 'sender' | 'receiver';
}

export interface ChatMsgPayload {
  senderSocketId: string;
  payload: {
    text: string;
    senderId: string;
    time: string;
  };
}
