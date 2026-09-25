"use client";

import * as React from "react";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** A search input with its icon and a clear button. */
export function SearchField({
    value,
    onChange,
    placeholder,
    label,
    className,
}: {
    value: string;
    onChange: (v: string) => void;
    placeholder: string;
    label: string;
    className?: string;
}) {
    return (
        <div className={cn("relative w-full sm:max-w-sm", className)}>
            <Search
                aria-hidden
                className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-soft"
            />
            <input
                type="search"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                aria-label={label}
                className="h-10 w-full rounded-full border border-input bg-paper-raised pl-10 pr-10 text-sm text-ink outline-none transition-[border-color,box-shadow] placeholder:text-ink-soft hover:border-ink/40 focus-visible:border-cobalt focus-visible:ring-4 focus-visible:ring-cobalt/15 [&::-webkit-search-cancel-button]:hidden"
            />
            {value ? (
                <button
                    type="button"
                    onClick={() => onChange("")}
                    className="absolute right-2 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-full text-ink-soft hover:bg-ink/[0.06] hover:text-ink"
                >
                    <X aria-hidden className="size-3.5" />
                    <span className="sr-only">Clear search</span>
                </button>
            ) : null}
        </div>
    );
}

/** A row of mutually exclusive filter pills. */
export function Segmented<T extends string>({
    options,
    value,
    onChange,
    label,
    className,
}: {
    options: { value: T; label: string }[];
    value: T;
    onChange: (v: T) => void;
    label: string;
    className?: string;
}) {
    return (
        <div
            role="group"
            aria-label={label}
            className={cn(
                "scrollbar-none inline-flex max-w-full gap-1 overflow-x-auto rounded-full border border-rule bg-paper-raised p-1",
                className
            )}
        >
            {options.map((o) => (
                <button
                    key={o.value}
                    type="button"
                    aria-pressed={value === o.value}
                    onClick={() => onChange(o.value)}
                    className={cn(
                        "shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium whitespace-nowrap transition-colors",
                        value === o.value
                            ? "bg-ink text-paper"
                            : "text-ink-soft hover:bg-ink/[0.05] hover:text-ink"
                    )}
                >
                    {o.label}
                </button>
            ))}
        </div>
    );
}

/** The raised sheet a data table sits on. */
export function TablePanel({
    children,
    loading,
    className,
}: {
    children: React.ReactNode;
    loading?: boolean;
    className?: string;
}) {
    return (
        <div
            aria-busy={loading ? "true" : "false"}
            className={cn(
                "overflow-hidden rounded-md border border-rule bg-paper-raised",
                className
            )}
        >
            {children}
        </div>
    );
}

export function LoadMore({
    onClick,
    loading,
}: {
    onClick?: () => void;
    loading?: boolean;
}) {
    return (
        <div className="flex justify-center pt-6">
            <Button
                onClick={onClick}
                disabled={loading}
                isLoading={loading}
                variant="outline"
            >
                Load more
            </Button>
        </div>
    );
}

/** A small uppercase pill for statuses and roles. */
export function Pill({
    children,
    tone = "neutral",
    className,
}: {
    children: React.ReactNode;
    tone?: "neutral" | "cobalt" | "success" | "warning" | "danger" | "ink";
    className?: string;
}) {
    const tones = {
        neutral: "bg-ink/[0.06] text-ink",
        cobalt: "bg-cobalt text-white",
        success: "bg-success text-white",
        warning: "bg-process-y text-ink",
        danger: "bg-destructive text-white",
        ink: "bg-ink text-paper",
    } as const;
    return (
        <span
            className={cn(
                "type-label inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[0.625rem]",
                tones[tone],
                className
            )}
        >
            {children}
        </span>
    );
}
