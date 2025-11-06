import { z } from "zod";

export function normalizeNFC(s: string) {
    return s.normalize("NFC");
}
export function collapseWhitespace(s: string) {
    return s.replace(/\s+/g, " ").trim();
}
export function stripTags(s: string) {
    return s.replace(/<\/?[^>]+(>|$)/g, "");
}
export function sanitizeText(s: unknown) {
    const v = typeof s === "string" ? s : "";
    return stripTags(collapseWhitespace(normalizeNFC(v)));
}

export const priceSchema = z
    .union([z.string(), z.number()])
    .transform((v) => (typeof v === "string" ? v.trim() : v))
    .transform((v) => (typeof v === "string" && v !== "" ? Number(v) : v))
    .refine((v) => Number.isFinite(v as number), "Price must be a number")
    .transform((v) => Number(v))
    .refine((v) => v >= 0, "Price must be ≥ 0")
    .refine((v) => v <= 99_999, "Price too large")
    .transform((v) => Math.round(v * 100) / 100);

const NAME_REGEX = /^[\p{L}\p{N}\s\-.'&]{2,60}$/u;

export const catalogTextSchema = z.preprocess(
    (val) => sanitizeText(val),
    z
        .string()
        .min(2, "Too short")
        .max(60, "Too long")
        .refine((s) => NAME_REGEX.test(s), "Invalid characters")
);

export const catalogDescriptionSchema = z.preprocess(
    (val) => sanitizeText(val),
    z
        .string()
        .min(1, "Description is required")
        .max(500, "Description too long")
);

export const updateFinishSchema = z.object({
    name: catalogTextSchema,
    description: catalogDescriptionSchema,
    price: priceSchema,
});

export const updateMaterialSchema = z.object({
    name: catalogTextSchema,
    description: catalogDescriptionSchema,
    price: priceSchema,
});

export const modelBrandSchema = catalogTextSchema;

export const modelNameSchema = catalogTextSchema;

export const createPhoneModelSchema = z.object({
    modelName: modelNameSchema,
    modelBrand: modelBrandSchema,
});

export const ALLOWED_COLOR_HEX = [
    "#000000",
    "#111827",
    "#1F2937",
    "#374151",
    "#4B5563",
    "#6B7280",
    "#9CA3AF",
    "#D1D5DB",
    "#FFFFFF",
    "#EF4444",
    "#F59E0B",
    "#10B981",
    "#3B82F6",
    "#8B5CF6",
    "#F472B6",
    "#EC4899",
    "#14B8A6",
    "#22C55E",
    "#EAB308",
] as const;

export function normalizeHex(input: string) {
    let v = String(input || "").trim();
    if (!v.startsWith("#")) v = `#${v}`;
    if (/^#([0-9a-fA-F]{3})$/.test(v)) {
        const [, tri] = v.match(/^#([0-9a-fA-F]{3})$/)!;
        v = `#${tri[0]}${tri[0]}${tri[1]}${tri[1]}${tri[2]}${tri[2]}`;
    }
    return v.toUpperCase();
}

const baseHex = z
    .string()
    .trim()
    .transform(normalizeHex)
    .refine((s) => /^#([0-9A-F]{6})$/.test(s), "Invalid hex color");

const allowedSet: Set<string> = new Set(ALLOWED_COLOR_HEX as readonly string[]);
export const colorHexSchemaLimited = baseHex.refine(
    (s) => allowedSet.has(s),
    "Color must be from the approved swatches"
);

export const updateColorSchema = z.object({
    name: z.string().trim().min(2).max(60),
    hex: colorHexSchemaLimited,
});

export type UpdateColorInput = z.infer<typeof updateColorSchema>;
export type CreatePhoneModelInput = z.infer<typeof createPhoneModelSchema>;
export type UpdateFinishInput = z.infer<typeof updateFinishSchema>;
export type UpdateMaterialInput = z.infer<typeof updateMaterialSchema>;
