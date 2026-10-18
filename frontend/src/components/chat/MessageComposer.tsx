import { useEffect, useRef, useState } from 'react';
import { Paperclip, Send, Smile } from 'lucide-react';
import IconButton from '@/components/ui/IconButton';

interface MessageComposerProps {
  onSend: (text: string) => void;
}

/**
 * The draft is reset by remounting, not by an effect — the parent keys this
 * component on the conversation id, so switching chats starts a fresh draft.
 */
const MessageComposer = ({ onSend }: MessageComposerProps) => {
  const [draft, setDraft] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Grow with the content up to the max-height the stylesheet sets, then scroll.
  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;

    input.style.height = 'auto';
    // `box-sizing: border-box` means the borders have to be added back, or the
    // textarea ends up two pixels short and shows a scrollbar on one line.
    input.style.height = `${input.scrollHeight + 2}px`;
  }, [draft]);

  const send = () => {
    const text = draft.trim();
    if (!text) return;

    onSend(text);
    setDraft('');
  };

  return (
    <div className="composer">
      <IconButton icon={Paperclip} label="Attach a file" />
      <IconButton icon={Smile} label="Insert an emoji" />

      <textarea
        ref={inputRef}
        className="composer__input"
        rows={1}
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={(event) => {
          // Enter sends; Shift+Enter keeps the newline.
          if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            send();
          }
        }}
        placeholder="Type a message"
        aria-label="Type a message"
      />

      <IconButton
        icon={Send}
        label="Send message"
        variant="accent"
        onClick={send}
        disabled={draft.trim().length === 0}
      />
    </div>
  );
};

export default MessageComposer;
