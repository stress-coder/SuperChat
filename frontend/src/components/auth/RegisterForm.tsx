import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import Button from '@/components/ui/Button';
import TextField from '@/components/ui/TextField';
import { registerSchema } from '@/validations/register.validation';
import type { RegisterFormValues } from '@/validations/register.validation';

interface RegisterFormProps {
  onSubmit: (values: RegisterFormValues) => Promise<void>;
}

/** The sign-up form: owns its field state and validation, reports values upward. */
const RegisterForm = ({ onSubmit }: RegisterFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  return (
    <form className="auth-form" onSubmit={(event) => void handleSubmit(onSubmit)(event)}>
      <TextField
        id="register-name"
        label="Full name"
        autoComplete="name"
        placeholder="Jane Doe"
        error={errors.name?.message}
        registration={register('name')}
      />

      <TextField
        id="register-username"
        label="Username"
        autoComplete="username"
        placeholder="janedoe"
        error={errors.username?.message}
        registration={register('username')}
      />

      <TextField
        id="register-email"
        label="Email"
        type="email"
        autoComplete="email"
        placeholder="you@example.com"
        error={errors.email?.message}
        registration={register('email')}
      />

      <TextField
        id="register-password"
        label="Password"
        type="password"
        autoComplete="new-password"
        placeholder="At least 8 characters"
        error={errors.password?.message}
        registration={register('password')}
      />

      <TextField
        id="register-confirm-password"
        label="Confirm password"
        type="password"
        autoComplete="new-password"
        placeholder="Re-enter your password"
        error={errors.confirmPassword?.message}
        registration={register('confirmPassword')}
      />

      <Button type="submit" fullWidth isLoading={isSubmitting}>
        Create account
      </Button>
    </form>
  );
};

export default RegisterForm;
