import * as React from "react";
import { cn } from "@/lib/utils";

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-hairline bg-ink-950/40 px-3 text-sm text-powder-100 placeholder:text-muted/70 transition-colors duration-150 ease-out-confident",
          "focus-visible:outline-none focus-visible:border-teal/60 focus-visible:ring-2 focus-visible:ring-teal/25",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
