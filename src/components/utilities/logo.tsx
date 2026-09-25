import Link from "next/link";
import { cn } from "@/lib/utils";

/** A case in its crop marks: the product, mid-design. */
export function BrandMark({
    size = 26,
    className,
}: {
    size?: number;
    className?: string;
}) {
    return (
        <svg
            aria-hidden
            viewBox="0 0 26 26"
            width={size}
            height={size}
            className={cn("shrink-0", className)}
        >
            <rect x="7.5" y="4.5" width="11" height="17" rx="3" fill="var(--cobalt)" />
            <rect x="9" y="6" width="4.4" height="4.4" rx="1.2" fill="currentColor" />
            <path
                d="M3.2 4.5H6M7.5 0.2V3M20 4.5h2.8M18.5 0.2V3M3.2 21.5H6M7.5 23v2.8M20 21.5h2.8M18.5 23v2.8"
                stroke="currentColor"
                strokeWidth="1.1"
            />
        </svg>
    );
}

const Logo = ({ className }: { className?: string }) => {
    return (
        <Link
            href="/"
            aria-label="Design My Case, home"
            className={cn(
                "group inline-flex items-center gap-2 rounded-sm text-ink",
                className
            )}
        >
            <BrandMark className="transition-transform duration-500 ease-out-expo group-hover:-rotate-6" />
            <span
                aria-hidden
                className="text-[1.3rem] leading-none font-extrabold tracking-[-0.045em] wdth-expanded"
            >
                design<span className="text-cobalt">my</span>case
            </span>
        </Link>
    );
};

export default Logo;
