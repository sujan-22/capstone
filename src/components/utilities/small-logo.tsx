import { cn } from "@/lib/utils";

interface SmallLogoProps {
    className?: string;
}

/** The brand name set inline in running text. */
const SmallLogo = ({ className }: SmallLogoProps) => {
    return (
        <span className={cn("font-bold tracking-[-0.02em]", className)}>
            Design<span className="text-cobalt">My</span>Case
        </span>
    );
};

export default SmallLogo;
