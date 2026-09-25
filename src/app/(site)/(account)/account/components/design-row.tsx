import * as React from "react";
import Phone from "@/components/utilities/phone";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface DesignRowProps {
    imgSrc: string;
    caseName: string;
    modelName: string;
    color: string;
    material: string;
    finish: string;
    /** Small mono line above the name, e.g. an order number. */
    kicker?: React.ReactNode;
    /** Set against the name, e.g. a price or a status. */
    badge?: React.ReactNode;
    /** Extra line under the spec, e.g. a date. */
    meta?: React.ReactNode;
    actions: React.ReactNode;
    className?: string;
    "data-testid"?: string;
}

/** One saved design in an account list: its print, spec and actions. */
export default function DesignRow({
    imgSrc,
    caseName,
    modelName,
    color,
    material,
    finish,
    kicker,
    badge,
    meta,
    actions,
    className,
    ...rest
}: DesignRowProps) {
    const specs = [
        ["Model", modelName],
        ["Colour", color],
        ["Material", material],
        ["Finish", finish],
    ];

    return (
        <article
            className={cn(
                "grid grid-cols-[84px_minmax(0,1fr)] gap-5 border-b border-rule py-7 sm:grid-cols-[128px_minmax(0,1fr)] sm:gap-8",
                className
            )}
            data-testid={rest["data-testid"]}
        >
            <div className="self-start rounded-md bg-paper-sunken px-3 py-4 sm:px-5 sm:py-5">
                <Phone imgSrc={imgSrc} altText={caseName} sizes="128px" />
            </div>

            <div className="flex min-w-0 flex-col">
                {kicker ? (
                    <p className="type-label text-ink-soft">{kicker}</p>
                ) : null}
                <div
                    className={cn(
                        "flex flex-wrap items-start justify-between gap-x-4 gap-y-2",
                        kicker && "mt-2"
                    )}
                >
                    <h3 className="type-heading min-w-0">{caseName}</h3>
                    {badge}
                </div>

                <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1.5 text-sm sm:flex sm:flex-wrap">
                    {specs.map(([label, value]) => (
                        <div key={label} className="flex min-w-0 gap-1.5">
                            <dt className="text-ink-soft">{label}</dt>
                            <dd className="truncate font-medium">{value}</dd>
                        </div>
                    ))}
                </dl>

                {meta ? (
                    <p className="mt-3 text-sm text-ink-soft">{meta}</p>
                ) : null}

                <div className="mt-5 flex flex-wrap gap-2">{actions}</div>
            </div>
        </article>
    );
}

export function DesignRowSkeleton({ actions = 2 }: { actions?: number }) {
    return (
        <div
            aria-hidden
            className="grid grid-cols-[84px_1fr] gap-5 border-b border-rule py-7 sm:grid-cols-[128px_1fr] sm:gap-8"
        >
            <div className="rounded-md bg-paper-sunken px-3 py-4 sm:px-5 sm:py-5">
                <div className="animate-pulse opacity-60">
                    <Phone imgSrc="" sizes="128px" />
                </div>
            </div>
            <div>
                <Skeleton className="h-5 w-2/3" />
                <div className="mt-4 grid grid-cols-2 gap-2 sm:flex sm:gap-6">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} className="h-4 sm:w-24" />
                    ))}
                </div>
                <Skeleton className="mt-4 h-4 w-48" />
                <div className="mt-5 flex gap-2">
                    {Array.from({ length: actions }).map((_, i) => (
                        <Skeleton key={i} className="h-9 w-32 rounded-full" />
                    ))}
                </div>
            </div>
        </div>
    );
}
