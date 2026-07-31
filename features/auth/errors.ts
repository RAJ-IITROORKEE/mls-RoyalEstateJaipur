type AuthErrorLike = {
  code?: string;
  message?: string;
  status?: number;
} | null;

export function getSignUpErrorMessage(error: AuthErrorLike) {
  const code = error?.code?.toLowerCase() ?? "";
  const message = error?.message?.toLowerCase() ?? "";

  if (
    error?.status === 429 ||
    code.includes("rate_limit") ||
    message.includes("rate limit") ||
    message.includes("too many")
  ) {
    return "Too many signup or email requests. Wait a few minutes before trying again.";
  }

  if (
    code.includes("email_send") ||
    code.includes("smtp") ||
    message.includes("sending confirmation email") ||
    message.includes("send email") ||
    message.includes("smtp") ||
    (error?.status === 500 && message === "{}")
  ) {
    return "The verification email could not be sent. Check the Supabase SMTP sender settings and try again.";
  }

  if (code.includes("weak_password") || message.includes("password should") || message.includes("weak password")) {
    return "Use a stronger password with at least 8 characters.";
  }

  if (error?.status !== undefined && error.status >= 500) {
    return "Account creation is temporarily unavailable. Try again shortly.";
  }

  return "That account could not be created. Check the email address and try again.";
}

export function getSignInErrorMessage(error: AuthErrorLike) {
  const message = error?.message?.toLowerCase() ?? "";

  if (message.includes("email not confirmed") || message.includes("email_not_confirmed")) {
    return "Confirm your email address before signing in.";
  }

  if (error?.status === 429 || message.includes("too many") || message.includes("rate limit")) {
    return "Too many sign-in attempts. Wait a few minutes and try again.";
  }

  if (error?.status !== undefined && error.status >= 500) {
    return "Authentication is temporarily unavailable. Try again shortly.";
  }

  return "Email or password could not be verified.";
}
