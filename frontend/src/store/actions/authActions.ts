import { loginRequest, logoutRequest, registerRequest } from '@/apis/auth.api';
import { AUTH_LOGIN_SUCCESS, AUTH_LOGOUT } from '@/store/constants/authConstants';
import type { AuthAction, Credentials } from '@/store/slices/authSlice';
import { clearStoredAuth, writeStoredAuth } from '@/utils/authStorage';
import { showToast } from '@/utils/toast';
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

/** Persist + commit a session. Shared so login and register do it identically. */
const commitSession = (dispatch: Dispatch, credentials: Credentials): void => {
  writeStoredAuth(credentials.accessToken, credentials.user);
  dispatch({ type: AUTH_LOGIN_SUCCESS, payload: credentials });
};

export const loginUser =
  (values: LoginFormValues) =>
  async (dispatch: Dispatch): Promise<void> => {
    try {
      const { message, user, accessToken } = await loginRequest(values);

      commitSession(dispatch, { user, accessToken });
      showToast.success(message);
    } catch (error) {
      showToast.fromError(error);
    }
  };

export const registerUser =
  (values: RegisterFormValues) =>
  async (dispatch: Dispatch): Promise<void> => {
    try {
      // /auth/register creates the user but returns no tokens, so sign in with
      // the same credentials. That login stays silent: the user pressed
      // "Create account" once, so they see one toast — the register message.
      const message = await registerRequest(values);
      const { user, accessToken } = await loginRequest({
        email: values.email,
        password: values.password,
      });

      commitSession(dispatch, { user, accessToken });
      showToast.success(message);
    } catch (error) {
      showToast.fromError(error);
    }
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
      showToast.success(message);
    }
  };
