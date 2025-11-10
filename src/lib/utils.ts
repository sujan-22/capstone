import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { ADMIN_DATA_PAGE_SIZE, ORDER_STATUSES } from "./constants";
import { IUser } from "../../auth-client";

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

export function getOrderStatus(status: string) {
    const backendKey = String(status).toUpperCase();
    const label =
        ORDER_STATUSES[backendKey as keyof typeof ORDER_STATUSES] ?? "Unknown";

    const tone =
        label === "Fulfilled"
            ? "bg-emerald-500 text-white dark:bg-emerald-600"
            : label === "Shipped"
            ? "bg-blue-500 text-white dark:bg-blue-600"
            : label === "Pending"
            ? "bg-amber-500 text-white dark:bg-amber-600"
            : "bg-muted text-foreground";

    return { label, tone };
}

export function getInitials(user?: IUser | null) {
    const base =
        user?.name || user?.username || user?.email?.split("@")[0] || "U";
    const parts = base.trim().split(/\s+/);
    const initials =
        parts.length > 1
            ? parts[0][0] + parts[parts.length - 1][0]
            : parts[0].slice(0, 2);
    return initials.toUpperCase();
}

export function parseLimit(value: string | null): number {
    const n = Number(value ?? ADMIN_DATA_PAGE_SIZE);
    if (!Number.isFinite(n)) return ADMIN_DATA_PAGE_SIZE;
    return Math.min(100, Math.max(1, Math.floor(n)));
}

export function encodeCursor(createdAtISO: string, id: string) {
    return Buffer.from(`${createdAtISO}|${id}`, "utf-8").toString("base64url");
}

export function decodeCursor(cursor: string | null): {
    createdAt?: string;
    id?: string;
} {
    if (!cursor) return {};
    try {
        const raw = Buffer.from(cursor, "base64url").toString("utf-8");
        const [createdAtISO, id] = raw.split("|");
        if (!createdAtISO || !id) return {};
        return { createdAt: createdAtISO, id };
    } catch {
        return {};
    }
}

export function getActiveHref(pathname: string, hrefs: readonly string[]) {
    const matches = hrefs.filter(
        (h) => pathname === h || pathname.startsWith(h + "/")
    );
    return matches.sort((a, b) => b.length - a.length)[0] ?? "";
}
