import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { BrandMark } from '@/components/landing/brand-mark';
import { FeatureRail } from '@/components/landing/feature-rail';
import { JoinPanel } from '@/components/landing/join-panel';
import { SignalCard } from '@/components/landing/signal-card';
import { VideoPreview } from '@/components/landing/video-preview';
import { TextureOverlay } from '@/components/ui/texture-overlay';
import Room from './Room';

const Landing = () => {
  const [name, setName] = useState('');
  const [joined, setJoined] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [localVideoTrack, setLocalVideoTrack] = useState<MediaStreamTrack | null>(null);
  const [localAudioTrack, setLocalAudioTrack] = useState<MediaStreamTrack | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const displayName = name.trim() || 'night-guest';

  const handleRoomTransfer = () => {
    setJoined(true);
  };

  useEffect(() => {
    let active = true;

    const getStream = async () => {
      try {
        const stream = await window.navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        if (!active) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        const videoTrack = stream.getVideoTracks()[0] ?? null;
        const audioTrack = stream.getAudioTracks()[0] ?? null;
        setLocalVideoTrack(videoTrack);
        setLocalAudioTrack(audioTrack);

        if (videoRef.current && videoTrack) {
          videoRef.current.srcObject = new MediaStream([videoTrack]);
          await videoRef.current.play();
        }
      } catch {
        setCameraError('Allow camera and mic to enter the room');
      }
    };

    void getStream();

    return () => {
      active = false;
    };
  }, []);

  if (joined) {
    return (
      <Room
        name={displayName}
        localAudioTrack={localAudioTrack}
        localVideoTrack={localVideoTrack}
      />
    );
  }

  return (
    <main className="relative min-h-svh overflow-hidden bg-ink text-foam">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(216,255,61,.22),transparent_28%),radial-gradient(circle_at_85%_18%,rgba(101,243,255,.16),transparent_24%),linear-gradient(135deg,#09090b_0%,#151411_46%,#050507_100%)]" />
      <TextureOverlay texture="grid" opacity={0.18} />
      <div className="absolute -left-24 top-28 h-72 w-72 rotate-12 border border-acid/20" />
      <div className="absolute -right-20 bottom-10 h-80 w-80 rounded-full border border-cyan/20" />

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col px-5 py-5 sm:px-8 lg:min-h-svh">
        <header className="flex items-center justify-between">
          <BrandMark />
        </header>

        <section className="grid flex-1 items-center gap-10 py-14 lg:grid-cols-[1.1fr_0.9fr] lg:py-8">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, ease: [0.2, 0.8, 0.2, 1] }}
              className="max-w-3xl"
            >
              <p className="font-display text-xs font-bold uppercase tracking-[0.34em] text-acid">
                Stranger video chat, re-skinned for the brave
              </p>
              <h1 className="mt-5 text-pretty font-serif text-[clamp(3.6rem,8vw,7.5rem)] italic leading-[0.84] text-foam">
                Meet the internet after midnight.
              </h1>
              <p className="mt-7 max-w-2xl text-lg leading-8 text-foam/64">
                A sharper, moodier take on random conversation: camera-first, fast to enter,
                and styled like a pirate radio booth instead of a signup funnel.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.75, ease: [0.2, 0.8, 0.2, 1] }}
              className="mt-9 max-w-2xl"
            >
              <JoinPanel
                name={name}
                onNameChange={setName}
                onJoin={handleRoomTransfer}
                disabled={!localAudioTrack || !localVideoTrack}
              />
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 22 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }}
            className="relative"
          >
            <VideoPreview
              videoRef={videoRef}
              cameraReady={Boolean(localVideoTrack)}
              cameraError={cameraError}
            />
          </motion.div>
        </section>

        <section id="signals" className="grid gap-4 pb-2 md:grid-cols-3">
          <SignalCard label="camera" value="Preview" delay={0.45}>
            Check your frame before you enter, with mic and camera status kept close.
          </SignalCard>
          <SignalCard label="match" value="One-Click" delay={0.55}>
            Drop into stranger roulette quickly without a pile of setup screens.
          </SignalCard>
          <SignalCard label="account" value="None" delay={0.65}>
            No account wall, no profile ceremony, just a name and the room.
          </SignalCard>
        </section>

        <FeatureRail />

        <footer className="pb-8 pt-2 text-center font-display text-xs font-bold uppercase tracking-[0.2em] text-foam/36">
          &copy; Better Omegle · talk first {'>'} vanish later
        </footer>
      </div>
    </main>
  );
};

export default Landing;
