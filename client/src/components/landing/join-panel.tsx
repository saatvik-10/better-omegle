import { ArrowRight, Shuffle } from 'lucide-react';
import { TextureButton } from '@/components/ui/texture-button';

type JoinPanelProps = {
  name: string;
  onNameChange: (value: string) => void;
  onJoin: () => void;
  disabled?: boolean;
};

export function JoinPanel({ name, onNameChange, onJoin, disabled = false }: JoinPanelProps) {
  return (
    <form
      className="rounded-[28px] border border-white/12 bg-white/[0.065] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,.14)] backdrop-blur-xl"
      onSubmit={(event) => {
        event.preventDefault();
        onJoin();
      }}
    >
      <div className="flex flex-col gap-3 md:flex-row">
        <label className="min-w-0 flex-1">
          <span className="sr-only">Display name</span>
          <input
            value={name}
            onChange={(event) => onNameChange(event.target.value)}
            placeholder="your midnight alias"
            className="h-14 w-full rounded-[20px] border border-white/12 bg-ink/62 px-5 font-display text-base text-foam outline-none transition placeholder:text-foam/30 focus:border-acid/70 focus:shadow-[0_0_0_4px_rgba(216,255,61,.12)]"
          />
        </label>
        <TextureButton disabled={disabled} size="lg" variant="accent" type="submit" className="gap-3">
          <Shuffle className="relative z-10 size-4" />
          <span className="relative z-10 hover:cursor-pointer">Start</span>
          <ArrowRight className="relative z-10 size-4" />
        </TextureButton>
      </div>
    </form>
  );
}
