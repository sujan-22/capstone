"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { CASE_RADIUS, CASE_TEMPLATE } from "@/components/utilities/phone";

/*
 * Prints an image the way a press does: as three separate ink plates that
 * start out of register and slide into place.
 *
 * Each plate is the photo screened with one pure colour, which keeps a single
 * channel: screen with cyan (#0ff) leaves (R, 1, 1), magenta leaves (1, G, 1),
 * yellow leaves (1, 1, B). Multiplying the three back together gives exactly
 * (R, G, B), so once the plates land the stack is pixel-identical to the
 * original, and while they're offset the edges fringe the way misregistered
 * print does. Once registered, the stack is swapped for a single image.
 */
const PLATES = [
    { key: "c", screen: "#00ffff", from: { x: -18, y: 6 }, delay: 0 },
    { key: "m", screen: "#ff00ff", from: { x: 14, y: -12 }, delay: 0.09 },
    { key: "y", screen: "#ffff00", from: { x: 6, y: 16 }, delay: 0.18 },
] as const;

interface PrintedCaseProps {
    src: string;
    alt: string;
    sizes: string;
    className?: string;
    priority?: boolean;
    /** Case colour, seen wherever the print leaves the case bare. */
    background?: string;
}

export default function PrintedCase({
    src,
    alt,
    sizes,
    className,
    priority,
    background = "#ffffff",
}: PrintedCaseProps) {
    const [loaded, setLoaded] = useState<string | null>(null);
    const [registered, setRegistered] = useState<string | null>(null);
    const ready = loaded === src;
    const isRegistered = registered === src;

    return (
        <div
            role="img"
            aria-label={alt}
            className={cn(
                "relative isolate aspect-[896/1831] w-full select-none",
                className
            )}
        >
            <div
                className="absolute inset-[0.5%] -z-10 overflow-hidden"
                style={{
                    borderRadius: CASE_RADIUS,
                    background: isRegistered ? background : "#ffffff",
                }}
            >
                {isRegistered ? (
                    <Image
                        src={src}
                        alt=""
                        fill
                        sizes={sizes}
                        priority={priority}
                        className="object-cover"
                    />
                ) : (
                    <div key={src} className="absolute inset-0">
                        {PLATES.map((plate, i) => (
                            <motion.div
                                key={plate.key}
                                // White under each plate keeps transparent
                                // parts of a print from inking to black.
                                className="absolute inset-0 isolate bg-white"
                                style={{
                                    mixBlendMode: i === 0 ? "normal" : "multiply",
                                }}
                                initial={{
                                    opacity: 0,
                                    x: plate.from.x,
                                    y: plate.from.y,
                                }}
                                animate={
                                    ready
                                        ? { opacity: 1, x: 0, y: 0 }
                                        : {
                                              opacity: 0,
                                              x: plate.from.x,
                                              y: plate.from.y,
                                          }
                                }
                                transition={{
                                    opacity: { duration: 0.28, delay: plate.delay },
                                    x: {
                                        type: "spring",
                                        stiffness: 140,
                                        damping: 15,
                                        delay: 0.42 + plate.delay,
                                    },
                                    y: {
                                        type: "spring",
                                        stiffness: 140,
                                        damping: 15,
                                        delay: 0.42 + plate.delay,
                                    },
                                }}
                                onAnimationComplete={
                                    i === PLATES.length - 1
                                        ? () => ready && setRegistered(src)
                                        : undefined
                                }
                            >
                                <Image
                                    src={src}
                                    alt=""
                                    fill
                                    sizes={sizes}
                                    priority={priority}
                                    className="object-cover"
                                    onLoad={
                                        i === 0
                                            ? () => setLoaded(src)
                                            : undefined
                                    }
                                />
                                <span
                                    className="absolute inset-0"
                                    style={{
                                        background: plate.screen,
                                        mixBlendMode: "screen",
                                    }}
                                />
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
            <Image
                src={CASE_TEMPLATE}
                alt=""
                fill
                sizes={sizes}
                priority={priority}
                className="pointer-events-none select-none"
            />
        </div>
    );
}
