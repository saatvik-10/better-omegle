import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { io, type Socket } from 'socket.io-client';
import type {
  AnswerPayload,
  IceCandidatePayload,
  NewRoomPayload,
  OfferPayload,
} from '../../../shared/socketPayloads';

const Room = ({
  name,
  localAudioTrack,
  localVideoTrack,
}: {
  name: string;
  localAudioTrack: MediaStreamTrack | null;
  localVideoTrack: MediaStreamTrack | null;
}) => {
  const URL = 'ws://localhost:8000';

  const [_socket, setSocket] = useState<Socket | null>(null);
  const [lobby, setLobby] = useState<boolean>(false);

  const [_sendingPc, setSendingPc] = useState<null | RTCPeerConnection>(null);
  const [_receivingPc, setReceivingPc] = useState<null | RTCPeerConnection>(
    null,
  );

  const [_remoteMediaStream, setRemoteMediaStream] =
    useState<MediaStream | null>(null);

  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!name) return;

    const socketInstance = io(URL);

    socketInstance.on('connect', () => {
      socketInstance.emit('join', { name });
    });

    socketInstance.on('new-room', async ({ roomId, type }: NewRoomPayload) => {
      toast('You have entered a new room');
      setLobby(false);

      if (type !== 'send-connection-req') return;
      if (!localAudioTrack || !localVideoTrack) return;
      if (!socketInstance.id) return;

      const pc = new RTCPeerConnection();
      setSendingPc(pc);

      const stream = new MediaStream();
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = stream;
      }
      setRemoteMediaStream(stream);

      pc.ontrack = (event) => {
        const currentStream = remoteVideoRef.current?.srcObject;
        if (currentStream instanceof MediaStream) {
          currentStream.addTrack(event.track);
        }
      };

      pc.addTrack(localAudioTrack);
      pc.addTrack(localVideoTrack);

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      if (!offer.sdp) return;
      socketInstance.emit('offer', {
        sdp: offer.sdp,
        roomId,
        senderSocketId: socketInstance.id,
      });

      pc.onicecandidate = (event) => {
        if (!event.candidate || !socketInstance.id) return;

        socketInstance.emit('ice-candidate', {
          candidate: event.candidate,
          roomId,
          senderSocketId: socketInstance.id,
          type: 'sender',
        });
      };
    });

    socketInstance.on(
      'offer',
      async ({ roomId, sdp: offerSdp }: OfferPayload) => {
        toast('Got offer');
        setLobby(false);

        if (!localAudioTrack || !localVideoTrack) return;

        const pc = new RTCPeerConnection();

        const stream = new MediaStream();
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = stream;
        }
        setRemoteMediaStream(stream);

        pc.ontrack = (event) => {
          const currentStream = remoteVideoRef.current?.srcObject;
          if (currentStream instanceof MediaStream) {
            currentStream.addTrack(event.track);
          }
        };

        pc.onicecandidate = (event) => {
          if (!event.candidate || !socketInstance.id) return;

          socketInstance.emit('ice-candidate', {
            candidate: event.candidate,
            roomId,
            senderSocketId: socketInstance.id,
            type: 'receiver',
          });
        };

        pc.addTrack(localAudioTrack);
        pc.addTrack(localVideoTrack);

        await pc.setRemoteDescription({
          sdp: offerSdp,
          type: 'offer',
        });

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        setReceivingPc(pc);

        if (!answer.sdp || !socketInstance.id) return;
        socketInstance.emit('answer', {
          sdp: answer.sdp,
          roomId,
          senderSocketId: socketInstance.id,
        });
      },
    );

    socketInstance.on('answer', ({ sdp }: AnswerPayload) => {
      toast.success('Answer received');
      setLobby(false);

      setSendingPc((pc) => {
        pc?.setRemoteDescription({
          type: 'answer',
          sdp,
        });
        return pc;
      });
    });

    socketInstance.on('lobby', () => {
      setLobby(true);
    });

    socketInstance.on(
      'ice-candidate',
      ({ candidate, type }: IceCandidatePayload) => {
        if (type === 'sender') {
          setReceivingPc((pc) => {
            pc?.addIceCandidate(candidate);
            return pc;
          });
        } else {
          setSendingPc((pc) => {
            pc?.addIceCandidate(candidate);
            return pc;
          });
        }
      },
    );

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
      setSocket(null);
    };
  }, [name]);

  useEffect(() => {
    if (!localVideoRef.current || !localVideoTrack) return;

    localVideoRef.current.srcObject = new MediaStream([localVideoTrack]);
    localVideoRef.current.play();

    // if (!remoteVideoRef.current || !remoteVideoTrack) return;

    // remoteVideoRef.current.srcObject = new MediaStream([remoteVideoTrack]);
    // remoteVideoRef.current.play();
  }, [localVideoTrack]);

  return (
    <div>
      Wassuppp {name}
      <video
        autoPlay
        // muted
        playsInline
        width={400}
        height={400}
        ref={localVideoRef}
        className='rotate-y-180'
      />
      {lobby ? 'Waiting to connect you with someone' : null}
      <video
        autoPlay
        // muted
        playsInline
        width={400}
        height={400}
        className='rotate-y-180'
        ref={remoteVideoRef}
      />
    </div>
  );
};

export default Room;
