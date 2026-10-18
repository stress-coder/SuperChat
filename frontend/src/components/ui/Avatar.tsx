import { Users } from 'lucide-react';
import '@/assets/css/avatar.css';

interface AvatarProps {
  /** Used for the initials fallback and the image alt text. */
  name: string;
  src?: string;
  size?: 'sm' | 'md' | 'lg';
  /** Shows the green presence dot — direct chats only. */
  isOnline?: boolean;
  /** Groups fall back to a people icon instead of initials. */
  isGroup?: boolean;
}

/** First letter of the first two words — 'Design Guild' becomes 'DG'. */
const initialsOf = (name: string): string =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join('');

const Avatar = ({ name, src, size = 'md', isOnline = false, isGroup = false }: AvatarProps) => {
  return (
    <span className={`avatar avatar--${size}`}>
      {src ? (
        <img className="avatar__image" src={src} alt={name} />
      ) : isGroup ? (
        <Users className="avatar__icon" aria-hidden="true" />
      ) : (
        <span className="avatar__initials" aria-hidden="true">
          {initialsOf(name)}
        </span>
      )}
      {isOnline && <span className="avatar__dot" aria-label="Online" role="img" />}
    </span>
  );
};

export default Avatar;
