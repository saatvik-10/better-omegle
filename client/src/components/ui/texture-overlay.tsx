import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type TextureOverlayProps = HTMLAttributes<HTMLDivElement> & {
  texture?: 'grid' | 'dots' | 'grain' | 'none';
  opacity?: number;
};

const textureClass = {
  grid: 'bg-[linear-gradient(rgba(255,255,255,.16)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.13)_1px,transparent_1px)] bg-[size:34px_34px]',
  dots: 'bg-[radial-gradient(circle,rgba(255,255,255,.22)_1px,transparent_1.5px)] bg-[size:18px_18px]',
  grain: 'bg-[radial-gradient(circle_at_20%_30%,rgba(255,255,255,.28)_0_1px,transparent_1px),radial-gradient(circle_at_80%_70%,rgba(0,0,0,.18)_0_1px,transparent_1px)] bg-[size:11px_11px]',
  none: '',
};

export function TextureOverlay({
  texture = 'grain',
  opacity = 0.45,
  className,
  style,
  ...props
}: TextureOverlayProps) {
  return (
    <div
      aria-hidden="true"
      className={cn('pointer-events-none absolute inset-0', textureClass[texture], className)}
      style={{ opacity, ...style }}
      {...props}
    />
  );
}
