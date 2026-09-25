"use client";

import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import { Rnd } from "react-rnd";
import { Expand, Minus, Plus, Shrink } from "lucide-react";
import HandleComponent from "./handle-component";
import { CaseColor } from "@/lib/database/table_types";
import { CASE_RADIUS, CASE_TEMPLATE } from "@/components/utilities/phone";
import CropMarks from "@/components/print/crop-marks";
import { cn } from "@/lib/utils";

type Size = { width: number; height: number };
type Point = { x: number; y: number };
type Box = Point & Size;

interface CanvasEditorProps {
    imageUrl: string;
    imageDimensions: Size;
    color: CaseColor;
    renderedDimensions: Size;
    renderedPosition: Point;
    setRenderedDimenosions: (d: Size) => void;
    setRenderedPosition: (p: Point) => void;
    caseRef: React.RefObject<HTMLDivElement | null>;
    containerRef: React.RefObject<HTMLDivElement | null>;
}

const NUDGE = 1;
const NUDGE_FAST = 10;
const ZOOM_STEP = 1.08;

function ToolButton({
    label,
    onClick,
    children,
}: {
    label: string;
    onClick: () => void;
    children: React.ReactNode;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            title={label}
            className="flex h-8 items-center gap-1.5 rounded-full px-3 text-xs font-semibold text-ink transition-colors hover:bg-ink/[0.07] [&_svg]:size-3.5"
        >
            {children}
        </button>
    );
}

export default function CanvasEditor({
    imageUrl,
    imageDimensions,
    color,
    renderedDimensions,
    renderedPosition,
    setRenderedDimenosions,
    setRenderedPosition,
    caseRef,
    containerRef,
}: CanvasEditorProps) {
    const [ready, setReady] = useState(false);
    const [caseBox, setCaseBox] = useState<Box | null>(null);
    // Latest values for callbacks that outlive a render (resize observer).
    const latest = useRef({ renderedDimensions, renderedPosition, caseBox });
    latest.current = { renderedDimensions, renderedPosition, caseBox };

    const measureCase = useCallback((): Box | null => {
        const container = containerRef.current;
        const el = caseRef.current;
        if (!container || !el) return null;
        const c = container.getBoundingClientRect();
        const k = el.getBoundingClientRect();
        return {
            x: k.left - c.left,
            y: k.top - c.top,
            width: k.width,
            height: k.height,
        };
    }, [caseRef, containerRef]);

    const apply = useCallback(
        (box: Box) => {
            setRenderedDimenosions({
                width: Math.round(box.width),
                height: Math.round(box.height),
            });
            setRenderedPosition({ x: Math.round(box.x), y: Math.round(box.y) });
        },
        [setRenderedDimenosions, setRenderedPosition]
    );

    /** "fill" covers the case edge to edge; "fit" shows the whole photo. */
    const place = useCallback(
        (mode: "fill" | "fit") => {
            const k = measureCase();
            if (!k) return;
            const ratio = imageDimensions.width / imageDimensions.height;
            const wider = ratio > k.width / k.height;
            const matchHeight = wider === (mode === "fill");
            const height = matchHeight ? k.height : k.width / ratio;
            const width = matchHeight ? k.height * ratio : k.width;
            apply({
                width,
                height,
                x: k.x + (k.width - width) / 2,
                y: k.y + (k.height - height) / 2,
            });
        },
        [apply, imageDimensions, measureCase]
    );

    const zoom = (factor: number) => {
        const { width, height } = renderedDimensions;
        const { x, y } = renderedPosition;
        const w = Math.max(40, width * factor);
        const h = (w / width) * height;
        apply({ width: w, height: h, x: x - (w - width) / 2, y: y - (h - height) / 2 });
    };

    useLayoutEffect(() => {
        const k = measureCase();
        setCaseBox(k);
        place("fill");
        setReady(true);
        // Only on mount: later placements come from the person editing.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Keep the photo anchored to the case when the canvas resizes.
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;
        const observer = new ResizeObserver(() => {
            const next = measureCase();
            const prev = latest.current.caseBox;
            if (!next || !prev || !prev.width) {
                setCaseBox(next);
                return;
            }
            const s = next.width / prev.width;
            const { renderedDimensions: d, renderedPosition: p } = latest.current;
            if (s !== 1 || next.x !== prev.x || next.y !== prev.y) {
                apply({
                    width: d.width * s,
                    height: d.height * s,
                    x: next.x + (p.x - prev.x) * s,
                    y: next.y + (p.y - prev.y) * s,
                });
            }
            setCaseBox(next);
        });
        observer.observe(container);
        return () => observer.disconnect();
    }, [apply, containerRef, measureCase]);

    const onKeyDown = (e: React.KeyboardEvent) => {
        const step = e.shiftKey ? NUDGE_FAST : NUDGE;
        const moves: Record<string, Point> = {
            ArrowLeft: { x: -step, y: 0 },
            ArrowRight: { x: step, y: 0 },
            ArrowUp: { x: 0, y: -step },
            ArrowDown: { x: 0, y: step },
        };
        if (moves[e.key]) {
            e.preventDefault();
            setRenderedPosition({
                x: renderedPosition.x + moves[e.key].x,
                y: renderedPosition.y + moves[e.key].y,
            });
        } else if (e.key === "+" || e.key === "=") {
            e.preventDefault();
            zoom(ZOOM_STEP);
        } else if (e.key === "-" || e.key === "_") {
            e.preventDefault();
            zoom(1 / ZOOM_STEP);
        }
    };

    const scale = caseBox
        ? Math.round((renderedDimensions.width / caseBox.width) * 100)
        : 100;

    return (
        <div
            ref={containerRef}
            role="application"
            aria-roledescription="design canvas"
            tabIndex={0}
            onKeyDown={onKeyDown}
            aria-label="Design canvas. Drag the photo to move it and drag its corners to resize. With the canvas focused, arrow keys move the photo and plus or minus resize it."
            className="cutting-mat relative isolate flex h-[clamp(480px,calc(100dvh-15rem),820px)] w-full items-center justify-center overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-cobalt"
        >
            <div className="pointer-events-none relative aspect-[896/1831] h-[80%]">
                <div ref={caseRef} className="relative z-50 size-full">
                    <Image
                        src={CASE_TEMPLATE}
                        alt=""
                        fill
                        priority
                        sizes="320px"
                        className="select-none"
                    />
                </div>
                <div
                    className="absolute inset-[0.5%] z-40 shadow-[0_0_0_99999px_rgb(231_227_217/0.78)]"
                    style={{ borderRadius: CASE_RADIUS }}
                />
                <div
                    className="absolute inset-[0.5%]"
                    style={{ borderRadius: CASE_RADIUS, background: color.hex }}
                />
                <CropMarks gap={10} length={16} className="z-[45]" />
            </div>

            {ready ? (
                <>
                    <Rnd
                        size={renderedDimensions}
                        position={renderedPosition}
                        onDrag={(_, d) => setRenderedPosition({ x: d.x, y: d.y })}
                        onDragStop={(_, d) =>
                            setRenderedPosition({ x: d.x, y: d.y })
                        }
                        onResize={(_, __, ref, ___, pos) => {
                            setRenderedDimenosions({
                                width: ref.offsetWidth,
                                height: ref.offsetHeight,
                            });
                            setRenderedPosition(pos);
                        }}
                        onResizeStop={(_, __, ref, ___, pos) => {
                            setRenderedDimenosions({
                                width: ref.offsetWidth,
                                height: ref.offsetHeight,
                            });
                            setRenderedPosition(pos);
                        }}
                        className="absolute z-20 cursor-grab active:cursor-grabbing"
                        lockAspectRatio
                        resizeHandleComponent={{
                            bottomRight: <HandleComponent />,
                            topRight: <HandleComponent />,
                            bottomLeft: <HandleComponent />,
                            topLeft: <HandleComponent />,
                        }}
                    >
                        <div className="relative size-full">
                            <Image
                                src={imageUrl}
                                crossOrigin="anonymous"
                                alt=""
                                fill
                                sizes="(max-width: 1024px) 100vw, 60vw"
                                draggable={false}
                                className="pointer-events-none select-none"
                            />
                        </div>
                    </Rnd>

                    {/* The selection frame is drawn above the case and its
                        dimmed surround so it stays crisp; the real handles
                        underneath it take the pointer. */}
                    <div
                        aria-hidden
                        className="pointer-events-none absolute z-[60] outline outline-cobalt"
                        style={{
                            left: renderedPosition.x,
                            top: renderedPosition.y,
                            width: renderedDimensions.width,
                            height: renderedDimensions.height,
                        }}
                    >
                        {[
                            "-left-[5px] -top-[5px]",
                            "-right-[5px] -top-[5px]",
                            "-bottom-[5px] -left-[5px]",
                            "-bottom-[5px] -right-[5px]",
                        ].map((pos) => (
                            <span
                                key={pos}
                                className={`absolute size-2.5 border-2 border-cobalt bg-white ${pos}`}
                            />
                        ))}
                        <span className="absolute -top-7 left-0 whitespace-nowrap rounded-[3px] bg-cobalt px-1.5 py-0.5 font-mono text-[0.625rem] font-medium text-white">
                            {scale}%
                        </span>
                    </div>
                </>
            ) : null}

            <div className="absolute left-3 top-3 z-[70] flex items-center gap-0.5 rounded-full border border-rule bg-paper-raised/95 p-1 shadow-sm backdrop-blur">
                <ToolButton label="Fill the case with the photo" onClick={() => place("fill")}>
                    <Expand aria-hidden />
                    Fill
                </ToolButton>
                <ToolButton label="Fit the whole photo on the case" onClick={() => place("fit")}>
                    <Shrink aria-hidden />
                    Fit
                </ToolButton>
                <span aria-hidden className="mx-1 h-4 w-px bg-rule" />
                <ToolButton label="Make the photo smaller" onClick={() => zoom(1 / ZOOM_STEP)}>
                    <Minus aria-hidden />
                    <span className="sr-only">Smaller</span>
                </ToolButton>
                <ToolButton label="Make the photo bigger" onClick={() => zoom(ZOOM_STEP)}>
                    <Plus aria-hidden />
                    <span className="sr-only">Bigger</span>
                </ToolButton>
            </div>

            <p
                className={cn(
                    "type-label pointer-events-none absolute bottom-3 left-3 z-[70] hidden text-ink-soft sm:block"
                )}
            >
                Drag to move · corners to resize · arrow keys to nudge
            </p>
        </div>
    );
}
