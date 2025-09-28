import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
    apiVersion: "2025-02-24.acacia",
    typescript: true,
});

export function toCents(value: unknown): number {
    const n = Number(value ?? 0);
    if (Number.isNaN(n)) return 0;

    if (!Number.isInteger(n)) {
        return Math.round(n * 100);
    }

    if (n > 1000) return n;
    return n * 100;
}

export function generateOrderNumber(length = 6) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `DMC${result}`;
}
