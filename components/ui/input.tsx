import { InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/cn";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  invalid?: boolean;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", invalid, ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      aria-invalid={invalid || undefined}
      className={cn(
        "border-input text-input-1 flex h-[40px] w-full min-w-0 rounded-md border bg-transparent py-[3px] px-[10px] text-base outline-none transition-[color,box-shadow]",
        "placeholder:text-fg4",
        "disabled:cursor-not-allowed disabled:text-fg4",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "aria-invalid:ring-destructive/20 aria-invalid:border-destructive",
        "dark:aria-invalid:ring-destructive/40",
        "file:inline-flex file:h-[40px] file:border-0 file:bg-transparent file:text-input-1 file:font-medium",
        className,
      )}
      {...props}
    />
  ),
);

Input.displayName = "Input";
