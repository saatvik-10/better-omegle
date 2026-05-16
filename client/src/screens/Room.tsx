import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useSearchParams } from 'react-router-dom';
import { io, type Socket } from 'socket.io-client';

const Room = () => {
  const URL = 'ws://localhost:8000';

  const [searchParams] = useSearchParams();
  const name = searchParams.get('name');

  const [socket, setSocket] = useState<Socket | null>(null);
  const [lobby, setLobby] = useState<boolean>(false);

  const [sendingPc, setSendingPc] = useState<null | RTCPeerConnection>(null);
  const [receivingPc, setReceivingPc] = useState<null | RTCPeerConnection>(
    null,
  );
  const [remoteVideoTrack, setRemoteVideoTrack] =
    useState<MediaStreamTrack | null>(null);
  const [localVideoTracck, setlocalVideoTracck] = useState<MediaStreamTrack>();
  const [remoteAudioTrack, setRemoteAudioTrack] =
    useState<MediaStreamTrack | null>(null);
  const [localAudioTrack, setLocalAudioTrack] = useState<MediaStreamTrack>();

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

      const sdp = await pc.createOffer();

      socketInstance.emit('offer', { sdp, roomId });
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
        setReceivingPc(pc);

        pc.ontrack = ({ track, type }) => {
          if (type == 'audio') {
            setRemoteAudioTrack(track);
          } else {
            setRemoteVideoTrack(track);
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

  return (
    <div>
      {lobby ? (
        'Waiting to connect you with someone'
      ) : (
        <>
          `Wassuppp ${name ?? ''}`
          <video width={400} height={400} src=''></video>
          <video width={400} height={400} src=''></video>
        </>
      )}
    </div>
  );
};

export default Room;
