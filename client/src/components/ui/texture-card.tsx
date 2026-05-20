import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import { TextureOverlay } from './texture-overlay';

export function TextureCard({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-[24px] border border-white/12 bg-white/[0.075] shadow-[inset_0_1px_0_rgba(255,255,255,.16),0_25px_70px_rgba(0,0,0,.24)] backdrop-blur-2xl',
        className,
      )}
      {...props}
    >
      <TextureOverlay texture="grain" opacity={0.22} />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

export function TextureCardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('p-5 pb-3', className)} {...props} />;
}

export function TextureCardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('p-5 pt-0', className)} {...props} />;
}

export function TextureSeparator({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('h-px bg-white/12', className)} {...props} />;
}
