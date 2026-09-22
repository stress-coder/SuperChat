import RegisterView from '@/components/auth/RegisterView';
import { registerUser } from '@/store/actions/authActions';
import { useAppDispatch } from '@/store/hooks';
import type { RegisterFormValues } from '@/validations/register.validation';

const RegisterPage = () => {
  const dispatch = useAppDispatch();

  // Registering signs the user in, so PublicOnlyRoute handles the hop to /chat.
  const submit = async (values: RegisterFormValues) => {
    await dispatch(registerUser(values));
  };

  return <RegisterView onSubmit={submit} />;
};

export default RegisterPage;
