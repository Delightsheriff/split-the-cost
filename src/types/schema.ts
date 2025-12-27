import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Min 6 characters"),
});

export type LoginForm = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Min 6 characters"),
});

export type RegisterForm = z.infer<typeof registerSchema>;

export const groupSchema = z.object({
  name: z.string().min(2, "Group name must be at least 2 characters"),
  members: z
    .array(z.string().email("Invalid email"))
    .min(1, "Add at least one member"),
});

export type GroupForm = z.infer<typeof groupSchema>;
