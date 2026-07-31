import { describe, expect, it } from "vitest";

import {
  authCredentialsSchema,
  getPostSignInRedirect,
  getSafeRedirectPath,
  signupOtpSchema,
} from "@/features/auth/schemas";
import {
  getSignInErrorMessage,
  getSignUpErrorMessage,
} from "@/features/auth/errors";
import { enquirySchema } from "@/features/enquiries/schemas";

describe("auth trust boundaries", () => {
  it("rejects external redirect targets", () => {
    expect(getSafeRedirectPath("https://example.com", "/admin")).toBe("/admin");
    expect(getSafeRedirectPath("//example.com", "/admin")).toBe("/admin");
    expect(getSafeRedirectPath("/properties", "/admin")).toBe("/properties");
  });

  it("routes successful sign-ins to the correct workspace", () => {
    expect(getPostSignInRedirect("", "SUPER_ADMIN")).toBe("/admin");
    expect(getPostSignInRedirect("", "USER")).toBe("/account/submissions");
    expect(getPostSignInRedirect("/admin/settings", "SUPER_ADMIN")).toBe(
      "/admin/settings",
    );
    expect(getPostSignInRedirect("https://example.com", "SUPER_ADMIN")).toBe(
      "/admin",
    );
  });

  it("requires a valid email and minimum password", () => {
    expect(
      authCredentialsSchema.safeParse({
        email: "owner@example.com",
        password: "secure-pass",
      }).success,
    ).toBe(true);
    expect(
      authCredentialsSchema.safeParse({
        email: "not-an-email",
        password: "short",
      }).success,
    ).toBe(false);
  });

  it("requires matching signup passwords", async () => {
    const { signUpSchema } = await import("@/features/auth/schemas");
    expect(
      signUpSchema.safeParse({
        displayName: "Asha Owner",
        email: "asha@example.com",
        password: "secure-pass",
        confirmPassword: "secure-pass",
      }).success,
    ).toBe(true);
    expect(
      signUpSchema.safeParse({
        displayName: "Asha Owner",
        email: "asha@example.com",
        password: "secure-pass",
        confirmPassword: "different-pass",
      }).success,
    ).toBe(false);
  });

  it("accepts only the configured six-digit signup verification code", () => {
    expect(
      signupOtpSchema.safeParse({ email: "owner@example.com", token: "123456" })
        .success,
    ).toBe(true);
    expect(
      signupOtpSchema.safeParse({ email: "owner@example.com", token: "12345" })
        .success,
    ).toBe(false);
    expect(
      signupOtpSchema.safeParse({ email: "owner@example.com", token: "12345a" })
        .success,
    ).toBe(false);
  });

  it("maps provider auth failures without exposing raw errors", () => {
    expect(
      getSignInErrorMessage({ message: "Email not confirmed", status: 400 }),
    ).toBe("Confirm your email address before signing in.");
    expect(
      getSignInErrorMessage({ message: "Too many requests", status: 429 }),
    ).toBe("Too many sign-in attempts. Wait a few minutes and try again.");
    expect(
      getSignInErrorMessage({
        message: "Invalid login credentials",
        status: 400,
      }),
    ).toBe("Email or password could not be verified.");
    expect(
      getSignInErrorMessage({ message: "database unavailable", status: 503 }),
    ).toBe("Authentication is temporarily unavailable. Try again shortly.");
  });

  it("maps signup provider failures to actionable safe messages", () => {
    expect(
      getSignUpErrorMessage({
        code: "unexpected_failure",
        message: "Error sending confirmation email",
        status: 500,
      }),
    ).toBe(
      "The verification email could not be sent. Check the Supabase SMTP sender settings and try again.",
    );
    expect(
      getSignUpErrorMessage({
        code: "over_email_send_rate_limit",
        message: "Email rate limit exceeded",
        status: 429,
      }),
    ).toBe(
      "Too many signup or email requests. Wait a few minutes before trying again.",
    );
    expect(
      getSignUpErrorMessage({
        code: "weak_password",
        message: "Password should be stronger",
        status: 422,
      }),
    ).toBe("Use a stronger password with at least 8 characters.");
    expect(getSignUpErrorMessage({ message: "{}", status: 500 })).toBe(
      "The verification email could not be sent. Check the Supabase SMTP sender settings and try again.",
    );
  });
});

describe("enquiry trust boundary", () => {
  it("requires consent and rejects the honeypot", () => {
    const base = {
      contactName: "Asha Owner",
      email: "asha@example.com",
      message: "I would like to understand the next step.",
      consent: "on" as const,
      website: "",
    };
    expect(enquirySchema.safeParse(base).success).toBe(true);
    expect(enquirySchema.safeParse({ ...base, website: "bot" }).success).toBe(
      false,
    );
    expect(enquirySchema.safeParse({ ...base, consent: "" }).success).toBe(
      false,
    );
  });
});
