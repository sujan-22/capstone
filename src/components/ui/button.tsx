import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { Spinner } from "./spinner";
import { IconType } from "react-icons/lib";

const buttonVariants = cva(
    "group/button inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-full text-sm font-semibold tracking-[-0.01em] transition-[color,background-color,border-color,box-shadow,transform] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:translate-y-px disabled:pointer-events-none disabled:opacity-50 hover:cursor-pointer [&_svg]:shrink-0",
    {
        variants: {
            variant: {
                default:
                    "bg-primary text-primary-foreground hover:bg-cobalt-deep",
                ink: "bg-ink text-paper hover:bg-ink-raised",
                destructive:
                    "bg-destructive text-destructive-foreground hover:bg-destructive/90",
                outline:
                    "border border-ink/20 bg-transparent text-ink hover:border-ink hover:bg-ink/[0.03]",
                secondary:
                    "bg-secondary text-secondary-foreground hover:bg-[#dcd7cc]",
                ghost: "text-ink hover:bg-ink/[0.06]",
                link: "rounded-sm px-0 text-cobalt underline-offset-4 hover:underline",
                paper: "bg-paper text-ink hover:bg-white",
                "outline-paper":
                    "border border-paper/30 bg-transparent text-paper hover:border-paper hover:bg-paper/[0.06]",
            },
            size: {
                default: "h-10 px-5",
                sm: "h-8 px-3.5 text-xs",
                lg: "h-12 px-6 text-[0.9375rem]",
                xl: "h-14 px-7 text-base",
                icon: "size-10",
            },
        },
        compoundVariants: [
            { variant: "link", size: "default", className: "h-auto px-0" },
            { variant: "link", size: "sm", className: "h-auto px-0" },
        ],
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
);

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
        VariantProps<typeof buttonVariants> {
    asChild?: boolean;
    isLoading?: boolean;
    loadingText?: string;
    icon?: IconType;
    iconClassname?: string;
    iconPosition?: "right" | "left";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            className,
            isLoading = false,
            disabled = false,
            variant,
            size,
            children,
            asChild = false,
            icon: Icon,
            iconClassname,
            iconPosition = "left",
            ...props
        },
        ref
    ) => {
        const Comp = asChild ? Slot : "button";
        const isDisabled = disabled || isLoading;

        if (asChild) {
            return (
                <Comp
                    ref={ref}
                    className={cn(buttonVariants({ variant, size, className }))}
                    {...props}
                >
                    {children}
                </Comp>
            );
        }

        return (
            <Comp
                ref={ref}
                disabled={isDisabled}
                aria-disabled={isDisabled}
                aria-busy={isLoading || undefined}
                className={cn(buttonVariants({ variant, size, className }))}
                {...props}
            >
                {isLoading && <Spinner aria-hidden="true" />}
                {Icon && !isLoading && iconPosition === "left" && (
                    <Icon
                        className={cn("size-4", iconClassname)}
                        aria-hidden="true"
                    />
                )}
                {children}
                {Icon && !isLoading && iconPosition === "right" && (
                    <Icon
                        className={cn(
                            "size-4 transition-transform duration-300 ease-out-expo group-hover/button:translate-x-0.5",
                            iconClassname
                        )}
                        aria-hidden="true"
                    />
                )}
            </Comp>
        );
    }
);

Button.displayName = "Button";

export { Button, buttonVariants };
