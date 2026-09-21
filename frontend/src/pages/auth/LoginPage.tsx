import LoginView from '@/components/auth/LoginView';
import { loginUser } from '@/store/actions/authActions';
import { useAppDispatch } from '@/store/hooks';
import type { LoginFormValues } from '@/validations/login.validation';

const LoginPage = () => {
  const dispatch = useAppDispatch();

  // On success the store flips isAuthenticated and PublicOnlyRoute redirects
  // to /chat — no navigate() needed here.
  const submit = async (values: LoginFormValues) => {
    await dispatch(loginUser(values));
  };

  return <LoginView onSubmit={submit} />;
};

export default LoginPage;
