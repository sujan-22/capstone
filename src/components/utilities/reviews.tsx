"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import MaxWidthWrapper from "./max-width-wrapper";
import Phone from "./phone";

const PHONES = [
    "/assets/testimonials/1.jpg",
    "/assets/testimonials/2.jpg",
    "/assets/testimonials/3.jpg",
    "/assets/testimonials/4.jpg",
    "/assets/testimonials/5.jpg",
    "/assets/testimonials/6.jpg",
    "/assets/testimonials/7.jpg",
    "/assets/homepage/feat1.jpg",
    "/assets/homepage/anime.png",
];

// Columns start at different points in the list so neighbours never match.
const COLUMNS = [
    { offset: 0, msPerPixel: 9, className: "" },
    { offset: 3, msPerPixel: 12, className: "mt-24" },
    { offset: 6, msPerPixel: 10.5, className: "hidden sm:flex mt-10" },
];

function rotate<T>(list: T[], by: number) {
    return [...list.slice(by), ...list.slice(0, by)];
}

function WallColumn({
    images,
    msPerPixel,
    className,
}: {
    images: string[];
    msPerPixel: number;
    className?: string;
}) {
    const columnRef = useRef<HTMLDivElement | null>(null);
    const [columnHeight, setColumnHeight] = useState(0);

    useEffect(() => {
        if (!columnRef.current) return;
        const observer = new window.ResizeObserver(() => {
            setColumnHeight(columnRef.current?.offsetHeight ?? 0);
        });
        observer.observe(columnRef.current);
        return () => observer.disconnect();
    }, []);

    return (
        <div
            ref={columnRef}
            className={cn("animate-marquee flex flex-col gap-6 pb-6", className)}
            style={
                {
                    "--marquee-duration": `${columnHeight * msPerPixel}ms`,
                } as React.CSSProperties
            }
        >
            {images.concat(images).map((src, i) => (
                <Phone
                    key={`${src}-${i}`}
                    imgSrc={src}
                    altText=""
                    aria-hidden
                    sizes="(max-width: 640px) 45vw, 200px"
                    className="drop-shadow-[0_24px_28px_rgb(10_14_80/0.45)]"
                />
            ))}
        </div>
    );
}

export default function Reviews() {
    return (
        <section className="relative overflow-hidden bg-cobalt text-white">
            <MaxWidthWrapper className="grid gap-12 py-20 sm:py-28 lg:grid-cols-12 lg:gap-8">
                <div className="relative z-10 flex flex-col justify-center lg:col-span-5">
                    <p className="type-label text-white/80">Recently printed</p>
                    <h2 className="type-display mt-5 max-w-[10ch]">
                        Every one&rsquo;s different.
                    </h2>
                    <p className="mt-6 max-w-md text-lg leading-relaxed text-white/85">
                        Pets, places, fandoms and everything in between. No two
                        cases off our press come out the same, because no two
                        photos are.
                    </p>
                    <dl className="mt-10 grid max-w-sm grid-cols-2 border-t border-white/25 pt-5">
                        <div>
                            <dt className="type-label text-white/80">
                                Print warranty
                            </dt>
                            <dd className="type-title mt-2">5 years</dd>
                        </div>
                        <div>
                            <dt className="type-label text-white/80">
                                Shipping
                            </dt>
                            <dd className="type-title mt-2">Free</dd>
                        </div>
                    </dl>
                </div>

                <div
                    aria-hidden
                    className="relative -mx-4 h-[34rem] overflow-hidden lg:-mr-[calc(max(0px,(100vw-1360px)/2)+2.5rem)] [mask-image:linear-gradient(to_bottom,transparent,black_14%,black_86%,transparent)] sm:mx-0 sm:h-[42rem] lg:col-span-7"
                >
                    <div className="absolute -inset-x-8 -top-16 grid origin-top rotate-[-7deg] grid-cols-2 gap-6 sm:grid-cols-3">
                        {COLUMNS.map((col) => (
                            <WallColumn
                                key={col.offset}
                                images={rotate(PHONES, col.offset)}
                                msPerPixel={col.msPerPixel}
                                className={col.className}
                            />
                        ))}
                    </div>
                </div>
            </MaxWidthWrapper>
        </section>
    );
}
