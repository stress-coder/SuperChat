import type { ButtonHTMLAttributes } from 'react';
import type { LucideIcon } from 'lucide-react';
import '@/assets/css/iconButton.css';

interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className'> {
  /** A lucide icon component — rendered at the size the variant dictates. */
  icon: LucideIcon;
  /** Required: the button shows no text, so this is its accessible name. */
  label: string;
  /** `accent` is the filled circle used by the composer's send button. */
  variant?: 'plain' | 'accent';
}

/**
 * An icon-only button. The shared Button component is a single filled variant
 * that deliberately blocks `className`, so icon affordances need their own
 * primitive rather than a growing pile of Button props.
 */
const IconButton = ({
  icon: Icon,
  label,
  variant = 'plain',
  type = 'button',
  ...rest
}: IconButtonProps) => {
  return (
    <button {...rest} type={type} className={`icon-button icon-button--${variant}`} title={label}>
      <Icon className="icon-button__glyph" aria-hidden="true" />
      <span className="icon-button__label">{label}</span>
    </button>
  );
};

export default IconButton;
