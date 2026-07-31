import { z } from "zod";

export const authCredentialsSchema = z.object({
  email: z.string().trim().email().max(320),
  password: z.string().min(8).max(128),
});

export const signUpSchema = authCredentialsSchema
  .extend({
    displayName: z.string().trim().min(2).max(120),
    confirmPassword: z.string().min(8).max(128),
  })
  .refine((input) => input.password === input.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export const resetPasswordSchema = z.object({
  password: z.string().min(8).max(128),
});

export const signupOtpLength = 6;

export const signupOtpSchema = z.object({
  email: z.string().trim().email().max(320),
  token: z.string().regex(/^\d+$/).length(signupOtpLength),
});

export const signupResendSchema = signupOtpSchema.pick({ email: true });

export function getFormValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

export function getSafeRedirectPath(
  value: string | null | undefined,
  fallback = "/",
) {
  if (
    !value ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.includes("\\")
  )
    return fallback;
  return value;
}

export function getPostSignInRedirect(
  value: string | null | undefined,
  role: string,
) {
  const roleDefault = role === "USER" ? "/account/submissions" : "/admin";
  return value ? getSafeRedirectPath(value, roleDefault) : roleDefault;
}
