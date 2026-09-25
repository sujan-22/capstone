"use client";

import React from "react";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";

interface ErrorMessageProps {
    message?: string;
    onRetry?: () => void;
    className?: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({
    message = "Something went wrong.",
    onRetry,
    className = "",
}) => {
    return (
        <div
            role="alert"
            className={cn(
                "flex flex-col items-center justify-center gap-4 px-6 py-12 text-center",
                className
            )}
        >
            <span
                aria-hidden
                className="flex size-10 items-center justify-center rounded-full bg-destructive/10 font-mono text-lg font-semibold text-destructive"
            >
                !
            </span>
            <p className="max-w-md text-base text-ink">{message}</p>
            {onRetry && (
                <Button variant="outline" size="sm" onClick={onRetry}>
                    Retry
                </Button>
            )}
        </div>
    );
};

export default ErrorMessage;
