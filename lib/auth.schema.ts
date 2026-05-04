import { z } from 'zod';

export const loginSchema = z.object({
    email: z
        .email("Not valid email"),
    password: z
        .string()
        .min(8, 'Password must be 8 characters length'),
});

export const registerSchema = z
    .object({
        name: z
            .string()
            .min(2, 'Name must be 2 character long at least')
            .max(80, 'Max 80 characters'),
        organizationName: z
            .string()
            .min(2, 'Organization name must be 2 character long at least')
            .max(50, 'Max 50 characters'),
        email: z
            .email(),
        password: z
            .string()
            .min(8, 'Password must be 8 characters length')
            .regex(/[A-Z]/, 'Must be one character Uppercase ')
            .regex(/[0-9]/, 'Must be one number'),
        confirmPassword: z.string().min(1, 'Confirm password'),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: 'Passwords are not the same',
        path: ['confirmPassword'],
    });

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
