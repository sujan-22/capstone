"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogTrigger,
    DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
    updateColorSchema,
    ALLOWED_COLOR_HEX,
    normalizeHex,
} from "@/schema/catalog";
import { CreateColorResponse } from "../../actions/actions";
import { SwatchGrid } from "./swatch-grid";
import { IoMdSave } from "react-icons/io";
import { MdClose } from "react-icons/md";

type Props = {
    title: string;
    description: string;
    submitText?: string;
    initial?: { name?: string; hex?: string };
    isPending?: boolean;
    onSubmit: (v: {
        name: string;
        hex: string;
    }) => void | Promise<CreateColorResponse>;
    trigger?: React.ReactNode;
};

export const ColorSwatchFormDialog: React.FC<Props> = ({
    title,
    description,
    submitText = "Save",
    initial,
    isPending = false,
    onSubmit,
    trigger,
}) => {
    const [open, setOpen] = React.useState(false);
    const [name, setName] = React.useState(initial?.name ?? "");
    const [hex, setHex] = React.useState(
        initial?.hex ? normalizeHex(initial.hex) : ALLOWED_COLOR_HEX[0]
    );
    const [err, setErr] = React.useState<{
        name?: string;
        hex?: string;
        form?: string;
    }>({});

    React.useEffect(() => {
        if (!open) {
            setErr({});
            setName(initial?.name ?? "");
            setHex(
                initial?.hex ? normalizeHex(initial.hex) : ALLOWED_COLOR_HEX[0]
            );
        }
    }, [open, initial?.name, initial?.hex]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setErr({});

        const parsed = updateColorSchema.safeParse({ name, hex });
        if (!parsed.success) {
            const fe = parsed.error.flatten().fieldErrors;
            setErr({
                name: fe.name?.[0],
                hex: fe.hex?.[0],
                form: "Please fix the highlighted fields.",
            });
            return;
        }

        try {
            await onSubmit(parsed.data);
            setOpen(false);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (e: any) {
            const msg =
                e?.message ||
                e?.response?.data?.message ||
                e?.response?.data?.error ||
                "Failed to create color.";
            setErr((prev) => ({ ...prev, form: msg }));
        }
    }

    return (
        <Dialog open={open} onOpenChange={(v) => !isPending && setOpen(v)}>
            <DialogTrigger asChild>
                {trigger ?? <Button variant="outline">Add / Edit Color</Button>}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit} noValidate>
                    <DialogHeader>
                        <DialogTitle>{title}</DialogTitle>
                        <DialogDescription>{description}</DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-2">
                        <div className="grid gap-2">
                            <Label htmlFor="color-name">Color name</Label>
                            <Input
                                id="color-name"
                                name="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                aria-invalid={!!err.name}
                                aria-describedby={
                                    err.name ? "name-err" : undefined
                                }
                            />
                            {err.name && (
                                <p
                                    id="name-err"
                                    className="text-xs text-destructive"
                                >
                                    {err.name}
                                </p>
                            )}
                        </div>

                        <div className="grid gap-2">
                            <Label>Pick a swatch</Label>
                            <SwatchGrid
                                value={hex}
                                onChange={(next) => setHex(normalizeHex(next))}
                                colors={ALLOWED_COLOR_HEX}
                                columns={6}
                                disabled={isPending}
                            />

                            <div className="flex items-center gap-2">
                                <div
                                    className="h-6 w-6 rounded border"
                                    style={{ backgroundColor: hex }}
                                />
                                <Input
                                    value={hex}
                                    readOnly
                                    className="font-mono w-36"
                                />
                            </div>

                            {err.hex && (
                                <p className="text-xs text-destructive">
                                    {err.hex}
                                </p>
                            )}
                        </div>
                    </div>

                    {err.form && (
                        <p className="text-sm text-destructive">{err.form}</p>
                    )}

                    <DialogFooter>
                        <DialogClose asChild>
                            <Button
                                type="button"
                                variant="outline"
                                disabled={isPending}
                                icon={MdClose}
                            >
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button
                            type="submit"
                            isLoading={isPending}
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
