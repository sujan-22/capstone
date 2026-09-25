"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { AspectRatio } from "../ui/aspect-ratio";
import CustomImage from "./custom-image";

// The design composited onto a photo of the case in someone's hand. The
// offsets are measured against the 3000 × 2001 hand photo.
const PhonePreview = ({
    croppedImageUrl,
    color,
}: {
    croppedImageUrl: string;
    color: string;
}) => {
    const ref = useRef<HTMLDivElement>(null);

    const [renderedDimensions, setRenderedDimensions] = useState({
        height: 0,
        width: 0,
    });

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const observer = new ResizeObserver(() => {
            const { width, height } = el.getBoundingClientRect();
            setRenderedDimensions({ width, height });
        });
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    return (
        <AspectRatio
            ref={ref}
            ratio={3000 / 2001}
            className="relative isolate overflow-hidden"
        >
            {renderedDimensions.width ? (
                <div
                    className="absolute z-20"
                    style={{
                        left:
                            renderedDimensions.width / 2 -
                            renderedDimensions.width / (1216 / 125),
                        top: renderedDimensions.height / 6.5,
                    }}
                >
                    <CustomImage
                        alt=""
                        width={renderedDimensions.width / (3000 / 655)}
                        className="phone-skew relative z-20 rounded-b-[10px] rounded-t-[15px] md:rounded-b-[20px] md:rounded-t-[30px]"
                        style={{ background: color }}
                        src={croppedImageUrl}
                    />
                </div>
            ) : null}

            <div className="relative z-40 h-full w-full">
                <Image
                    src="/assets/phone-template/clearphone.png"
                    alt="Your case, held in a hand"
                    fill
                    sizes="(max-width: 1024px) 100vw, 720px"
                    className="pointer-events-none select-none"
                />
            </div>
        </AspectRatio>
    );
};

export default PhonePreview;
