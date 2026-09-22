import { z } from 'zod';

/** Mirrors backend/src/modules/auth/dto/register.dto.ts */
export const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, 'Name must be between 2 and 50 characters')
      .max(50, 'Name must be between 2 and 50 characters'),
    username: z
      .string()
      .trim()
      .min(3, 'Username must be between 3 and 30 characters')
      .max(30, 'Username must be between 3 and 30 characters')
      .regex(
        /^[a-zA-Z0-9_.-]+$/,
        'Username may only contain letters, numbers, underscores, dots, and hyphens',
      ),
    email: z.email('Please enter a valid email'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    // Client-side only — never sent: the backend's ValidationPipe runs with
    // forbidNonWhitelisted, so an extra field turns a valid signup into a 400.
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;
