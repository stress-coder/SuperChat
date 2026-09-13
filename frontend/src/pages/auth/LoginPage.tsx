import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import Button from '@/components/ui/Button';
import { loginUser } from '@/store/actions/authActions';
import { useAppDispatch } from '@/store/hooks';
import { loginSchema } from '@/validations/login.validation';
import type { LoginFormValues } from '@/validations/login.validation';
import heroImage from '@/assets/images/hero.png';
import reactLogo from '@/assets/images/react.svg';
import '@/assets/css/auth.css';

const LoginPage = () => {
  const dispatch = useAppDispatch();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  // On success the store flips isAuthenticated and PublicOnlyRoute redirects
  // to /chat — no navigate() needed here.
  const submit = async (values: LoginFormValues) => {
    await dispatch(loginUser(values));
  };

  return (
    <div className="auth-layout">
      <aside className="auth-aside">
        <div className="auth-aside__brand">
          <img className="auth-aside__logo" src={reactLogo} alt="" />
          SuperChat
        </div>
        <h2 className="auth-aside__title">Your conversations, everywhere.</h2>
        <p className="auth-aside__text">
          Real-time messaging that keeps every device in sync — fast, private, and always up to
          date.
        </p>
        <img className="auth-aside__illustration" src={heroImage} alt="" />
      </aside>

      <main className="auth-main">
        <div className="auth-card">
          <h1 className="auth-card__title">Welcome back</h1>
          <p className="auth-card__subtitle">Sign in to continue to your chats.</p>

          <form className="auth-form" onSubmit={(event) => void handleSubmit(submit)(event)}>
            <div className="auth-field">
              <label className="auth-field__label" htmlFor="login-email">
                Email
              </label>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                className={`auth-field__input${errors.email ? ' auth-field__input--invalid' : ''}`}
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? 'login-email-error' : undefined}
                {...register('email')}
              />
              {errors.email && (
                <span className="auth-field__error" id="login-email-error" role="alert">
                  {errors.email.message}
                </span>
              )}
            </div>

            <div className="auth-field">
              <label className="auth-field__label" htmlFor="login-password">
                Password
              </label>
              <input
                id="login-password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                className={`auth-field__input${errors.password ? ' auth-field__input--invalid' : ''}`}
                aria-invalid={Boolean(errors.password)}
                aria-describedby={errors.password ? 'login-password-error' : undefined}
                {...register('password')}
              />
              {errors.password && (
                <span className="auth-field__error" id="login-password-error" role="alert">
                  {errors.password.message}
                </span>
              )}
            </div>

            <Button type="submit" fullWidth isLoading={isSubmitting}>
              Sign in
            </Button>
          </form>

          <p className="auth-switch">
            Don&apos;t have an account?{' '}
            <Link className="auth-switch__link" to="/register">
              Create one
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
};

export default LoginPage;
