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

  useEffect(() => {
    if (!name) return;

    const socketInstance = io(URL);

    socketInstance.on('connect', () => {
      socketInstance.emit('join', { name });
    });

    socketInstance.on('new-room', ({ roomId }: { roomId: string }) => {
      toast('You have entered a new room');
      setLobby(false);
      socketInstance.emit('offer', { sdp: '', roomId });
    });

    socketInstance.on('offer', ({ roomId }: { roomId: string }) => {
      toast('Got offer');
      setLobby(false);
      socketInstance.emit('answer', { sdp: '', roomId });
    });

    socketInstance.on('answer', () => {
      toast.success('Answer received');
      setLobby(false);
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
      {lobby ? 'Waiting to connect you with someone' : `Hello ${name ?? ''}`}
    </div>
  );
};

export default Room;
