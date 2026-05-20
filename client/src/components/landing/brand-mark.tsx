import { Sparkles } from 'lucide-react';

export function BrandMark() {
  return (
    <div className="flex items-center gap-3">
      <div className="grid size-10 place-items-center rounded-[14px] bg-acid text-ink shadow-[0_12px_30px_rgba(216,255,61,.3)]">
        <Sparkles className="size-5" />
      </div>
      <div className="text-left leading-none">
        <p className="font-display text-[0.72rem] font-bold uppercase tracking-[0.24em] text-foam/60">
          Better
        </p>
        <p className="font-serif text-2xl italic text-foam">Omegle</p>
      </div>
    </div>
  );
}
