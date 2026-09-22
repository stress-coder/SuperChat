import AuthCard from '@/components/auth/AuthCard';
import AuthLayout from '@/components/auth/AuthLayout';
import RegisterForm from '@/components/auth/RegisterForm';
import type { RegisterFormValues } from '@/validations/register.validation';

interface RegisterViewProps {
  onSubmit: (values: RegisterFormValues) => Promise<void>;
}

/** Everything the /register route renders. The page only supplies the submit handler. */
const RegisterView = ({ onSubmit }: RegisterViewProps) => {
  return (
    <AuthLayout
      title="Start chatting in seconds."
      text="Create an account to message friends and groups in real time, from any device."
    >
      <AuthCard
        title="Create your account"
        subtitle="It only takes a minute to get set up."
        footerText="Already have an account?"
        footerLinkLabel="Sign in"
        footerLinkTo="/login"
      >
        <RegisterForm onSubmit={onSubmit} />
      </AuthCard>
    </AuthLayout>
  );
};

export default RegisterView;
