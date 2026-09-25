import Link from "next/link";
import { ArrowRight } from "lucide-react";
import CropMarks from "@/components/print/crop-marks";
import { buttonVariants } from "@/components/ui/button";

/** A blank proof: shown when an account list has nothing in it yet. */
export default function EmptyState({
    title,
    description,
    href,
    cta,
    "data-testid": testId,
}: {
    title: string;
    description: string;
    href: string;
    cta: string;
    "data-testid"?: string;
}) {
    return (
        <div
            data-testid={testId}
            className="flex flex-col items-center px-6 py-16 text-center"
        >
            <div aria-hidden className="relative">
                <div className="aspect-[9/17] w-16 rounded-[14px] border-2 border-dashed border-ink/25">
                    <span className="m-1.5 block size-4 rounded-[5px] bg-ink/10" />
                </div>
                <CropMarks gap={6} length={10} className="text-ink/40" />
            </div>
            <h3 className="type-title mt-8">{title}</h3>
            <p className="mt-3 max-w-md leading-relaxed text-ink-soft">
                {description}
            </p>
            <Link href={href} className={buttonVariants({ className: "mt-7" })}>
                {cta}
                <ArrowRight
                    aria-hidden
                    className="size-4 transition-transform duration-300 ease-out-expo group-hover/button:translate-x-0.5"
                />
            </Link>
        </div>
    );
}
