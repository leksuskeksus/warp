import { TextareaHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/cn";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  invalid?: boolean;
};

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, invalid, ...props }, ref) => (
    <textarea
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cn(
        "border-input text-input-1 w-full min-w-0 min-h-[96px] rounded-md border bg-transparent p-[10px] text-base outline-none transition-[color,box-shadow]",
        "resize-vertical",
        "placeholder:text-fg4",
        "disabled:cursor-not-allowed disabled:text-fg4",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "aria-invalid:ring-destructive/20 aria-invalid:border-destructive",
        "dark:aria-invalid:ring-destructive/40",
        className,
      )}
      {...props}
    />
  ),
);

Textarea.displayName = "Textarea";
