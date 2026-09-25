"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import PressSheet from "@/components/print/press-sheet";
import PrintedCase from "@/components/print/printed-case";
import { cn } from "@/lib/utils";

const PRINTS = [
    { src: "/assets/homepage/gallery_16.jpg", name: "Jellyfish" },
    { src: "/assets/testimonials/3.jpg", name: "Pug on yellow" },
    { src: "/assets/homepage/feat1.jpg", name: "Butterfly" },
    { src: "/assets/testimonials/4.jpg", name: "Forest walk" },
    { src: "/assets/homepage/anime.png", name: "Night city" },
    { src: "/assets/testimonials/2.jpg", name: "Cat" },
];

const INTERVAL_MS = 4200;

export default function HeroPress() {
    const [index, setIndex] = useState(0);
    // Auto-advance until the visitor picks a print, hovers or focuses the
    // sheet, or has asked their OS for less motion.
    const [autoplay, setAutoplay] = useState(false);
    const [paused, setPaused] = useState(false);

    useEffect(() => {
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
        setAutoplay(!reduce.matches);
    }, []);

    useEffect(() => {
        if (!autoplay || paused) return;
        const id = window.setInterval(() => {
            if (document.visibilityState !== "visible") return;
            setIndex((i) => (i + 1) % PRINTS.length);
        }, INTERVAL_MS);
        return () => window.clearInterval(id);
    }, [autoplay, paused]);

    const print = PRINTS[index];
    const proof = String(index + 1).padStart(2, "0");

    return (
        <div
            className="relative"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onFocus={() => setPaused(true)}
            onBlur={() => setPaused(false)}
        >
            <div
                aria-hidden
                className="halftone absolute -right-4 bottom-24 left-8 top-6 rounded-[3px] bg-cobalt text-white/[0.16] sm:-right-6 lg:-right-10"
            />

            <PressSheet
                className="relative mx-auto w-[92%] max-w-[400px] -rotate-2 transition-transform duration-700 ease-out-expo hover:-rotate-1 sm:w-full"
                slug={
                    <>
                        Proof {proof}/0{PRINTS.length}
                        <span className="text-ink-soft/60"> · </span>
                        {print.name}
                    </>
                }
                footer="1 of 1"
                trimClassName="w-[180px] sm:w-[210px]"
            >
                <PrintedCase
                    src={print.src}
                    alt={`A phone case printed with a photo: ${print.name}`}
                    sizes="(max-width: 640px) 180px, 210px"
                    priority={index === 0}
                />
            </PressSheet>

            <div className="relative mt-10 flex flex-wrap items-center justify-center gap-x-4 gap-y-3 lg:justify-start lg:pl-8">
                <p id="try-a-print" className="type-label text-ink-soft">
                    Try a print
                </p>
                <div
                    role="group"
                    aria-labelledby="try-a-print"
                    className="flex gap-2"
                >
                    {PRINTS.map((p, i) => (
                        <button
                            key={p.src}
                            type="button"
                            aria-pressed={i === index}
                            aria-label={`Print ${p.name}`}
                            onClick={() => {
                                setIndex(i);
                                setAutoplay(false);
                            }}
                            className={cn(
                                "relative size-11 overflow-hidden rounded-[5px] ring-offset-2 ring-offset-paper transition-[box-shadow,transform] duration-300 ease-out-expo hover:-translate-y-0.5 sm:size-12",
                                i === index
                                    ? "ring-2 ring-ink"
                                    : "ring-1 ring-ink/15"
                            )}
                        >
                            <Image
                                src={p.src}
                                alt=""
                                fill
                                sizes="48px"
                                className="object-cover"
                            />
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
