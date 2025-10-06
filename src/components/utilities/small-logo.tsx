import { Italiana } from "next/font/google";
import { cn } from "@/lib/utils"; // adjust import path if needed

const italiana = Italiana({
    subsets: ["latin"],
    weight: "400",
});

interface SmallLogoProps {
    className?: string;
}

const SmallLogo = ({ className }: SmallLogoProps) => {
    return (
        <span
            className={cn(
                italiana.className,
                "text-base tracking-wide font-bold text-primary",
                className
            )}
        >
            DESIGN<span className="text-blue-600">MY</span>CASE
        </span>
    );
};

export default SmallLogo;
