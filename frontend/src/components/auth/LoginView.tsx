import AuthCard from '@/components/auth/AuthCard';
import AuthLayout from '@/components/auth/AuthLayout';
import LoginForm from '@/components/auth/LoginForm';
import type { LoginFormValues } from '@/validations/login.validation';

interface LoginViewProps {
  onSubmit: (values: LoginFormValues) => Promise<void>;
}

/** Everything the /login route renders. The page only supplies the submit handler. */
const LoginView = ({ onSubmit }: LoginViewProps) => {
  return (
    <AuthLayout
      title="Your conversations, everywhere."
      text="Real-time messaging that keeps every device in sync — fast, private, and always up to date."
    >
      <AuthCard
        title="Welcome back"
        subtitle="Sign in to continue to your chats."
        footerText="Don't have an account?"
        footerLinkLabel="Create one"
        footerLinkTo="/register"
      >
        <LoginForm onSubmit={onSubmit} />
      </AuthCard>
    </AuthLayout>
  );
};

export default LoginView;
