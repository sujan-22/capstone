import * as React from "react";
import { cn } from "@/lib/utils";

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    (
        { className, type = "text", value, defaultValue, onChange, ...props },
        ref
    ) => {
        const isControlled = value !== undefined;

        return (
            <input
                ref={ref}
                type={type}
                data-slot="input"
                className={cn(
                    "flex h-11 w-full min-w-0 rounded-lg border border-input bg-paper-raised px-3.5 py-2 text-base text-ink shadow-[inset_0_1px_0_rgb(20_20_20/0.03)] transition-[color,border-color,box-shadow] outline-none md:text-sm",
                    "placeholder:text-ink-soft selection:bg-cobalt selection:text-white",
                    "file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
                    "hover:border-ink/40 focus-visible:border-cobalt focus-visible:ring-4 focus-visible:ring-cobalt/15",
                    "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
                    "aria-invalid:border-destructive aria-invalid:ring-destructive/15",
                    className
                )}
                {...(isControlled ? { value, onChange } : { defaultValue })}
                {...props}
            />
        );
    }
);

Input.displayName = "Input";

export { Input };
