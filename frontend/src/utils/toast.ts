import toast from 'react-hot-toast';

/**
 * The one place the app talks to react-hot-toast.
 *
 * Nothing else may import the library directly — import { showToast } from
 * '@/utils/toast' instead, so duration, styling, and severity rules stay in a
 * single place. Plain module, not a hook, so Redux actions can call it too.
 *
 * Messages always come from the backend; nothing here writes user-facing text.
 */

const SUCCESS_MS = 3000;
const PROBLEM_MS = 5000;

/** Client-side problems (400 validation, 409 conflict) are warnings, not failures. */
const isClientProblem = (status: number): boolean => status >= 400 && status < 500;

/** Reads the `status` carried by ApiError without coupling this module to the api layer. */
const statusOf = (error: unknown): number => {
  if (typeof error === 'object' && error !== null) {
    const status: unknown = Reflect.get(error, 'status');
    if (typeof status === 'number') {
      return status;
    }
  }

  return 0;
};

const messageOf = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);

export const showToast = {
  success: (message: string): void => {
    toast.success(message, { className: 'toast toast--success', duration: SUCCESS_MS });
  },

  error: (message: string): void => {
    toast.error(message, { className: 'toast toast--error', duration: PROBLEM_MS });
  },

  warning: (message: string): void => {
    toast(message, { className: 'toast toast--warning', duration: PROBLEM_MS, icon: '⚠️' });
  },

  /**
   * Shows a caught request failure at the right severity: 4xx means the user or
   * the request was at fault (warning), anything else is a real failure (error).
   */
  fromError: (error: unknown): void => {
    const message = messageOf(error);

    if (isClientProblem(statusOf(error))) {
      showToast.warning(message);
      return;
    }

    showToast.error(message);
  },
};

export default showToast;
