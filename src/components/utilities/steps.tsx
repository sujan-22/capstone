"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { Check } from "lucide-react";

const steps = [
    { id: 1, label: "Choose an Image", href: "/configure/upload" },
    { id: 2, label: "Customize Your Case", href: "/configure/customize" },
    { id: 3, label: "Review Your Selections", href: "/configure/preview" },
];

export default function Steps() {
    const pathname = usePathname();
    const currentIndex = steps.findIndex((s) => pathname.startsWith(s.href));

    return (
        <div className="w-full">
            <nav aria-label="Configure steps" className="group my-4">
                <ol
                    role="tablist"
                    className="flex flex-row items-baseline max-w-5xl mx-auto px-1 sm:px-4"
                >
                    {steps.map((step, index, array) => {
                        const completed = index < currentIndex;
                        const active = index === currentIndex;

                        return (
                            <React.Fragment key={step.id}>
                                <li
                                    role="presentation"
                                    className={cn(
                                        "flex flex-col items-center flex-shrink-0",
                                        "max-[640px]:flex-shrink max-[640px]:min-w-0 max-[640px]:px-1",
                                        "gap-1 sm:gap-2"
                                    )}
                                >
                                    <Button
                                        aria-selected={active}
                                        aria-current={
                                            active ? "step" : undefined
                                        }
                                        aria-posinset={index + 1}
                                        aria-setsize={steps.length}
                                        variant={
                                            completed || active
                                                ? "default"
                                                : "secondary"
                                        }
                                        className={cn(
                                            "flex items-center justify-center rounded-full w-8 h-8 p-0 hover:cursor-default",
                                            active ? "shadow-sm" : ""
                                        )}
                                    >
                                        {completed ? (
                                            <Check
                                                className="w-4 h-4 text-white"
                                                color="white"
                                            />
                                        ) : (
                                            index + 1
                                        )}
                                    </Button>

                                    <span
                                        className={cn(
                                            "text-sm font-medium text-center leading-tight",
                                            "max-[640px]:whitespace-normal max-[640px]:break-words",
                                            active
                                                ? "text-primary"
                                                : completed
                                                ? "text-blue-600"
                                                : "text-muted-foreground"
                                        )}
                                    >
                                        {step.label}
                                    </span>
                                </li>

                                {index < array.length - 1 && (
                                    <Separator
                                        className={cn(
                                            "h-0.5 flex-1 transition-colors duration-200 min-w-6 self-center",
                                            "sm:mx-3 max-[640px]:mx-1 max-[640px]:max-w-[60px]",
                                            completed
                                                ? "bg-primary"
                                                : "bg-muted"
                                        )}
                                        aria-hidden
                                    />
                                )}
                            </React.Fragment>
                        );
                    })}
                </ol>
            </nav>
        </div>
    );
}
