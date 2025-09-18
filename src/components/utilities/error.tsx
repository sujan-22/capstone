"use client";

import React from "react";
import { Button } from "../ui/button";

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
            className={`flex flex-col items-center justify-center gap-3 text-center text-red-600 min-h-auto ${className}`}
        >
            <p className="text-sm sm:text-base">{message}</p>
            {onRetry && (
                <Button variant="outline" size="sm" onClick={onRetry}>
                    Retry
                </Button>
            )}
        </div>
    );
};

export default ErrorMessage;
