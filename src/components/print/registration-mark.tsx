import { cn } from "@/lib/utils";

/** The target printers use to line up each ink plate. */
export default function RegistrationMark({
    size = 18,
    className,
}: {
    size?: number;
    className?: string;
}) {
    return (
        <svg
            aria-hidden
            viewBox="0 0 20 20"
            width={size}
            height={size}
            fill="none"
            stroke="currentColor"
            strokeWidth={1}
            className={cn("shrink-0 text-ink", className)}
        >
            <circle cx="10" cy="10" r="5.5" />
            <circle cx="10" cy="10" r="2.25" fill="currentColor" stroke="none" />
            <path d="M10 0.5v19M0.5 10h19" />
        </svg>
    );
}
