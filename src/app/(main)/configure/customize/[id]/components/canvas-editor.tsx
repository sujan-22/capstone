"use client";

import React from "react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import NextImage from "next/image";
import { Rnd } from "react-rnd";
import HandleComponent from "./handle-component";
import { CaseColor } from "@/lib/database/table_types";
import { cn } from "@/lib/utils";

interface CanvasEditorProps {
    imageUrl: string;
    imageDimensions: { width: number; height: number };
    color: CaseColor;
    renderedDimensions: { width: number; height: number };
    renderedPosition: { x: number; y: number };
    setRenderedDimenosions: (d: { width: number; height: number }) => void;
    setRenderedPosition: (p: { x: number; y: number }) => void;
    caseRef: React.RefObject<HTMLDivElement | null>;
    containerRef: React.RefObject<HTMLDivElement | null>;
}

export default function CanvasEditor({
    imageUrl,
    imageDimensions,
    color,
    // renderedDimensions,
    // renderedPosition,
    setRenderedDimenosions,
    setRenderedPosition,
    caseRef,
    containerRef,
}: CanvasEditorProps) {
    return (
        <div
            ref={containerRef}
            className="relative h-[70vh] overflow-hidden col-span-2 w-full max-w-4xl flex items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-12 text-center focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
            <div className="relative w-60 bg-opacity-50 pointer-events-none aspect-[896/1831">
                <AspectRatio
                    ref={caseRef}
                    ratio={896 / 1831}
                    className="pointer-events-none relative z-50 aspect-[896/1831] w-full"
                >
                    <NextImage
                        fill
                        alt=""
                        src="/assets/phone-template/phone-template.png"
                        className=" pointer-events-none z-50 select-none"
                    />
                </AspectRatio>
                <div className=" absolute z-40 inset-0 left-[3px] top-px right-[3px] bottom-px rounded-[32px] shadow-[0_0_0_99999px_rgba(229,231,235,0.6)]" />
                <div
                    className={cn(
                        "absolute inset-0 left-[3px] top-px right-[3px] bottom-px rounded-[32px]"
                    )}
                    style={{ background: color.hex }}
                />
            </div>

            <Rnd
                default={{
                    x: 150,
                    y: 205,
                    height: imageDimensions.height / 4,
                    width: imageDimensions.width / 4,
                }}
                onResizeStop={(_, __, ref, ___, { x, y }) => {
                    setRenderedDimenosions({
                        height: parseInt(ref.style.height.slice(0, -2)),
                        width: parseInt(ref.style.width.slice(0, -2)),
                    });

                    setRenderedPosition({ x, y });
                }}
                onDragStop={(_, data) => {
                    const { x, y } = data;
                    setRenderedPosition({ x, y });
                }}
                className="absolute z-20 border-[3px] border-primary"
                lockAspectRatio
                resizeHandleComponent={{
                    bottomRight: <HandleComponent />,
                    topRight: <HandleComponent />,
                    bottomLeft: <HandleComponent />,
                    topLeft: <HandleComponent />,
                }}
            >
                <div className="relative w-full h-full">
                    <NextImage
                        src={imageUrl}
                        alt=""
                        fill
                        unoptimized
                        crossOrigin="anonymous"
                        className=" pointer-events-none"
                    />
                </div>
            </Rnd>
        </div>
    );
}
