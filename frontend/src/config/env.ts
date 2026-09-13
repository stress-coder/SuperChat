/**
 * Central environment config — the ONLY place in the app that reads
 * `import.meta.env`. Import { env } from '@/config/env' everywhere else.
 */

const requiredEnvVars = {
  apiUrl: import.meta.env.VITE_API_URL,
  socketUrl: import.meta.env.VITE_SOCKET_URL,
} as const;

const toEnvVarName = (key: string): string =>
  `VITE_${key.replace(/([A-Z])/g, '_$1').toUpperCase()}`;

// Validate at module load so a misconfigured build fails loudly and early,
// rather than sending requests to `undefined/auth/login`.
for (const [key, value] of Object.entries(requiredEnvVars)) {
  if (!value) {
    throw new Error(`Missing required environment variable: ${toEnvVarName(key)}`);
  }
}

export const env = requiredEnvVars;
