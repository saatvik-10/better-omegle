import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { io, type Socket } from 'socket.io-client';

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

  const [socket, setSocket] = useState<Socket | null>(null);
  const [lobby, setLobby] = useState<boolean>(false);

  const [sendingPc, setSendingPc] = useState<null | RTCPeerConnection>(null);
  const [receivingPc, setReceivingPc] = useState<null | RTCPeerConnection>(
    null,
  );
  const [remoteVideoTrack, setRemoteVideoTrack] =
    useState<MediaStreamTrack | null>(null);
  const [remoteAudioTrack, setRemoteAudioTrack] =
    useState<MediaStreamTrack | null>(null);
  const [remoteMediaStream, setRemoteMediaStream] =
    useState<MediaStream | null>(null);

  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!name) return;

    const socketInstance = io(URL);

    socketInstance.on('connect', () => {
      socketInstance.emit('join', { name });
    });

    socketInstance.on('new-room', async ({ roomId }: { roomId: string }) => {
      toast('You have entered a new room');
      setLobby(false);

      const pc = new RTCPeerConnection();
      setSendingPc(pc);

      pc.addTrack(localAudioTrack!);
      pc.addTrack(localVideoTrack!);

      pc.onicecandidate = async () => {
        const sdp = await pc.createOffer();
        socketInstance.emit('offer', { sdp, roomId });
      };
    });

    socketInstance.on(
      'offer',
      async ({
        roomId,
        offer: offerSdp,
      }: {
        roomId: string;
        offer: string;
      }) => {
        toast('Got offer');
        setLobby(false);

        const pc = new RTCPeerConnection();
        pc.setRemoteDescription({
          sdp: offerSdp,
          type: 'offer',
        });

        const sdp = await pc.createAnswer();

        const stream = new MediaStream();

        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = stream;
        }

        setRemoteMediaStream(stream);

        setReceivingPc(pc);

        pc.ontrack = (event) => {
          const stream = remoteVideoRef.current?.srcObject;
          if (stream instanceof MediaStream) {
            stream.addTrack(event.track);
          }
        };

        socketInstance.emit('answer', { sdp, roomId });
      },
    );

    socketInstance.on('answer', ({ sdp }: { sdp: string }) => {
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
  }, [localVideoTrack]);

  return (
    <div>
      Wassuppp {name}
      <video
        autoPlay
        muted
        playsInline
        width={400}
        height={400}
        ref={localVideoRef}
        className='rotate-y-180'
      />
      {lobby ? 'Waiting to connect you with someone' : null}
      <video autoPlay width={400} height={400} ref={remoteVideoRef} />
    </div>
  );
};

export default Room;
