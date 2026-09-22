import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface AuthCardProps {
  title: string;
  subtitle: string;
  /** The form itself. */
  children: ReactNode;
  /** Footer that sends the visitor to the other auth screen. */
  footerText: string;
  footerLinkLabel: string;
  footerLinkTo: string;
}

/** The card holding an auth form: heading pair, the form, and the switch link. */
const AuthCard = ({
  title,
  subtitle,
  children,
  footerText,
  footerLinkLabel,
  footerLinkTo,
}: AuthCardProps) => {
  return (
    <div className="auth-card">
      <h1 className="auth-card__title">{title}</h1>
      <p className="auth-card__subtitle">{subtitle}</p>

      {children}

      <p className="auth-switch">
        {footerText}{' '}
        <Link className="auth-switch__link" to={footerLinkTo}>
          {footerLinkLabel}
        </Link>
      </p>
    </div>
  );
};

export default AuthCard;
