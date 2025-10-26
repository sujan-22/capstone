import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatDate(date?: string | Date) {
    if (!date) return "-";
    const d = typeof date === "string" ? new Date(date) : date;
    return new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    }).format(d);
}

export const formatPrice = (price: number) => {
    const formatter = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "CAD",
    });

    return formatter.format(price);
};

export function ymdInTz(iso: string, tz: string) {
    const d = new Date(iso);
    const parts = new Intl.DateTimeFormat("en-CA", {
        timeZone: tz,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    })
        .formatToParts(d)
        .reduce<Record<string, string>>((acc, p) => {
            if (p.type === "year" || p.type === "month" || p.type === "day")
                acc[p.type] = p.value;
            return acc;
        }, {});
    return `${parts.year}-${parts.month}-${parts.day}`;
}

export function labelFromYmd(ymd: string, tz: string) {
    const [y, m, d] = ymd.split("-").map(Number);
    const date = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
    return new Intl.DateTimeFormat("en-US", {
        timeZone: tz,
        month: "short",
        day: "numeric",
    }).format(date);
}

export function fullLabelFromYmd(ymd: string, tz: string) {
    const [y, m, d] = ymd.split("-").map(Number);
    const date = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
    return new Intl.DateTimeFormat("en-US", {
        timeZone: tz,
        month: "short",
        day: "numeric",
        year: "numeric",
    }).format(date);
}
