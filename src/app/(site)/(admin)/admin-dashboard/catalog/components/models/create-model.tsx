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
import { createPhoneModelSchema } from "@/schema/catalog";

export type PhoneModelValues = {
    modelName: string;
    modelBrand: string;
};

type FieldErrs = Partial<Record<"modelName" | "modelBrand", string>>;

export type PhoneModelFormDialogProps = {
    title?: string;
    description?: string;
    schema?: z.ZodType<PhoneModelValues>;
    onSubmit?: (values: PhoneModelValues) => void | Promise<void>;
    initialData?: Partial<PhoneModelValues>;
    isPending?: boolean;
    submitText?: string;
    trigger?: React.ReactNode;
    contentClassName?: string;
};

export const PhoneModelFormDialog: React.FC<PhoneModelFormDialogProps> = ({
    title = "Add phone model",
    description = "Enter the new phone model details below.",
    schema = createPhoneModelSchema,
    onSubmit,
    initialData,
    isPending = false,
    submitText = "Create model",
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

    function validateField(name: "modelName" | "modelBrand") {
        if (!formRef.current) return;
        const fd = new FormData(formRef.current);
        const candidate: PhoneModelValues = {
            modelName: String(fd.get("modelName") ?? ""),
            modelBrand: String(fd.get("modelBrand") ?? ""),
        };
        const result = schema.safeParse(candidate);
        if (result.success) {
            setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
        } else {
            const fe = result.error.flatten().fieldErrors;
            setFieldErrors((prev) => ({
                ...prev,
                modelName: fe.modelName?.[0],
                modelBrand: fe.modelBrand?.[0],
            }));
        }
    }

    const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
        e.preventDefault();
        setFormError(null);

        const fd = new FormData(e.currentTarget);
        const candidate: PhoneModelValues = {
            modelName: String(fd.get("modelName") ?? ""),
            modelBrand: String(fd.get("modelBrand") ?? ""),
        };

        const parsed = schema.safeParse(candidate);
        if (!parsed.success) {
            const fe = parsed.error.flatten().fieldErrors;
            setFieldErrors({
                modelName: fe.modelName?.[0],
                modelBrand: fe.modelBrand?.[0],
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

    const nameErr = fieldErrors.modelName;
    const brandErr = fieldErrors.modelBrand;

    const defModelName = initialData?.modelName ?? "";
    const defModelBrand =
        initialData?.modelBrand === null ||
        initialData?.modelBrand === undefined
            ? ""
            : String(initialData.modelBrand);

    return (
        <Dialog open={open} onOpenChange={(v) => !isPending && setOpen(v)}>
            <DialogTrigger asChild>
                {trigger ?? (
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={isPending}
                        aria-label="Open phone model form"
                    >
                        Add model
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
                            <Label htmlFor="modelName">Model name</Label>
                            <Input
                                id="modelName"
                                name="modelName"
                                defaultValue={defModelName}
                                autoFocus
                                required
                                aria-invalid={!!nameErr}
                                aria-describedby={
                                    nameErr ? "modelName-err" : undefined
                                }
                                onBlur={(e) => {
                                    sanitizeOnBlur(e);
                                    validateField("modelName");
                                }}
                                placeholder="e.g., iPhone 15 Pro Max"
                            />
                            {nameErr && (
                                <p
                                    id="modelName-err"
                                    className="text-xs text-destructive"
                                >
                                    {nameErr}
                                </p>
                            )}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="modelBrand">Model brand</Label>
                            <Input
                                id="modelBrand"
                                name="modelBrand"
                                defaultValue={defModelBrand}
                                aria-invalid={!!brandErr}
                                required
                                aria-describedby={
                                    brandErr ? "modelBrand-err" : undefined
                                }
                                onBlur={(e) => {
                                    sanitizeOnBlur(e);
                                    validateField("modelBrand");
                                }}
                                placeholder="e.g., Apple, Samsung, Google"
                            />
                            {brandErr && (
                                <p
                                    id="modelBrand-err"
                                    className="text-xs text-destructive"
                                >
                                    {brandErr}
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
                            >
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button type="submit" isLoading={isPending || isSaving}>
                            {submitText}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
