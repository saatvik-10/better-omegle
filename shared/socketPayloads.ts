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
}

export interface AnswerPayload {
  roomId: string;
  sdp: string;
}
