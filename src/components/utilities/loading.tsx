"use client";

import React from "react";
import { ClipLoader } from "react-spinners";

interface LoadingMessageProps {
    message?: string;
    size?: number;
    className?: string;
}

const LoadingMessage: React.FC<LoadingMessageProps> = ({
    message = "Loading...",
    size = 36,
    className = "",
}) => {
    return (
        <div
            className={`flex flex-col items-center justify-center gap-3 text-center text-muted-foreground min-h-[calc(100vh-114px)] ${className}`}
        >
            <ClipLoader size={size} />
            <p className="text-sm sm:text-base">{message}</p>
        </div>
    );
};

export default LoadingMessage;
