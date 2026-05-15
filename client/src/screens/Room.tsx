import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useSearchParams } from 'react-router-dom';
import { io, type Socket } from 'socket.io-client';

const Room = () => {
  const URL = 'ws://localhost:8000';

  const [searchParams] = useSearchParams();
  const name = searchParams.get('name');

  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (!name) return;

    const socketInstance = io(URL);

    socketInstance.on('connect', () => {
      socketInstance.emit('join', { name });
    });

    socketInstance.on('offer', ({ roomId }: { roomId: string }) => {
      toast('Got offer; sending answer placeholder');
      socketInstance.emit('answer', { sdp: '', roomId });
    });

    socketInstance.on('answer', () => {
      toast.success('Answer received');
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
      setSocket(null);
    };
  }, [name]);

  return <div>Hello {name}</div>;
};

export default Room;
