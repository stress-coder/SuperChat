import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import Button from '@/components/ui/Button';
import TextField from '@/components/ui/TextField';
import { loginSchema } from '@/validations/login.validation';
import type { LoginFormValues } from '@/validations/login.validation';

interface LoginFormProps {
  onSubmit: (values: LoginFormValues) => Promise<void>;
}

/** The sign-in form: owns its field state and validation, reports values upward. */
const LoginForm = ({ onSubmit }: LoginFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  return (
    <form className="auth-form" onSubmit={(event) => void handleSubmit(onSubmit)(event)}>
      <TextField
        id="login-email"
        label="Email"
        type="email"
        autoComplete="email"
        placeholder="you@example.com"
        error={errors.email?.message}
        registration={register('email')}
      />

      <TextField
        id="login-password"
        label="Password"
        type="password"
        autoComplete="current-password"
        placeholder="••••••••"
        error={errors.password?.message}
        registration={register('password')}
      />

      <Button type="submit" fullWidth isLoading={isSubmitting}>
        Sign in
      </Button>
    </form>
  );
};

export default LoginForm;
