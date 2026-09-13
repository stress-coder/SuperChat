import { z } from 'zod';

/** Mirrors backend/src/modules/auth/dto/login.dto.ts */
export const loginSchema = z.object({
  email: z.email('Please enter a valid email'),
  // LoginDto only requires a non-empty string. A length rule here would lock out
  // any account whose password predates the 8-char register rule.
  password: z.string().min(1, 'Password is required'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
