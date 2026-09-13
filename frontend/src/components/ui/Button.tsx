import type { ButtonHTMLAttributes, ReactNode } from 'react';
import '../../assets/css/button.css';

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className'> {
  children: ReactNode;
  /** Fills the width of its container — used by the auth forms. */
  fullWidth?: boolean;
  /** Shows a spinner and blocks interaction while an action is in flight. */
  isLoading?: boolean;
}

const Button = ({
  children,
  fullWidth = false,
  isLoading = false,
  disabled = false,
  type = 'button',
  ...rest
}: ButtonProps) => {
  return (
    <button
      {...rest}
      type={type}
      className={`button${fullWidth ? ' button--full' : ''}`}
      disabled={disabled || isLoading}
      aria-busy={isLoading}
    >
      {isLoading && <span className="button__spinner" aria-hidden="true" />}
      {children}
    </button>
  );
};

export default Button;
