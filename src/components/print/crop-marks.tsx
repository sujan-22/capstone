import { cn } from "@/lib/utils";

interface CropMarksProps {
    /** Space between the trim edge and where each mark starts, in px. */
    gap?: number;
    /** Length of each mark, in px. */
    length?: number;
    className?: string;
}

/**
 * The L-shaped marks a printer puts outside each corner of the trim box.
 * Place inside a `relative` element; the marks sit outside its edges.
 */
export default function CropMarks({
    gap = 8,
    length = 14,
    className,
}: CropMarksProps) {
    const o = -(gap + length);
    const lines: React.CSSProperties[] = [
        { left: o, top: 0, width: length, height: 1 },
        { left: 0, top: o, width: 1, height: length },
        { right: o, top: 0, width: length, height: 1 },
        { right: 0, top: o, width: 1, height: length },
        { left: o, bottom: 0, width: length, height: 1 },
        { left: 0, bottom: o, width: 1, height: length },
        { right: o, bottom: 0, width: length, height: 1 },
        { right: 0, bottom: o, width: 1, height: length },
    ];

    return (
        <span
            aria-hidden
            className={cn(
                "pointer-events-none absolute inset-0 text-ink",
                className
            )}
        >
            {lines.map((style, i) => (
                <span key={i} className="absolute bg-current" style={style} />
            ))}
        </span>
    );
}
