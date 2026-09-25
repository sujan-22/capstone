import { cn } from "@/lib/utils";
import CropMarks from "./crop-marks";
import RegistrationMark from "./registration-mark";
import ColorBar from "./color-bar";

interface PressSheetProps {
    children: React.ReactNode;
    /** Mono text printed along the top edge. */
    slug?: React.ReactNode;
    /** Mono text printed beside the colour bar. */
    footer?: React.ReactNode;
    className?: string;
    /** Classes for the trim box the crop marks are drawn around. */
    trimClassName?: string;
}

/**
 * A proof sheet: the artwork sits in a trim box with crop marks, a slug line
 * runs along the top, registration targets sit on the side margins, and a
 * colour bar runs along the bottom.
 */
export default function PressSheet({
    children,
    slug,
    footer,
    className,
    trimClassName,
}: PressSheetProps) {
    return (
        <div
            className={cn(
                "relative flex flex-col bg-paper-raised text-ink shadow-[0_1px_0_rgb(20_20_20/0.04),0_40px_80px_-40px_rgb(20_20_20/0.45)]",
                className
            )}
        >
            <div className="flex items-center justify-between gap-4 px-4 pt-3.5 sm:px-5">
                <span className="type-label min-w-0 truncate text-ink-soft">
                    {slug}
                </span>
                <RegistrationMark size={14} />
            </div>

            <RegistrationMark
                size={16}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 sm:left-3.5"
            />
            <RegistrationMark
                size={16}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 sm:right-3.5"
            />

            <div className="relative flex flex-1 items-center justify-center px-10 py-8 sm:px-14 sm:py-10">
                <div className={cn("relative", trimClassName)}>
                    {children}
                    <CropMarks />
                </div>
            </div>

            <div className="flex items-center justify-between gap-4 px-4 pb-3.5 sm:px-5">
                <ColorBar size={9} />
                {footer ? (
                    <span className="type-label min-w-0 truncate text-ink-soft">
                        {footer}
                    </span>
                ) : null}
            </div>
        </div>
    );
}
