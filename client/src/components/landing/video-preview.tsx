import {
  Camera,
  CameraOff,
  Mic,
  MicOff,
  ShieldCheck,
  VideoOff,
} from 'lucide-react';
import type { RefObject } from 'react';
import { TextureCard } from '@/components/ui/texture-card';

type VideoPreviewProps = {
  videoRef: RefObject<HTMLVideoElement | null>;
  cameraReady: boolean;
  cameraError: string;
  cameraOff: boolean;
  audioOff: boolean;
  onCameraToggle: () => void;
  onAudioToggle: () => void;
};

export function VideoPreview({
  videoRef,
  cameraReady,
  cameraError,
  cameraOff,
  audioOff,
  onCameraToggle,
  onAudioToggle,
}: VideoPreviewProps) {
  return (
    <TextureCard className='min-h-[420px]'>
      <div className='relative aspect-[4/5] min-h-[420px] overflow-hidden rounded-[24px] bg-ink/80'>
        <video
          autoPlay
          muted
          playsInline
          ref={videoRef}
          className='h-full w-full scale-x-[-1] object-cover opacity-90'
        />
        {cameraOff ? (
          <div className='absolute inset-0 grid place-items-center bg-ink/90'>
            <div className='flex flex-col items-center gap-3'>
              <CameraOff className='size-8 text-foam/40' />
              <p className='font-display text-xs uppercase tracking-[0.18em] text-foam/40'>
                Camera off
              </p>
            </div>
          </div>
        ) : null}
        {audioOff ? (
          <div className='absolute right-4 top-4 flex items-center gap-2 rounded-full border border-white/10 bg-ink/70 px-3 py-2 text-red-500 backdrop-blur-xl'>
            <MicOff className='size-4' />
            <span className='text-[0.6rem] font-bold uppercase tracking-[0.2em]'>
              Muted
            </span>
          </div>
        ) : null}
        {!cameraReady ? (
          <div className='absolute inset-0 grid place-items-center bg-[radial-gradient(circle_at_50%_35%,rgba(216,255,61,.18),transparent_32%),#101014] text-center'>
            <div>
              <div className='mx-auto grid size-16 place-items-center rounded-full border border-white/15 bg-white/8'>
                <VideoOff className='size-7 text-foam/70' />
              </div>
              <p className='mt-5 max-w-[16rem] font-display text-sm uppercase tracking-[0.16em] text-foam/56'>
                {cameraError || 'Camera preview is warming up'}
              </p>
            </div>
          </div>
        ) : null}
        <div className='absolute inset-x-4 bottom-4 flex items-center justify-between rounded-[18px] border border-white/12 bg-ink/74 p-3 backdrop-blur-xl'>
          <div className='flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-foam/72'>
            <span className='size-2 rounded-full bg-acid shadow-[0_0_18px_rgba(216,255,61,.9)]' />
            Preview
          </div>
          <div className='flex items-center gap-2 text-foam'>
            <button
              className='grid size-9 place-items-center rounded-full bg-white/10'
              type='button'
              onClick={onCameraToggle}
            >
              {cameraOff ? (
                <CameraOff className='size-4' />
              ) : (
                <Camera className='size-4' />
              )}
            </button>
            <button
              className='grid size-9 place-items-center rounded-full bg-white/10'
              type='button'
              onClick={onAudioToggle}
            >
              {audioOff ? (
                <MicOff className='size-4' />
              ) : (
                <Mic className='size-4' />
              )}
            </button>
            <span className='grid size-9 place-items-center rounded-full bg-acid text-ink'>
              <ShieldCheck className='size-4' />
            </span>
          </div>
        </div>
      </div>
    </TextureCard>
  );
}
