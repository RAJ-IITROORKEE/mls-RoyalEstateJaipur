import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground hover:bg-primary-hover hover:text-primary-hover-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-accent hover:text-accent-foreground",
        outline: "border border-border bg-card text-foreground hover:bg-muted",
        ghost: "text-foreground hover:bg-muted",
      },
      size: {
        default: "",
        icon: "w-11 px-0",
        small: "min-h-9 rounded-lg px-3 text-xs",
      },
    },
    defaultVariants: { size: "default", variant: "primary" },
  },
);

export function buttonVariantsClass(props?: VariantProps<typeof buttonVariants>) {
  return buttonVariants(props);
}

export function Button({ className, asChild = false, size, variant, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Component = asChild ? Slot : "button";
  return <Component className={cn(buttonVariants({ size, variant }), className)} {...props} />;
}
