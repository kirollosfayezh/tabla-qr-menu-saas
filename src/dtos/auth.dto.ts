import { z } from 'zod';

const passwordRules = z
  .string()
  .min(8, 'At least 8 characters')
  .max(200, 'Too long')
  .regex(/[A-Za-z]/, 'Must contain a letter')
  .regex(/[0-9]/, 'Must contain a number');

/** Sign-up payload accepted from the client. */
export const SignUpSchema = z
  .object({
    name: z.string().trim().min(1, 'Name is required').max(100),
    email: z.string().trim().toLowerCase().email('Enter a valid email'),
    password: passwordRules,
    confirmPassword: z.string(),
    turnstileToken: z.string().min(1, 'Bot check required'),
  })
  .refine((d) => d.password === d.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  });

export type SignUpDTO = z.infer<typeof SignUpSchema>;

/** Sign-in payload accepted from the client. */
export const SignInSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1, 'Password required').max(200),
  turnstileToken: z.string().min(1, 'Bot check required'),
});

export type SignInDTO = z.infer<typeof SignInSchema>;
