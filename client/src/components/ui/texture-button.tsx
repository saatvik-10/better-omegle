import type { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type TextureButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'accent' | 'secondary' | 'minimal' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'icon';
};

const variants = {
  primary: 'bg-ink text-foam shadow-[inset_0_1px_0_rgba(255,255,255,.2),0_18px_45px_rgba(3,4,8,.38)] hover:bg-[#101014]',
  accent: 'bg-acid text-ink shadow-[0_0_0_1px_rgba(245,255,109,.35),0_18px_50px_rgba(220,255,30,.25)] hover:bg-[#eeff35]',
  secondary: 'bg-foam/86 text-ink shadow-[inset_0_0_0_1px_rgba(18,19,20,.13),0_15px_30px_rgba(18,19,20,.16)] hover:bg-white',
  minimal: 'bg-white/8 text-foam ring-1 ring-white/15 hover:bg-white/14',
  danger: 'bg-coral text-ink shadow-[0_18px_45px_rgba(255,103,77,.25)] hover:bg-[#ff806a]',
};

const sizes = {
  sm: 'h-10 px-4 text-sm',
  md: 'h-12 px-5 text-sm',
  lg: 'h-14 px-7 text-base',
  icon: 'h-11 w-11 p-0',
};

export function TextureButton({
  className,
  variant = 'primary',
  size = 'md',
  type = 'button',
  ...props
}: TextureButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'group relative inline-flex items-center justify-center overflow-hidden rounded-[18px] font-display font-semibold uppercase tracking-[0.12em] transition duration-300 active:translate-y-px disabled:pointer-events-none disabled:opacity-45',
        'before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_30%_0%,rgba(255,255,255,.44),transparent_32%),linear-gradient(135deg,rgba(255,255,255,.12),transparent_44%)] before:opacity-70',
        'after:absolute after:inset-0 after:bg-[radial-gradient(circle,rgba(255,255,255,.24)_1px,transparent_1px)] after:bg-[size:7px_7px] after:opacity-20',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  );
}
