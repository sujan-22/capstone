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

export type CreatePhoneModelInput = z.infer<typeof createPhoneModelSchema>;
export type UpdateFinishInput = z.infer<typeof updateFinishSchema>;
export type UpdateMaterialInput = z.infer<typeof updateMaterialSchema>;
