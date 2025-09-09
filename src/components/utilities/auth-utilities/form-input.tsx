"use client";

import { Button } from "@/components/ui/button";
import {
    FormControl,
    FormField,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import React, { useState } from "react";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";

interface IFormInputProps {
    name: string;
    label: string;
    placeHolder: string;
    type: string;
}

const FormInput = ({ name, label, placeHolder, type }: IFormInputProps) => {
    const [showPassword, setShowPassword] = useState(false);
    const inputId = `${name}-input`;

    const isPasswordType = type === "password";
    const inputType = isPasswordType && showPassword ? "text" : type;

    return (
        <FormField
            name={name}
            render={({ field }) => (
                <div className="grid gap-1">
                    <FormLabel htmlFor={inputId}>{label}</FormLabel>
                    <FormControl>
                        <div key={inputId} className="relative">
                            <Input
                                id={inputId}
                                type={inputType}
                                placeholder={placeHolder}
                                {...field}
                                className={isPasswordType ? "pr-10" : ""}
                            />
                            {isPasswordType && (
                                <Button
                                    type="button"
                                    onClick={() =>
                                        setShowPassword((prev) => !prev)
                                    }
                                    variant={"link"}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 hover:text-muted-foreground"
                                >
                                    {showPassword ? (
                                        <FaRegEyeSlash size={18} />
                                    ) : (
                                        <FaRegEye size={18} />
                                    )}
                                </Button>
                            )}
                        </div>
                    </FormControl>
                    <FormMessage />
                </div>
            )}
        />
    );
};

export default FormInput;
