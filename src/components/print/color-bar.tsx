import { cn } from "@/lib/utils";

// Solids, then two-ink overprints, then black tints: the order a press
// operator reads a control strip in.
const PATCHES = [
    "var(--process-c)",
    "var(--process-m)",
    "var(--process-y)",
    "var(--process-k)",
    "#2e3192",
    "#e4202a",
    "#00a651",
    "#6d6a64",
    "#b9b4aa",
];

/** A press sheet's colour control strip. Decorative. */
export default function ColorBar({
    size = 10,
    className,
}: {
    size?: number;
    className?: string;
}) {
    return (
        <span aria-hidden className={cn("inline-flex shrink-0", className)}>
            {PATCHES.map((color) => (
                <span
                    key={color}
                    className="block"
                    style={{ width: size, height: size, background: color }}
                />
            ))}
        </span>
    );
}
