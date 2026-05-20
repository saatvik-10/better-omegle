import type { ReactNode } from 'react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import { TextureCard } from '@/components/ui/texture-card';

type SignalCardProps = {
  label: string;
  value: string;
  children?: ReactNode;
  className?: string;
  delay?: number;
};

export function SignalCard({ label, value, children, className, delay = 0 }: SignalCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }}
    >
      <TextureCard className={cn('p-5', className)}>
        <p className="font-display text-[0.68rem] font-bold uppercase tracking-[0.22em] text-foam/48">
          {label}
        </p>
        <p className="mt-2 font-serif text-4xl italic leading-none text-foam">{value}</p>
        {children ? <div className="mt-4 text-sm leading-6 text-foam/62">{children}</div> : null}
      </TextureCard>
    </motion.div>
  );
}
