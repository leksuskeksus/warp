import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/cn";

type ButtonVariant = "primary" | "secondary" | "subtle" | "text";
type ButtonSize = "md" | "sm";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  active?: boolean;
};

const baseClasses = "group/button relative inline-flex items-center justify-center gap-[3px] whitespace-nowrap rounded-md transition-all shrink-0 cursor-pointer outline-none";

const variantClasses = {
  primary: "bg-bg-btn-main text-fg-btn-main hover:bg-bg-btn-main-hover disabled:bg-bg-disabled disabled:text-fg4 disabled:cursor-not-allowed disabled:hover:bg-bg-disabled",
  secondary: "bg-bg-btn-secondary text-fg-btn-secondary border border-btn-secondary hover:bg-bg-btn-secondary-hover disabled:bg-bg-disabled disabled:text-fg4 disabled:cursor-not-allowed",
  subtle: "bg-transparent text-fg-btn-secondary border border-btn-secondary hover:bg-bg-hover disabled:bg-bg-disabled disabled:text-fg4 disabled:cursor-not-allowed",
  text: "bg-transparent text-fg hover:text-fg underline hover:opacity-60",
};

const sizeClasses = {
  md: "h-[50px] px-[17px] text-button-1",
  sm: "h-[40px] px-[13px] text-button-2",
};

const focusClasses = "focus-visible:ring-[3px] focus-visible:ring-ring";
const activeClasses = "data-[active=true]:bg-bg-btn-active data-[active=true]:text-fg-btn-active";

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      active = false,
      type = "button",
      children,
      ...props
    },
    ref,
  ) => (
    <button
      ref={ref}
      type={type}
      data-slot="button"
      data-active={active || undefined}
      className={cn(
        baseClasses,
        variantClasses[variant],
        variant !== "text" && sizeClasses[size],
        variant !== "text" && focusClasses,
        active && activeClasses,
        className,
      )}
      {...props}
    >
      {children}
    </button>
  ),
);

Button.displayName = "Button";
