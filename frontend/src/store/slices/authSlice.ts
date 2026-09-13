import type { UnknownAction } from '@reduxjs/toolkit';
import type { User } from '@/types/user.types';
import { readStoredAuth } from '@/utils/authStorage';
import { AUTH_LOGIN_SUCCESS, AUTH_LOGOUT } from '@/store/constants/authConstants';

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
}

export interface Credentials {
  user: User;
  accessToken: string;
}

/** Every action this reducer understands. The union makes a typo'd type a build error. */
export type AuthAction =
  | { type: typeof AUTH_LOGIN_SUCCESS; payload: Credentials }
  | { type: typeof AUTH_LOGOUT };

// Hydrated synchronously so the first render already knows whether the visitor
// is signed in — no loading gate, and no flash of the login page on reload.
const stored = readStoredAuth();

const initialState: AuthState = {
  user: stored.user,
  accessToken: stored.accessToken,
  isAuthenticated: Boolean(stored.accessToken && stored.user),
};

/**
 * Pure reducer — no API calls, no localStorage, no navigation, no toasts.
 * Side effects belong in store/actions/authActions.ts.
 *
 * There is no Immer here (this is a plain reducer, not createSlice), so every
 * case must return a NEW object. Mutating `state` would skip re-renders.
 */
const authReducer = (state: AuthState = initialState, action: UnknownAction): AuthState => {
  // Redux also dispatches its own init actions through here, hence UnknownAction
  // on the signature. Narrowing to AuthAction gives each case below full typing.
  const authAction = action as AuthAction;

  switch (authAction.type) {
    case AUTH_LOGIN_SUCCESS:
      return {
        user: authAction.payload.user,
        accessToken: authAction.payload.accessToken,
        isAuthenticated: true,
      };

    case AUTH_LOGOUT:
      return {
        user: null,
        accessToken: null,
        isAuthenticated: false,
      };

    default:
      return state;
  }
};

export default authReducer;
