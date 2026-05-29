import type { RefObject } from 'react';

import { TextureButton } from '@/components/ui/texture-button';
import {
  TextureCard,
  TextureCardContent,
  TextureCardHeader,
  TextureSeparator,
} from '@/components/ui/texture-card';

type ChatItem = {
  text: string;
  time: string;
  from: 'me' | 'peer';
};

type ChatPanelProps = {
  connected: boolean;
  msg: string;
  onMsgChange: (value: string) => void;
  onSend: () => void;
  messages: ChatItem[];
  inputRef: RefObject<HTMLInputElement | null>;
};

export function ChatPanel({
  connected,
  msg,
  onMsgChange,
  onSend,
  messages,
  inputRef,
}: ChatPanelProps) {
  return (
    <TextureCard>
      <TextureCardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-display text-xs font-bold uppercase tracking-[0.18em] text-foam/42">
              Chat
            </p>
            <p className="mt-1 text-sm text-foam/60">
              {connected ? 'Say hi (emojis work too)' : 'Available once paired'}
            </p>
          </div>
        </div>
      </TextureCardHeader>

      <TextureSeparator />

      <TextureCardContent className="pt-4">
        <div className="flex flex-col gap-3">
          <div className="max-h-56 space-y-2 overflow-y-auto pr-1">
            {messages.length === 0 ? (
              <div className="rounded-[20px] border border-white/10 bg-white/6 p-4 text-sm text-foam/60">
                {connected ? 'No messages yet.' : 'Waiting for a peer to connect.'}
              </div>
            ) : (
              messages.map((message, idx) => (
                <div
                  key={`${message.time}-${idx}`}
                  className={`flex ${message.from === 'me' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={[
                      'max-w-[85%] rounded-[18px] px-4 py-3 text-sm leading-5',
                      message.from === 'me'
                        ? 'bg-acid text-ink shadow-[0_18px_45px_rgba(220,255,30,.18)]'
                        : 'border border-white/10 bg-white/6 text-foam/80',
                    ].join(' ')}
                  >
                    <div className="whitespace-pre-wrap wrap-break-word">
                      {message.text}
                    </div>
                    <div className="mt-2 text-[0.65rem] font-display uppercase tracking-[0.16em] opacity-60">
                      {new Date(message.time).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <form
            className="flex items-center gap-2"
            onSubmit={(event) => {
              event.preventDefault();

              if (!connected) return;
              if (!msg.trim()) return;

              onSend();
              inputRef.current?.focus();
            }}
          >
            <label className="min-w-0 flex-1">
              <span className="sr-only">Message</span>
              <input
                ref={inputRef}
                value={msg}
                disabled={!connected}
                onChange={(event) => onMsgChange(event.target.value)}
                placeholder={connected ? 'Type a message…' : 'Connecting…'}
                className="h-12 w-full rounded-[20px] border border-white/12 bg-ink/62 px-4 font-display text-sm text-foam outline-none transition placeholder:text-foam/30 focus:border-acid/70 focus:shadow-[0_0_0_4px_rgba(216,255,61,.12)] disabled:opacity-60"
              />
            </label>

            <TextureButton
              size="icon"
              variant="minimal"
              type="submit"
              disabled={!connected || !msg.trim()}
              aria-label="Send message"
              className="shrink-0"
            >
              <span className="relative z-10 text-base leading-none">↵</span>
            </TextureButton>
          </form>
        </div>
      </TextureCardContent>
    </TextureCard>
  );
}
