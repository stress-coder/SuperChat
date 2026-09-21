import type { ReactNode } from 'react';
import heroImage from '@/assets/images/hero.png';
import reactLogo from '@/assets/images/react.svg';
import '@/assets/css/auth.css';

interface AuthLayoutProps {
  /** Headline shown in the branded aside, beside the form. */
  title: string;
  text: string;
  children: ReactNode;
}

/** The two-column shell shared by the login and register screens. */
const AuthLayout = ({ title, text, children }: AuthLayoutProps) => {
  return (
    <div className="auth-layout">
      <aside className="auth-aside">
        <div className="auth-aside__brand">
          <img className="auth-aside__logo" src={reactLogo} alt="" />
          SuperChat
        </div>
        <h2 className="auth-aside__title">{title}</h2>
        <p className="auth-aside__text">{text}</p>
        <img className="auth-aside__illustration" src={heroImage} alt="" />
      </aside>

      <main className="auth-main">{children}</main>
    </div>
  );
};

export default AuthLayout;
