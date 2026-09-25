import Image from "next/image";
import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

// The editor draws designs against this template, so cropped images share
// its 896 × 1831 aspect ratio. Its corners are transparent, so it sits on any
// background.
export const CASE_TEMPLATE = "/assets/phone-template/phone-template.png";
// The case's outer corner as a share of width / height.
export const CASE_RADIUS = "13.5% / 6.6%";

interface PhoneProps extends HTMLAttributes<HTMLDivElement> {
    imgSrc: string;
    /** Placeholder tone behind the print while it loads, for dark grounds. */
    dark?: boolean;
    altText?: string;
    sizes?: string;
    priority?: boolean;
}

const Phone = ({
    imgSrc,
    className,
    dark = false,
    altText,
    sizes = "(max-width: 640px) 60vw, 320px",
    priority,
    ...props
}: PhoneProps) => {
    return (
        <div
            role="img"
            aria-label={altText ?? "Phone case"}
            className={cn(
                "pointer-events-none relative isolate aspect-[896/1831] w-full select-none",
                className
            )}
            {...props}
        >
            <div
                className={cn(
                    "absolute inset-[0.5%] -z-10 overflow-hidden",
                    dark ? "bg-ink-raised" : "bg-paper-sunken"
                )}
                style={{ borderRadius: CASE_RADIUS }}
            >
                {imgSrc ? (
                    <Image
                        src={imgSrc}
                        alt=""
                        fill
                        sizes={sizes}
                        priority={priority}
                        className="object-cover"
                    />
                ) : null}
            </div>
            <Image
                src={CASE_TEMPLATE}
                alt=""
                fill
                sizes={sizes}
                priority={priority}
                className="select-none"
            />
        </div>
    );
};

export default Phone;
