"use client";

import * as React from "react";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { AdminImageItem } from "../actions/actions";
import { LoadMore, Segmented } from "../../components/controls";

type SortKey = "added" | "usage" | "lastUsed";

const SORTS: { value: SortKey; label: string }[] = [
    { value: "added", label: "Newest" },
    { value: "usage", label: "Most used" },
    { value: "lastUsed", label: "Recently used" },
];

const dateFormat = new Intl.DateTimeFormat("en-CA", {
    month: "short",
    day: "numeric",
    year: "numeric",
});

function Switch({
    checked,
    onChange,
    label,
}: {
    checked: boolean;
    onChange: (next: boolean) => void;
    label: string;
}) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            aria-label={label}
            onClick={() => onChange(!checked)}
            className={cn(
                "relative inline-flex h-6 w-10 shrink-0 items-center rounded-full outline-none transition-colors focus-visible:ring-2 focus-visible:ring-cobalt focus-visible:ring-offset-2",
                checked ? "bg-cobalt" : "bg-ink/20"
            )}
        >
            <span
                aria-hidden
                className={cn(
                    "size-5 rounded-full bg-white shadow-sm transition-transform duration-300 ease-out-expo",
                    checked ? "translate-x-[18px]" : "translate-x-0.5"
                )}
            />
        </button>
    );
}

/** The gallery library as a contact sheet: one frame per image. */
export function ImagesGrid({
    rows,
    loading,
    hasNextPage,
    onLoadMore,
    onToggleActive,
}: {
    rows: AdminImageItem[];
    loading?: boolean;
    hasNextPage?: boolean;
    onLoadMore?: () => void;
    onToggleActive: (id: string, next: boolean) => Promise<void>;
}) {
    const [sort, setSort] = React.useState<SortKey>("added");

    const sorted = React.useMemo(() => {
        const copy = [...rows];
        const time = (v?: string | null) => (v ? new Date(v).getTime() : 0);
        if (sort === "usage")
            copy.sort((a, b) => (b.usageCount ?? 0) - (a.usageCount ?? 0));
        else if (sort === "lastUsed")
            copy.sort((a, b) => time(b.lastUsedAt) - time(a.lastUsedAt));
        else copy.sort((a, b) => time(b.createdAt) - time(a.createdAt));
        return copy;
    }, [rows, sort]);

    const activeCount = rows.filter((r) => r.active).length;

    return (
        <div className="space-y-5" aria-busy={loading ? "true" : "false"}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <Segmented
                    label="Sort images"
                    options={SORTS}
                    value={sort}
                    onChange={setSort}
                />
                {rows.length ? (
                    <p className="type-label text-ink-soft">
                        {activeCount} of {rows.length} shown to customers
                    </p>
                ) : null}
            </div>

            {rows.length === 0 && loading ? (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                    {Array.from({ length: 10 }).map((_, i) => (
                        <Skeleton key={i} className="aspect-[4/5] rounded-md" />
                    ))}
                </div>
            ) : rows.length === 0 ? (
                <p className="rounded-md border border-dashed border-ink/20 px-6 py-16 text-center text-ink-soft">
                    No gallery images yet. Add one to get started.
                </p>
            ) : (
                <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                    {sorted.map((img, i) => (
                        <li
                            key={img.id}
                            className="overflow-hidden rounded-md border border-rule bg-paper-raised"
                        >
                            <div className="relative aspect-[4/5] bg-paper-sunken">
                                <Image
                                    src={img.url}
                                    alt=""
                                    fill
                                    sizes="(max-width: 640px) 50vw, (max-width: 1280px) 25vw, 240px"
                                    className={cn(
                                        "object-cover transition-[filter,opacity] duration-300",
                                        !img.active && "opacity-45 grayscale"
                                    )}
                                />
                                <span className="type-label absolute left-2 top-2 rounded-full bg-paper-raised/90 px-2 py-1 text-[0.625rem] text-ink">
                                    Frame {String(i + 1).padStart(2, "0")}
                                </span>
                                {!img.active ? (
                                    <span className="type-label absolute bottom-2 left-2 rounded-full bg-ink px-2 py-1 text-[0.625rem] text-paper">
                                        Hidden
                                    </span>
                                ) : null}
                            </div>
                            <div className="space-y-2.5 p-3">
                                <div className="flex items-center justify-between gap-2">
                                    <span className="text-sm">
                                        <span className="font-mono font-medium">
                                            {img.usageCount ?? 0}
                                        </span>{" "}
                                        <span className="text-ink-soft">
                                            {img.usageCount === 1 ? "design" : "designs"}
                                        </span>
                                    </span>
                                    <Switch
                                        checked={!!img.active}
                                        onChange={(next) => onToggleActive(img.id, next)}
                                        label={`Show frame ${i + 1} in the customer gallery`}
                                    />
                                </div>
                                <p className="text-xs text-ink-soft">
                                    Added {dateFormat.format(new Date(img.createdAt))}
                                    <br />
                                    {img.lastUsedAt
                                        ? `Last used ${dateFormat.format(new Date(img.lastUsedAt))}`
                                        : "Not used yet"}
                                </p>
                                <a
                                    href={img.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-xs font-semibold text-cobalt hover:underline"
                                >
                                    Open original
                                    <ArrowUpRight aria-hidden className="size-3" />
                                    <span className="sr-only"> (opens in a new tab)</span>
                                </a>
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            {hasNextPage && <LoadMore onClick={onLoadMore} loading={loading} />}
        </div>
    );
}
