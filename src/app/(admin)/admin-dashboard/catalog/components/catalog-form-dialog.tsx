"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { z } from "zod";
import { MdClose } from "react-icons/md";
import { IoMdSave } from "react-icons/io";

export type CatalogLabels =
    | {
          nameLabel: "Material name";
          description: "Material description";
          price: "Material price";
      }
    | {
          nameLabel: "Finish name";
          description: "Finish description";
          price: "Finish price";
      };

export type CatalogValues = {
    name: string;
    description: string;
    price: number | string;
};

type FieldErrs = Partial<Record<"name" | "description" | "price", string>>;

export type CatalogFormDialogProps = {
    title: string;
    description: string;
    labels: CatalogLabels;
    schema: z.ZodType<CatalogValues>;
    onSubmit?: (values: CatalogValues) => void | Promise<void>;
    initialData?: Partial<CatalogValues>;
    isPending?: boolean;
    submitText?: string;
    trigger?: React.ReactNode;
    contentClassName?: string;
};

export const CatalogFormDialog: React.FC<CatalogFormDialogProps> = ({
    title,
    description,
    labels,
    schema,
    onSubmit,
    initialData,
    isPending = false,
    submitText = "Save changes",
    trigger,
    contentClassName,
}) => {
    const [open, setOpen] = React.useState(false);
    const [isSaving, setIsSaving] = React.useState(false);
    const [formError, setFormError] = React.useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = React.useState<FieldErrs>({});
    const [submitted, setSubmitted] = React.useState(false);

    const formRef = React.useRef<HTMLFormElement>(null);

    React.useEffect(() => {
        if (!open) {
            setIsSaving(false);
            setFormError(null);
            setFieldErrors({});
            setSubmitted(false);
            formRef.current?.reset();
        }
    }, [open]);

    React.useEffect(() => {
        if (submitted && !isPending) {
            setOpen(false);
            setSubmitted(false);
        }
    }, [submitted, isPending]);

    function sanitizeOnBlur(e: React.FocusEvent<HTMLInputElement>) {
        const v = e.currentTarget.value
            .normalize("NFC")
            .replace(/\s+/g, " ")
            .trim();
        if (v !== e.currentTarget.value) e.currentTarget.value = v;
    }

    function handlePriceInput(e: React.FormEvent<HTMLInputElement>) {
        const raw = (e.currentTarget.value ?? "").toString();
        if (raw === "") return;
        if (raw.startsWith("-")) e.currentTarget.value = raw.replace("-", "");
    }

    function validateField(name: "name" | "description" | "price") {
        if (!formRef.current) return;
        const fd = new FormData(formRef.current);
        const candidate: CatalogValues = {
            name: String(fd.get("name") ?? ""),
            description: String(fd.get("description") ?? ""),
            price: String(fd.get("price") ?? ""),
        };
        const result = schema.safeParse(candidate);
        if (result.success) {
            setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
        } else {
            const fe = result.error.flatten().fieldErrors;
            setFieldErrors((prev) => ({
                ...prev,
                name: fe.name?.[0],
                description: fe.description?.[0],
                price: fe.price?.[0],
            }));
        }
    }

    const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
        e.preventDefault();
        setFormError(null);

        const fd = new FormData(e.currentTarget);
        const candidate: CatalogValues = {
            name: String(fd.get("name") ?? ""),
            description: String(fd.get("description") ?? ""),
            price: String(fd.get("price") ?? ""),
        };

        const parsed = schema.safeParse(candidate);
        if (!parsed.success) {
            const fe = parsed.error.flatten().fieldErrors;
            setFieldErrors({
                name: fe.name?.[0],
                description: fe.description?.[0],
                price: fe.price?.[0],
            });
            setFormError("Please fix the highlighted fields.");
            return;
        }

        try {
            setIsSaving(true);
            await onSubmit?.(parsed.data);
            setSubmitted(true);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            setFormError(err?.message ?? "Failed to save");
            setSubmitted(false);
        } finally {
            setIsSaving(false);
        }
    };

    const nameErr = fieldErrors.name;
    const descErr = fieldErrors.description;
    const priceErr = fieldErrors.price;

    const defName = initialData?.name ?? "";
    const defDescription = initialData?.description ?? "";
    const defPrice =
        initialData?.price !== undefined && initialData?.price !== null
            ? Number(initialData.price)
            : 0;

    return (
        <Dialog open={open} onOpenChange={(v) => !isPending && setOpen(v)}>
            <DialogTrigger asChild>
                {trigger ?? (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full"
                        aria-label={`Open ${title}`}
                        disabled={isPending}
                    >
                        <span className="sr-only">Open form</span>✎
                    </Button>
                )}
            </DialogTrigger>

            <DialogContent className={contentClassName ?? "sm:max-w-[425px]"}>
                <form ref={formRef} onSubmit={handleSubmit} noValidate>
                    <DialogHeader>
                        <DialogTitle>{title}</DialogTitle>
                        <DialogDescription>{description}</DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-2">
                        <div className="grid gap-2">
                            <Label htmlFor="name">{labels.nameLabel}</Label>
                            <Input
                                id="name"
                                name="name"
                                defaultValue={defName}
                                autoFocus
                                required
                                aria-invalid={!!nameErr}
                                aria-describedby={
                                    nameErr ? "name-err" : undefined
                                }
                                onBlur={(e) => {
                                    sanitizeOnBlur(e);
                                    validateField("name");
                                }}
                            />
                            {nameErr && (
                                <p
                                    id="name-err"
                                    className="text-xs text-destructive"
                                >
                                    {nameErr}
                                </p>
                            )}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="description">
                                {labels.description}
                            </Label>
                            <Input
                                id="description"
                                name="description"
                                defaultValue={defDescription}
                                required
                                aria-invalid={!!descErr}
                                aria-describedby={
                                    descErr ? "desc-err" : undefined
                                }
                                onBlur={(e) => {
                                    sanitizeOnBlur(e);
                                    validateField("description");
                                }}
                                placeholder="Enter a short description"
                            />
                            {descErr && (
                                <p
                                    id="desc-err"
                                    className="text-xs text-destructive"
                                >
                                    {descErr}
                                </p>
                            )}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="price">{labels.price}</Label>
                            <Input
                                id="price"
                                name="price"
                                type="number"
                                inputMode="decimal"
                                step="0.01"
                                min="0"
                                defaultValue={
                                    Number.isFinite(defPrice) ? defPrice : 0
                                }
                                required
                                aria-invalid={!!priceErr}
                                aria-describedby={
                                    priceErr ? "price-err" : undefined
                                }
                                onInput={handlePriceInput}
                                onBlur={() => validateField("price")}
                            />
                            {priceErr && (
                                <p
                                    id="price-err"
                                    className="text-xs text-destructive"
                                >
                                    {priceErr}
                                </p>
                            )}
                        </div>
                    </div>

                    {formError && (
                        <p className="text-sm text-destructive" role="alert">
                            {formError}
                        </p>
                    )}

                    <DialogFooter>
                        <DialogClose asChild>
                            <Button
                                type="button"
                                variant="outline"
                                disabled={isPending || isSaving}
                                icon={MdClose}
                            >
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button
                            type="submit"
                            isLoading={isPending || isSaving}
                            icon={IoMdSave}
                        >
                            {submitText}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
