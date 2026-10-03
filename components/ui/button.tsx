import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "group/button inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition-[background-color,border-color,box-shadow,color,transform] duration-150 active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:bg-muted disabled:text-muted-foreground motion-reduce:transform-none motion-reduce:transition-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_[data-icon=inline-end]]:transition-transform [&_[data-icon=inline-end]]:duration-150 hover:[&_[data-icon=inline-end]]:translate-x-0.5 focus-visible:[&_[data-icon=inline-end]]:translate-x-0.5 motion-reduce:[&_[data-icon=inline-end]]:transform-none",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary-hover hover:text-primary-hover-foreground",
        primary:
          "bg-primary text-primary-foreground hover:bg-primary-hover hover:text-primary-hover-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-accent hover:text-accent-foreground",
        outline: "border border-input bg-card text-foreground hover:bg-muted",
        ghost: "text-foreground hover:bg-muted",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive-hover",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "",
        icon: "size-11 px-0",
        "icon-sm": "size-11 px-0",
        "icon-xs": "size-11 px-0",
        "icon-lg": "size-12 px-0",
        small: "min-h-11 rounded-lg px-3 text-sm",
        sm: "min-h-11 rounded-lg px-3 text-sm",
        xs: "min-h-11 rounded-lg px-3 text-sm",
        lg: "min-h-12 px-6 text-base",
      },
    },
    defaultVariants: { size: "default", variant: "default" },
  },
);

export function buttonVariantsClass(
  props?: VariantProps<typeof buttonVariants>,
) {
  return buttonVariants(props);
}

export function Button({
  className,
  asChild = false,
  size,
  variant,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Component = asChild ? Slot : "button";
  return (
    <Component
      data-slot="button"
      data-variant={variant ?? "default"}
      data-size={size ?? "default"}
      className={cn(buttonVariants({ size, variant }), className)}
      {...props}
    />
  );
}
