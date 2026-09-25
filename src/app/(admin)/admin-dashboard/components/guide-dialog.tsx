"use client";

import { BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

/** How-to notes for an admin section, kept out of the way until asked for. */
export default function GuideDialog({
    title,
    children,
}: {
    title: string;
    children: React.ReactNode;
}) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" className="h-10">
                    <BookOpen aria-hidden className="size-4" />
                    Guide
                </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[85dvh] overflow-y-auto sm:max-w-xl">
                <DialogHeader>
                    <p className="type-label text-ink-soft">Guide</p>
                    <DialogTitle className="text-2xl font-extrabold tracking-[-0.03em]">
                        Working with {title.toLowerCase()}
                    </DialogTitle>
                    <DialogDescription>
                        How this section works, and the rules it follows.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-3">{children}</div>
            </DialogContent>
        </Dialog>
    );
}
