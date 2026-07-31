"use client";

import { Eye, EyeOff } from "lucide-react";
import { useId, useState } from "react";

type PasswordFieldProps = {
  autoComplete: string;
  label: string;
  name: string;
};

export function PasswordField({
  autoComplete,
  label,
  name,
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);
  const inputId = useId();
  return (
    <div className="grid gap-2 text-sm font-semibold">
      <label htmlFor={inputId}>{label}</label>
      <span
        className="password-field flex min-h-12 items-center rounded-xl border border-border bg-background transition-[border-color,box-shadow] focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20"
        data-password-field
      >
        <input
          className="min-w-0 flex-1 bg-transparent px-3 font-normal outline-none"
          autoComplete={autoComplete}
          id={inputId}
          minLength={8}
          name={name}
          required
          type={visible ? "text" : "password"}
        />
        <button
          aria-label={
            visible
              ? `Hide ${label.toLowerCase()}`
              : `Show ${label.toLowerCase()}`
          }
          className="grid min-h-11 min-w-11 place-items-center rounded-r-xl text-muted-foreground hover:text-foreground"
          onClick={() => setVisible((value) => !value)}
          type="button"
        >
          {visible ? (
            <EyeOff aria-hidden="true" className="size-4" />
          ) : (
            <Eye aria-hidden="true" className="size-4" />
          )}
        </button>
      </span>
    </div>
  );
}
