import { useEffect, useRef, useState } from 'react';
import {
  Camera,
  CameraOff,
  Mic,
  MicOff,
  Radar,
  RefreshCcw,
  Signal,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { io } from 'socket.io-client';
import type {
  AnswerPayload,
  ChatMsgPayload,
  IceCandidatePayload,
  MediaStatePayload,
  NewRoomPayload,
  OfferPayload,
} from '../../../shared/socketPayloads';
import { BrandMark } from '@/components/landing/brand-mark';
import { ChatPanel } from '@/components/room/chat-panel';
import { TextureButton } from '@/components/ui/texture-button';
import { TextureCard } from '@/components/ui/texture-card';
import { TextureOverlay } from '@/components/ui/texture-overlay';
import type { Socket } from 'socket.io-client';

const URL = import.meta.env.VITE_SERVER_URL;

type RoomProps = {
  name: string;
  localAudioTrack: MediaStreamTrack | null;
  localVideoTrack: MediaStreamTrack | null;
};

type ChatItem = {
  text: string;
  time: string;
  from: 'me' | 'peer';
};

const Room = ({ name, localAudioTrack, localVideoTrack }: RoomProps) => {
  const [lobby, setLobby] = useState(false);
  const [connected, setConnected] = useState(false);

  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const sendingPcRef = useRef<RTCPeerConnection | null>(null);
  const receivingPcRef = useRef<RTCPeerConnection | null>(null);

  const [audioOff, setAudioOff] = useState<boolean>(false);
  const [cameraOff, setCameraOff] = useState<boolean>(false);

  const [peerAudioOff, setPeerAudioOff] = useState<boolean>(false);
  const [peerCameraOff, setPeerCameraOff] = useState<boolean>(false);

  const audioTrackRef = useRef<MediaStreamTrack | null>(localAudioTrack);
  const videoTrackRef = useRef<MediaStreamTrack | null>(localVideoTrack);

  const socketRef = useRef<Socket | null>(null);

  const [msg, setMsg] = useState('');
  const [messages, setMessages] = useState<ChatItem[]>([]);

  const inputRef = useRef<HTMLInputElement | null>(null);

  const getCurrentMediaState = (): MediaStatePayload => {
    const currentAudioOff = !(audioTrackRef.current?.enabled ?? true);
    const currentCameraOff = !(videoTrackRef.current?.enabled ?? true);

    return { audioOff: currentAudioOff, cameraOff: currentCameraOff };
  };

  const handleAudio = () => {
    if (!audioTrackRef.current) return;
    audioTrackRef.current.enabled = !audioTrackRef.current.enabled;

    const nextAudioOff = !audioTrackRef.current.enabled;
    setAudioOff(nextAudioOff);

    if (connected) {
      socketRef.current?.emit('media-state', {
        audioOff: nextAudioOff,
        cameraOff,
      } satisfies MediaStatePayload);
    }
  };

  const handleCamera = () => {
    if (!videoTrackRef.current) return;
    videoTrackRef.current.enabled = !videoTrackRef.current.enabled;

    const nextCameraOff = !videoTrackRef.current.enabled;
    setCameraOff(nextCameraOff);

    if (connected) {
      socketRef.current?.emit('media-state', {
        audioOff,
        cameraOff: nextCameraOff,
      } satisfies MediaStatePayload);
    }
  };

  const handleChat = () => {
    const text = msg.trim();

    if (!text) return;
    if (!socketRef.current?.id) return;
    if (!connected) return;

    const payload = {
      text,
      time: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, { ...payload, from: 'me' }]);
    socketRef.current.emit('chat-message', {
      senderSocketId: socketRef.current.id,
      payload,
    });

    setMsg('');
  };

  const handleNewMatch = () => {
    sendingPcRef.current?.close();
    receivingPcRef.current?.close();

    sendingPcRef.current = null;
    receivingPcRef.current = null;

    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }

    setConnected(false);
    setLobby(true);
    setMessages([]);
    setPeerAudioOff(false);
    setPeerCameraOff(false);

    socketRef.current?.emit('requeue');
  };

  useEffect(() => {
    if (!name) return;

    const socketInstance = io(URL);

    socketRef.current = socketInstance;

    socketInstance.on('connect', () => {
      socketInstance.emit('join', { name });
    });

    socketInstance.on('new-room', async ({ roomId, type }: NewRoomPayload) => {
      toast.success('You have entered a new room');
      setLobby(false);
      setConnected(true);
      setMessages([]);
      setPeerAudioOff(false);
      setPeerCameraOff(false);

      socketInstance.emit('media-state', getCurrentMediaState());

      if (type !== 'send-connection-req') return;
      if (!localAudioTrack || !localVideoTrack) return;
      if (!socketInstance.id) return;

      const pc = new RTCPeerConnection();
      sendingPcRef.current = pc;

      const stream = new MediaStream();
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = stream;
      }

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
        toast('Incoming signal');
        setLobby(false);
        setConnected(true);

        if (!localAudioTrack || !localVideoTrack) return;

        const pc = new RTCPeerConnection();
        const stream = new MediaStream();

        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = stream;
        }

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

        await pc.setRemoteDescription({ sdp: offerSdp, type: 'offer' });

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        receivingPcRef.current = pc;

        if (!answer.sdp || !socketInstance.id) return;
        socketInstance.emit('answer', {
          sdp: answer.sdp,
          roomId,
          senderSocketId: socketInstance.id,
        });
      },
    );

    socketInstance.on('answer', ({ sdp }: AnswerPayload) => {
      toast.success('Peer connected');
      setLobby(false);
      setConnected(true);

      if (sendingPcRef.current) {
        void sendingPcRef.current.setRemoteDescription({ type: 'answer', sdp });
      }
    });

    socketInstance.on('peer-left', () => {
      setLobby(true);
      setConnected(false);
      setMessages([]);
      setPeerAudioOff(false);
      setPeerCameraOff(false);

      sendingPcRef.current?.close();
      receivingPcRef.current?.close();

      sendingPcRef.current = null;
      receivingPcRef.current = null;

      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = null;
      }
    });

    socketInstance.on('peer-media-state', (payload: MediaStatePayload) => {
      setPeerAudioOff(payload.audioOff);
      setPeerCameraOff(payload.cameraOff);
    });

    socketInstance.on('message', (payload: ChatMsgPayload['payload']) => {
      setMessages((msg) => [...msg, { ...payload, from: 'peer' }]);
    });

    socketInstance.on('lobby', () => {
      setLobby(true);
      setConnected(false);
      setMessages([]);
      setPeerAudioOff(false);
      setPeerCameraOff(false);
    });

    socketInstance.on(
      'ice-candidate',
      ({ candidate, type }: IceCandidatePayload) => {
        if (type === 'sender') {
          void receivingPcRef.current?.addIceCandidate(candidate);
        } else {
          void sendingPcRef.current?.addIceCandidate(candidate);
        }
      },
    );

    return () => {
      sendingPcRef.current?.close();
      receivingPcRef.current?.close();
      socketInstance.disconnect();
    };
  }, [localAudioTrack, localVideoTrack, name]);

  useEffect(() => {
    if (!localVideoRef.current || !localVideoTrack) return;
    localVideoRef.current.srcObject = new MediaStream([localVideoTrack]);
    void localVideoRef.current.play();
  }, [localVideoTrack]);

  return (
    <main className='relative min-h-svh overflow-hidden bg-ink text-foam'>
      <div className='absolute inset-0 bg-[radial-gradient(circle_at_50%_-10%,rgba(216,255,61,.18),transparent_32%),linear-gradient(135deg,#060607,#161410_58%,#07080b)]' />
      <TextureOverlay texture='dots' opacity={0.16} />

      <div className='relative z-10 mx-auto flex min-h-svh w-full max-w-7xl flex-col gap-5 px-5 py-5 sm:px-8'>
        <header className='flex flex-wrap items-center justify-between gap-4'>
          <BrandMark />
          <div className='flex items-center gap-3 rounded-full border border-white/10 bg-white/6 px-4 py-2 font-display text-xs font-bold uppercase tracking-[0.18em] text-foam/64'>
            <span className='size-2 rounded-full bg-acid shadow-[0_0_20px_rgba(216,255,61,.9)]' />
            {connected ? 'Live room' : lobby ? 'Scanning' : 'Signal open'}
          </div>
        </header>

        <section className='grid flex-1 gap-5 lg:grid-cols-[minmax(0,1fr)_320px]'>
          <TextureCard className='min-h-140'>
            <div className='relative flex h-full min-h-140 items-center justify-center overflow-hidden rounded-3xl bg-black'>
              <video
                autoPlay
                playsInline
                className='h-full w-full scale-x-[-1] object-cover'
                ref={remoteVideoRef}
              />
              {connected && peerAudioOff && (
                <div className='absolute right-3 top-3 z-10 flex items-center gap-2 rounded-full border border-white/10 bg-ink/70 px-3 py-2 text-red-500 backdrop-blur-xl'>
                  <MicOff className='size-4' />
                  <span className='text-[0.6rem] font-bold uppercase tracking-[0.2em]'>
                    Muted
                  </span>
                </div>
              )}
              {connected && peerCameraOff && (
                <div className='absolute inset-0 z-10 grid place-items-center bg-ink/90'>
                  <div className='flex flex-col items-center gap-3'>
                    <CameraOff className='size-8 text-foam/40' />
                    <p className='font-display text-xs uppercase tracking-[0.18em] text-foam/40'>
                      Camera off
                    </p>
                  </div>
                </div>
              )}
              {!connected ? (
                <div className='absolute inset-0 grid place-items-center bg-[radial-gradient(circle_at_50%_42%,rgba(101,243,255,.16),transparent_34%),rgba(7,8,11,.92)] text-center'>
                  <div>
                    <div className='mx-auto grid size-24 place-items-center rounded-full border border-acid/25 bg-acid/10'>
                      <Radar className='size-10 animate-pulse text-acid' />
                    </div>
                    <h1 className='mt-7 font-serif text-5xl italic leading-none text-foam'>
                      {lobby ? 'Finding your next stranger' : 'Opening signal'}
                    </h1>
                    <p className='mx-auto mt-4 max-w-md text-sm leading-6 text-foam/54'>
                      Keep this tab awake. The room will light up as soon as the
                      peer handshake lands.
                    </p>
                  </div>
                </div>
              ) : null}
            </div>
          </TextureCard>

          <aside className='flex flex-col gap-5'>
            <TextureCard>
              <div className='relative aspect-4/3 overflow-hidden rounded-3xl bg-black'>
                <video
                  autoPlay
                  muted
                  playsInline
                  className='h-full w-full scale-x-[-1] object-cover'
                  ref={localVideoRef}
                />
                {audioOff && (
                  <div className='absolute right-3 top-3 flex items-center gap-2 rounded-full border border-white/10 bg-ink/70 px-3 py-2 text-red-500 z-1000 backdrop-blur-xl'>
                    <MicOff className='size-4' />
                    <span className='text-[0.6rem] font-bold uppercase tracking-[0.2em]'>
                      Muted
                    </span>
                  </div>
                )}
                {cameraOff && (
                  <div className='absolute inset-0 grid place-items-center bg-ink/90'>
                    <div className='flex flex-col items-center gap-3'>
                      <CameraOff className='size-8 text-foam/40' />
                      <p className='font-display text-xs uppercase tracking-[0.18em] text-foam/40'>
                        Camera off
                      </p>
                    </div>
                  </div>
                )}
                <div className='absolute inset-x-3 bottom-3 rounded-2xl bg-ink/72 px-3 py-2 font-display text-xs uppercase tracking-[0.16em] text-foam/62 backdrop-blur-xl'>
                  {name}
                </div>
              </div>
            </TextureCard>

            <TextureCard className='p-5'>
              <div className='flex items-center gap-3'>
                <div className='grid size-11 place-items-center rounded-2xl bg-cyan/16 text-cyan'>
                  <Signal className='size-5' />
                </div>
                <div>
                  <p className='font-display text-xs font-bold uppercase tracking-[0.18em] text-foam/42'>
                    Session state
                  </p>
                  <p className='font-serif text-3xl italic leading-none text-foam'>
                    {connected ? 'Paired' : lobby ? 'Seeking' : 'Ready'}
                  </p>
                </div>
              </div>
              <div className='mt-5 grid grid-cols-2 gap-2'>
                <button
                  className='grid h-14 place-items-center rounded-2xl border border-white/10 bg-white/6 text-foam/72'
                  type='button'
                  onClick={handleCamera}
                >
                  {cameraOff ? (
                    <CameraOff className='size-5' />
                  ) : (
                    <Camera className='size-5' />
                  )}
                </button>
                <button
                  className='grid h-14 place-items-center rounded-2xl border border-white/10 bg-white/6 text-foam/72'
                  type='button'
                  onClick={handleAudio}
                >
                  {audioOff ? (
                    <MicOff className='size-5' />
                  ) : (
                    <Mic className='size-5' />
                  )}
                </button>
              </div>
            </TextureCard>

            <TextureButton
              className='w-full gap-3'
              size='lg'
              variant='accent'
              onClick={handleNewMatch}
            >
              <RefreshCcw className='relative z-10 size-4' />
              <span className='relative z-10'>New Match</span>
            </TextureButton>

            <ChatPanel
              connected={connected}
              msg={msg}
              onMsgChange={setMsg}
              onSend={handleChat}
              messages={messages}
              inputRef={inputRef}
            />
          </aside>
        </section>
      </div>
    </main>
  );
};

export default Room;
