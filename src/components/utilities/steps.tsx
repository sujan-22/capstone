"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const steps = [
    { id: 1, label: "Upload your photo", href: "/configure/upload" },
    { id: 2, label: "Place & customise", href: "/configure/customize" },
    { id: 3, label: "Review your proof", href: "/configure/preview" },
];

export default function Steps() {
    const pathname = usePathname();
    const currentIndex = steps.findIndex((s) => pathname.startsWith(s.href));

    return (
        <nav aria-label="Design progress">
            <ol className="grid grid-cols-3 gap-2 sm:gap-4">
                {steps.map((step, index) => {
                    const completed = index < currentIndex;
                    const active = index === currentIndex;

                    return (
                        <li
                            key={step.id}
                            aria-current={active ? "step" : undefined}
                            className="min-w-0"
                        >
                            <span
                                aria-hidden
                                className={cn(
                                    "block h-1 rounded-full transition-colors duration-500",
                                    completed
                                        ? "bg-ink"
                                        : active
                                        ? "bg-cobalt"
                                        : "bg-ink/10"
                                )}
                            />
                            <span className="mt-3 flex items-center gap-2">
                                <span
                                    aria-hidden
                                    className={cn(
                                        "flex size-5 shrink-0 items-center justify-center rounded-full font-mono text-[0.625rem] font-medium",
                                        completed
                                            ? "bg-ink text-paper"
                                            : active
                                            ? "bg-cobalt text-white"
                                            : "border border-ink/20 text-ink-soft"
                                    )}
                                >
                                    {completed ? (
                                        <Check className="size-3" strokeWidth={3} />
                                    ) : (
                                        step.id
                                    )}
                                </span>
                                <span
                                    className={cn(
                                        "truncate text-xs font-semibold sm:text-sm",
                                        active || completed
                                            ? "text-ink"
                                            : "text-ink-soft"
                                    )}
                                >
                                    {step.label}
                                    {completed ? (
                                        <span className="sr-only"> (done)</span>
                                    ) : null}
                                </span>
                            </span>
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
}
