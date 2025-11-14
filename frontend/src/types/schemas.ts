import { z } from "zod";

// Email validation schema
export const emailSchema = z.email("Please enter a valid email address");

// Password validation schema with strength requirements
const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number");

// Confirm password validation
const confirmPasswordSchema = z.string().min(8, "Please confirm your password");

// Terms and conditions validation
const termsSchema = z.boolean().refine((val) => val === true, {
  message: "You must accept the terms and conditions",
});

// Login form schema
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(8, "Password is required"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// Signup form schema
export const signupSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: confirmPasswordSchema,
    acceptTerms: termsSchema,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"], // This sets which field the error appears on
  });

export type SignupFormData = z.infer<typeof signupSchema>;
