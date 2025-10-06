"use client";

import { HTMLAttributes, useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";
import { cn } from "@/lib/utils";
import Phone from "./phone";
import { Icons } from "./icons";

const PHONES = [
    "/assets/testimonials/1.jpg",
    "/assets/testimonials/2.jpg",
    "/assets/testimonials/3.jpg",
    "/assets/testimonials/4.jpg",
    "/assets/testimonials/5.jpg",
    "/assets/testimonials/6.jpg",
];

function splitArray<T>(array: Array<T>, numParts: number) {
    const result: Array<Array<T>> = [];

    for (let i = 0; i < array.length; i++) {
        const index = i % numParts;
        if (!result[index]) {
            result[index] = [];
        }
        result[index].push(array[i]);
    }

    return result;
}

function ReviewColumn({
    reviews,
    className,
    reviewClassName,
    msPerPixel = 0,
}: {
    reviews: string[];
    className?: string;
    reviewClassName?: (reviewIndex: number) => string;
    msPerPixel?: number;
}) {
    const columnRef = useRef<HTMLDivElement | null>(null);
    const [columnHeight, setColumnHeight] = useState(0);
    const duration = `${columnHeight * msPerPixel}ms`;

    useEffect(() => {
        if (!columnRef.current) return;

        const resizeObserver = new window.ResizeObserver(() => {
            setColumnHeight(columnRef.current?.offsetHeight ?? 0);
        });

        resizeObserver.observe(columnRef.current);

        return () => {
            resizeObserver.disconnect();
        };
    }, []);

    return (
        <div
            ref={columnRef}
            className={cn("animate-marquee space-y-8 py-4", className)}
            style={{ "--marquee-duration": duration } as React.CSSProperties}
        >
            {reviews.concat(reviews).map((imgSrc, reviewIndex) => (
                <Review
                    key={reviewIndex}
                    className={reviewClassName?.(reviewIndex % reviews.length)}
                    imgSrc={imgSrc}
                />
            ))}
        </div>
    );
}

interface ReviewProps extends HTMLAttributes<HTMLDivElement> {
    imgSrc: string;
}

function Review({ imgSrc, className, ...props }: ReviewProps) {
    const ANIMATIONS_DELAYS = ["0s", "0.1s", "0.2s", "0.3s", "0.4s", "0.5s"];

    const animationDelay =
        ANIMATIONS_DELAYS[Math.floor(Math.random() * ANIMATIONS_DELAYS.length)];

    return (
        <div
            className={cn(
                "animate-fade-in rounded-[2.25rem] bg-white p-6 opacity-0 shadow-xl shadow-slate-900/5",
                className
            )}
            style={{ animationDelay }}
            {...props}
        >
            <Phone imgSrc={imgSrc} />
        </div>
    );
}

function ReviewGrid() {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const isInView = useInView(containerRef, { once: true, amount: 0.4 });
    const columns = splitArray(PHONES, 3);
    const column1 = columns[0];
    const column2 = columns[1];
    const column3 = splitArray(columns[2], 2);

    return (
        <div
            ref={containerRef}
            className="relative max-w-[1200px] -mx-4 mt-16 grid h-[49rem] max-h-[150vh] grid-cols-1 items-start gap-4 overflow-hidden px-1 sm:mt-20 md:grid-cols-2 lg:grid-cols-3"
        >
            {isInView ? (
                <>
                    <ReviewColumn
                        reviews={[...column1, ...column3.flat(), ...column2]}
                        reviewClassName={(reviewIndex) =>
                            cn({
                                "md:hidden":
                                    reviewIndex >=
                                    column1.length + column3[0].length,
                                "lg:hidden": reviewIndex >= column1.length,
                            })
                        }
                        msPerPixel={10}
                    />
                    <ReviewColumn
                        reviews={[...column2, ...column3[1]]}
                        className="hidden md:block"
                        reviewClassName={(reviewIndex) =>
                            reviewIndex >= column2.length ? "lg:hidden" : ""
                        }
                        msPerPixel={15}
                    />
                    <ReviewColumn
                        reviews={column3.flat()}
                        className="hidden md:block"
                        msPerPixel={10}
                    />
                </>
            ) : null}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-slate-100 rounded-xl" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-slate-100 rounded-xl" />
        </div>
    );
}

export default function Reviews() {
    return (
        <section className="py-16">
            <div className="flex flex-col items-center gap-16">
                <div className="flex flex-col items-center gap-4 sm:gap-6">
                    <h2 className="tracking-tight text-center text-balance !leading-tight font-bold text-5xl md:text-6xl">
                        See What Our Customers{" "}
                        <span className="relative inline-block px-2">
                            Love{" "}
                            <Icons.underlineHand className="hidden sm:block pointer-events-none absolute w-full inset-x-0 -bottom-6 text-blue-600" />
                        </span>{" "}
                    </h2>
                    <p className="text-center text-muted-foreground max-w-xl mx-auto mt-4">
                        Check out real customer reviews and see how our custom
                        phone cases bring style, personality, and protection
                        together. Get inspired for your own unique design!
                    </p>
                </div>
                <ReviewGrid />
            </div>
        </section>
    );
}
