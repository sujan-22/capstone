"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

export interface SortOption {
    key: string;
    label: string;
}

/** Segmented control that writes the chosen sort to the `sort` query param. */
export default function SortControl({ options }: { options: SortOption[] }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const current = searchParams.get("sort") || "none";

    const handleSortChange = (value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value === "none") params.delete("sort");
        else params.set("sort", value);
        const query = params.toString();
        router.push(query ? `?${query}` : "?", { scroll: false });
    };

    return (
        <div className="flex flex-col gap-2.5 lg:items-end">
            <p id="sort-label" className="type-label text-ink-soft">
                Sort by
            </p>
            <div
                role="group"
                aria-labelledby="sort-label"
                className="scrollbar-none -mx-1 flex max-w-full gap-1 overflow-x-auto rounded-full border border-rule bg-paper-raised p-1"
            >
                {options.map((option) => {
                    const active = current === option.key;
                    return (
                        <button
                            key={option.key}
                            type="button"
                            aria-pressed={active}
                            onClick={() => handleSortChange(option.key)}
                            className={cn(
                                "shrink-0 whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
                                active
                                    ? "bg-ink text-paper"
                                    : "text-ink-soft hover:bg-ink/[0.05] hover:text-ink"
                            )}
                        >
                            {option.label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
