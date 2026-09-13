import toast from 'react-hot-toast';
import { loginRequest, logoutRequest, registerRequest } from '@/apis/auth.api';
import { AUTH_LOGIN_SUCCESS, AUTH_LOGOUT } from '@/store/constants/authConstants';
import type { AuthAction } from '@/store/slices/authSlice';
import { clearStoredAuth, writeStoredAuth } from '@/utils/authStorage';
import type { LoginFormValues } from '@/validations/login.validation';
import type { RegisterFormValues } from '@/validations/register.validation';

/**
 * Dispatchers — pages call these straight from their event handlers.
 *
 * All side effects live here: network, localStorage, and toasts. Every message
 * shown comes from the backend response; none is written in the frontend.
 * None of them navigate — ProtectedRoute / PublicOnlyRoute redirect off the
 * resulting auth state.
 */

type Dispatch = (action: AuthAction) => void;

export const loginUser =
  (values: LoginFormValues) =>
  async (dispatch: Dispatch): Promise<void> => {
    try {
      const { message, user, accessToken } = await loginRequest(values);

      writeStoredAuth(accessToken, user);
      dispatch({ type: AUTH_LOGIN_SUCCESS, payload: { user, accessToken } });
      toast.success(message);
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

export const registerUser =
  (values: RegisterFormValues) =>
  async (dispatch: Dispatch): Promise<void> => {
    try {
      // /auth/register creates the user but returns no tokens, so sign in with
      // the same credentials to get a session.
      toast.success(await registerRequest(values));
    } catch (error) {
      toast.error((error as Error).message);
      return;
    }

    await loginUser({ email: values.email, password: values.password })(dispatch);
  };

export const logoutUser =
  () =>
  async (dispatch: Dispatch): Promise<void> => {
    // logoutRequest never throws — local state is cleared either way, since
    // staying "signed in" after a failed logout is the worse outcome.
    const message = await logoutRequest();

    clearStoredAuth();
    dispatch({ type: AUTH_LOGOUT });

    if (message) {
      toast.success(message);
    }
  };
