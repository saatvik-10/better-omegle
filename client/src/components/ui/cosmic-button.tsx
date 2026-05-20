import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

type CosmicButtonProps = {
  children: ReactNode;
  className?: string;
} & (
  | ({ as?: 'a'; href: string } & AnchorHTMLAttributes<HTMLAnchorElement>)
  | ({ as: 'button'; href?: never } & ButtonHTMLAttributes<HTMLButtonElement>)
);

export function CosmicButton({ children, className, as = 'a', ...props }: CosmicButtonProps) {
  const classes = cn(
    'relative inline-flex h-12 items-center justify-center overflow-hidden rounded-full p-px font-display text-sm font-bold uppercase tracking-[0.16em] text-foam transition duration-300 hover:-translate-y-0.5',
    'before:absolute before:inset-[-140%] before:animate-[spin_4s_linear_infinite] before:bg-[conic-gradient(from_90deg,#d8ff3d,#65f3ff,#ff6b4a,#d8ff3d)]',
    className,
  );

  const inner = (
    <span className="relative z-10 flex h-full w-full items-center justify-center rounded-full bg-ink px-5 shadow-[inset_0_1px_0_rgba(255,255,255,.18)]">
      {children}
    </span>
  );

  if (as === 'button') {
    return (
      <button className={classes} type="button" {...(props as ButtonHTMLAttributes<HTMLButtonElement>)}>
        {inner}
      </button>
    );
  }

  return (
    <a className={classes} {...(props as AnchorHTMLAttributes<HTMLAnchorElement>)}>
      {inner}
    </a>
  );
}
