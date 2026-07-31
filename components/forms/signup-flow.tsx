"use client";

import { CheckCircle2, MailCheck, RotateCcw } from "lucide-react";
import {
  useRef,
  useState,
  type ClipboardEvent,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { useRouter } from "next/navigation";

import { PasswordField } from "@/components/forms/password-field";
import { Button } from "@/components/ui/button";
import { signupOtpLength } from "@/features/auth/schemas";

type Step = "details" | "otp" | "success";

function emptyOtpDigits() {
  return Array.from({ length: signupOtpLength }, () => "");
}

function getApiResult(value: unknown) {
  if (!value || typeof value !== "object") return {};
  const record = value as Record<string, unknown>;
  return {
    email: typeof record.email === "string" ? record.email : undefined,
    error: typeof record.error === "string" ? record.error : undefined,
    redirect: typeof record.redirect === "string" ? record.redirect : undefined,
    status: typeof record.status === "string" ? record.status : undefined,
  };
}

async function readApiResult(response: Response) {
  return getApiResult(await response.json().catch(() => null));
}

export function SignUpFlow() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("details");
  const [email, setEmail] = useState("");
  const [digits, setDigits] = useState(emptyOtpDigits);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [destination, setDestination] = useState("/account/submissions");
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  async function createAccount(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    setNotice(null);
    const formData = new FormData(event.currentTarget);

    try {
      const response = await fetch("/api/auth/sign-up", {
        body: JSON.stringify({
          confirmPassword: String(formData.get("confirmPassword") ?? ""),
          displayName: String(formData.get("displayName") ?? ""),
          email: String(formData.get("email") ?? ""),
          password: String(formData.get("password") ?? ""),
        }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      const result = await readApiResult(response);
      if (!response.ok)
        throw new Error(result.error ?? "That account could not be created.");

      if (result.status === "verification_required" && result.email) {
        setEmail(result.email);
        setStep("otp");
        setNotice("Verification code sent. It may take a moment to arrive.");
        return;
      }

      if (result.status === "created") {
        setDestination(result.redirect ?? "/account/submissions");
        setStep("success");
        return;
      }

      throw new Error("The account response was incomplete. Please try again.");
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "That account could not be created.",
      );
    } finally {
      setPending(false);
    }
  }

  function updateDigit(index: number, value: string) {
    const digit = value.replace(/\D/g, "").slice(-1);
    setDigits((current) =>
      current.map((item, itemIndex) => (itemIndex === index ? digit : item)),
    );
    if (digit && index < signupOtpLength - 1)
      inputRefs.current[index + 1]?.focus();
  }

  function handleOtpKeyDown(
    index: number,
    event: KeyboardEvent<HTMLInputElement>,
  ) {
    if (event.key === "Backspace" && !digits[index] && index > 0)
      inputRefs.current[index - 1]?.focus();
  }

  function handleOtpPaste(event: ClipboardEvent<HTMLInputElement>) {
    const pasted = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, signupOtpLength);
    if (!pasted) return;
    event.preventDefault();
    setDigits(
      Array.from(
        { length: signupOtpLength },
        (_, index) => pasted[index] ?? "",
      ),
    );
    inputRefs.current[Math.min(pasted.length, signupOtpLength) - 1]?.focus();
  }

  async function verifyCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setNotice(null);
    const token = digits.join("");
    if (!new RegExp(`^\\d{${signupOtpLength}}$`).test(token)) {
      setError(
        `Enter all ${signupOtpLength} digits from the verification email.`,
      );
      return;
    }

    setPending(true);
    try {
      const response = await fetch("/api/auth/verify-signup", {
        body: JSON.stringify({ email, token }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      const result = await readApiResult(response);
      if (!response.ok)
        throw new Error(
          result.error ?? "That verification code could not be accepted.",
        );
      setDestination(result.redirect ?? "/account/submissions");
      setStep("success");
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "That verification code could not be accepted.",
      );
    } finally {
      setPending(false);
    }
  }

  async function resendCode() {
    setPending(true);
    setError(null);
    setNotice(null);
    try {
      const response = await fetch("/api/auth/resend-signup", {
        body: JSON.stringify({ email }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      const result = await readApiResult(response);
      if (!response.ok)
        throw new Error(result.error ?? "A new code could not be sent yet.");
      setNotice("A fresh verification code was sent.");
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "A new code could not be sent yet.",
      );
    } finally {
      setPending(false);
    }
  }

  if (step === "success") {
    return (
      <div className="py-6 text-center">
        <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary">
          <CheckCircle2 aria-hidden="true" className="size-7" />
        </span>
        <h2 className="mt-6 font-serif text-4xl">Account verified.</h2>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Your email and workspace profile are ready.
        </p>
        <Button
          className="mt-8 min-h-12 w-full"
          onClick={() => router.push(destination)}
        >
          Continue to workspace
        </Button>
      </div>
    );
  }

  if (step === "otp") {
    return (
      <div>
        <span className="grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary">
          <MailCheck aria-hidden="true" className="size-6" />
        </span>
        <p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-primary">
          Verify your email
        </p>
        <h1 className="mt-2 font-serif text-4xl">Enter your code.</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          We sent an {signupOtpLength}-digit verification code to{" "}
          <strong className="text-foreground">{email}</strong>.
        </p>

        {(error || notice) && (
          <p
            aria-live="polite"
            className={`mt-5 rounded-xl border p-3 text-sm leading-6 ${error ? "border-destructive/40 bg-destructive/10 text-destructive" : "border-primary/30 bg-primary/5 text-foreground"}`}
          >
            {error ?? notice}
          </p>
        )}

        <form className="mt-8" onSubmit={verifyCode}>
          <fieldset>
            <legend className="text-sm font-semibold">
              {signupOtpLength}-digit verification code
            </legend>
            <div className="mt-3 grid grid-cols-6 gap-2 sm:gap-3">
              {digits.map((digit, index) => (
                <input
                  aria-label={`Verification digit ${index + 1}`}
                  autoComplete={index === 0 ? "one-time-code" : "off"}
                  className="aspect-square min-w-0 rounded-xl border border-border bg-background text-center text-xl font-bold outline-none transition focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring"
                  inputMode="numeric"
                  key={index}
                  maxLength={1}
                  onChange={(event) =>
                    updateDigit(index, event.currentTarget.value)
                  }
                  onKeyDown={(event) => handleOtpKeyDown(index, event)}
                  onPaste={handleOtpPaste}
                  pattern="[0-9]*"
                  ref={(element) => {
                    inputRefs.current[index] = element;
                  }}
                  value={digit}
                />
              ))}
            </div>
          </fieldset>
          <Button
            className="mt-6 min-h-12 w-full"
            disabled={pending}
            type="submit"
          >
            {pending ? "Verifying..." : "Verify and create account"}
          </Button>
        </form>

        <div className="mt-5 flex flex-col items-center justify-between gap-3 text-sm sm:flex-row">
          <button
            className="font-semibold text-primary"
            disabled={pending}
            onClick={resendCode}
            type="button"
          >
            <RotateCcw aria-hidden="true" className="mr-2 inline size-4" />{" "}
            Resend code
          </button>
          <button
            className="font-semibold text-muted-foreground hover:text-foreground"
            onClick={() => {
              setDigits(emptyOtpDigits());
              setError(null);
              setNotice(null);
              setStep("details");
            }}
            type="button"
          >
            Change email
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-serif text-4xl">Create your workspace</h1>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">
        Save property submissions and follow review updates from one secure
        account.
      </p>
      {error && (
        <p
          aria-live="polite"
          className="mt-5 rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-sm leading-6 text-destructive"
        >
          {error}
        </p>
      )}
      <form className="mt-8 grid gap-5" onSubmit={createAccount}>
        <label className="grid gap-2 text-sm font-semibold">
          Your name
          <input
            className="min-h-12 rounded-xl border border-border bg-background px-3 font-normal outline-none focus-visible:ring-2 focus-visible:ring-ring"
            autoComplete="name"
            name="displayName"
            required
          />
        </label>
        <label className="grid gap-2 text-sm font-semibold">
          Email
          <input
            className="min-h-12 rounded-xl border border-border bg-background px-3 font-normal outline-none focus-visible:ring-2 focus-visible:ring-ring"
            autoComplete="email"
            name="email"
            required
            type="email"
          />
        </label>
        <PasswordField
          autoComplete="new-password"
          label="Password"
          name="password"
        />
        <PasswordField
          autoComplete="new-password"
          label="Confirm password"
          name="confirmPassword"
        />
        <Button className="min-h-12" disabled={pending} type="submit">
          {pending ? "Creating account..." : "Create account"}
        </Button>
      </form>
    </div>
  );
}
