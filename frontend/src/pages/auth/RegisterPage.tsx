import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import Button from '@/components/ui/Button';
import { registerUser } from '@/store/actions/authActions';
import { useAppDispatch } from '@/store/hooks';
import { registerSchema } from '@/validations/register.validation';
import type { RegisterFormValues } from '@/validations/register.validation';
import heroImage from '@/assets/images/hero.png';
import reactLogo from '@/assets/images/react.svg';
import '@/assets/css/auth.css';

const RegisterPage = () => {
  const dispatch = useAppDispatch();

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

  // Registering signs the user in, so PublicOnlyRoute handles the hop to /chat.
  const submit = async (values: RegisterFormValues) => {
    await dispatch(registerUser(values));
  };

  return (
    <div className="auth-layout">
      <aside className="auth-aside">
        <div className="auth-aside__brand">
          <img className="auth-aside__logo" src={reactLogo} alt="" />
          SuperChat
        </div>
        <h2 className="auth-aside__title">Start chatting in seconds.</h2>
        <p className="auth-aside__text">
          Create an account to message friends and groups in real time, from any device.
        </p>
        <img className="auth-aside__illustration" src={heroImage} alt="" />
      </aside>

      <main className="auth-main">
        <div className="auth-card">
          <h1 className="auth-card__title">Create your account</h1>
          <p className="auth-card__subtitle">It only takes a minute to get set up.</p>

          <form className="auth-form" onSubmit={(event) => void handleSubmit(submit)(event)}>
            <div className="auth-field">
              <label className="auth-field__label" htmlFor="register-name">
                Full name
              </label>
              <input
                id="register-name"
                type="text"
                autoComplete="name"
                placeholder="Jane Doe"
                className={`auth-field__input${errors.name ? ' auth-field__input--invalid' : ''}`}
                aria-invalid={Boolean(errors.name)}
                aria-describedby={errors.name ? 'register-name-error' : undefined}
                {...register('name')}
              />
              {errors.name && (
                <span className="auth-field__error" id="register-name-error" role="alert">
                  {errors.name.message}
                </span>
              )}
            </div>

            <div className="auth-field">
              <label className="auth-field__label" htmlFor="register-username">
                Username
              </label>
              <input
                id="register-username"
                type="text"
                autoComplete="username"
                placeholder="janedoe"
                className={`auth-field__input${errors.username ? ' auth-field__input--invalid' : ''}`}
                aria-invalid={Boolean(errors.username)}
                aria-describedby={errors.username ? 'register-username-error' : undefined}
                {...register('username')}
              />
              {errors.username && (
                <span className="auth-field__error" id="register-username-error" role="alert">
                  {errors.username.message}
                </span>
              )}
            </div>

            <div className="auth-field">
              <label className="auth-field__label" htmlFor="register-email">
                Email
              </label>
              <input
                id="register-email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                className={`auth-field__input${errors.email ? ' auth-field__input--invalid' : ''}`}
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? 'register-email-error' : undefined}
                {...register('email')}
              />
              {errors.email && (
                <span className="auth-field__error" id="register-email-error" role="alert">
                  {errors.email.message}
                </span>
              )}
            </div>

            <div className="auth-field">
              <label className="auth-field__label" htmlFor="register-password">
                Password
              </label>
              <input
                id="register-password"
                type="password"
                autoComplete="new-password"
                placeholder="At least 8 characters"
                className={`auth-field__input${errors.password ? ' auth-field__input--invalid' : ''}`}
                aria-invalid={Boolean(errors.password)}
                aria-describedby={errors.password ? 'register-password-error' : undefined}
                {...register('password')}
              />
              {errors.password && (
                <span className="auth-field__error" id="register-password-error" role="alert">
                  {errors.password.message}
                </span>
              )}
            </div>

            <div className="auth-field">
              <label className="auth-field__label" htmlFor="register-confirm-password">
                Confirm password
              </label>
              <input
                id="register-confirm-password"
                type="password"
                autoComplete="new-password"
                placeholder="Re-enter your password"
                className={`auth-field__input${errors.confirmPassword ? ' auth-field__input--invalid' : ''}`}
                aria-invalid={Boolean(errors.confirmPassword)}
                aria-describedby={
                  errors.confirmPassword ? 'register-confirm-password-error' : undefined
                }
                {...register('confirmPassword')}
              />
              {errors.confirmPassword && (
                <span
                  className="auth-field__error"
                  id="register-confirm-password-error"
                  role="alert"
                >
                  {errors.confirmPassword.message}
                </span>
              )}
            </div>

            <Button type="submit" fullWidth isLoading={isSubmitting}>
              Create account
            </Button>
          </form>

          <p className="auth-switch">
            Already have an account?{' '}
            <Link className="auth-switch__link" to="/login">
              Sign in
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
};

export default RegisterPage;
