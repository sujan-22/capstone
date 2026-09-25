"use client";

import {
    FormControl,
    FormField,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import React, { useState } from "react";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";

interface IFormInputProps {
    name: string;
    label: string;
    placeHolder: string;
    type: string;
    /** Short status shown beside the label, e.g. username availability. */
    suffix?: string;
    suffixClassName?: string;
    autoComplete?: string;
}

const FormInput = ({
    name,
    label,
    placeHolder,
    type,
    suffix,
    suffixClassName,
    autoComplete,
}: IFormInputProps) => {
    const [showPassword, setShowPassword] = useState(false);
    const inputId = `${name}-input`;

    const isPasswordType = type === "password";
    const inputType = isPasswordType && showPassword ? "text" : type;

    return (
        <FormField
            name={name}
            render={({ field }) => (
                <div className="grid gap-2">
                    <div className="flex items-center justify-between gap-3">
                        <FormLabel htmlFor={inputId}>{label}</FormLabel>
                        {suffix ? (
                            <span
                                aria-live="polite"
                                className={cn(
                                    "type-label text-ink-soft",
                                    suffixClassName
                                )}
                            >
                                {suffix}
                            </span>
                        ) : null}
                    </div>
                    <div className="relative">
                        <FormControl>
                            <Input
                                id={inputId}
                                type={inputType}
                                placeholder={placeHolder}
                                autoComplete={autoComplete}
                                {...field}
                                className={isPasswordType ? "pr-12" : ""}
                            />
                        </FormControl>
                        {isPasswordType && (
                            <button
                                type="button"
                                onClick={() => setShowPassword((prev) => !prev)}
                                aria-label={
                                    showPassword
                                        ? "Hide password"
                                        : "Show password"
                                }
                                aria-pressed={showPassword}
                                className="absolute right-1.5 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-ink-soft transition-colors hover:bg-ink/[0.05] hover:text-ink"
                            >
                                {showPassword ? (
                                    <FaRegEyeSlash size={16} />
                                ) : (
                                    <FaRegEye size={16} />
                                )}
                            </button>
                        )}
                    </div>
                    <FormMessage />
                </div>
            )}
        />
    );
};

export default FormInput;
