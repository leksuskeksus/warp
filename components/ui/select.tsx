import { SelectHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/cn";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  invalid?: boolean;
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, invalid, children, ...props }, ref) => (
    <select
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cn(
        "border-input text-input-1 h-[40px] w-full min-w-0 rounded-md border bg-transparent px-[10px] text-base outline-none transition-[color,box-shadow]",
        "appearance-none cursor-pointer",
        "disabled:cursor-not-allowed disabled:text-fg4",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "aria-invalid:ring-destructive/20 aria-invalid:border-destructive",
        "dark:aria-invalid:ring-destructive/40",
        // Custom arrow using background gradients
        "bg-[linear-gradient(45deg,transparent_50%,currentColor_50%),linear-gradient(135deg,currentColor_50%,transparent_50%)]",
        "bg-[calc(100%-18px)_center,calc(100%-12px)_center]",
        "bg-[length:6px_6px]",
        "bg-no-repeat",
        "pr-[36px]",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  ),
);

Select.displayName = "Select";
