"use client";

import React from "react";
import { cn } from "@/lib/utils";

export type StatsPeriod = "90d" | "30d" | "7d";

const OPTIONS: { value: StatsPeriod; label: string }[] = [
    { value: "7d", label: "7 days" },
    { value: "30d", label: "30 days" },
    { value: "90d", label: "3 months" },
];

interface StatsPeriodFilterProps {
    value?: StatsPeriod;
    onChange?: (v: StatsPeriod) => void;
    className?: string;
    defaultValue?: StatsPeriod;
}

export default function StatsPeriodFilter({
    value,
    onChange,
    className,
    defaultValue = "30d",
}: StatsPeriodFilterProps) {
    const [internal, setInternal] = React.useState<StatsPeriod>(defaultValue);
    const current = value ?? internal;

    const select = (next: StatsPeriod) => {
        if (onChange) onChange(next);
        else setInternal(next);
    };

    return (
        <div
            role="group"
            aria-label="Time range"
            className={cn(
                "inline-flex gap-1 rounded-full border border-rule bg-paper-raised p-1",
                className
            )}
        >
            {OPTIONS.map((o) => (
                <button
                    key={o.value}
                    type="button"
                    aria-pressed={current === o.value}
                    onClick={() => select(o.value)}
                    className={cn(
                        "rounded-full px-3.5 py-1.5 text-sm font-medium whitespace-nowrap transition-colors",
                        current === o.value
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
