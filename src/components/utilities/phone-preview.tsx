"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { AspectRatio } from "../ui/aspect-ratio";
import CustomImage from "./custom-image";

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

    const handleResize = () => {
        if (!ref.current) return;
        const { width, height } = ref.current.getBoundingClientRect();
        setRenderedDimensions({ width, height });
    };

    useEffect(() => {
        handleResize();

        window.addEventListener("resize", handleResize);

        return () => window.removeEventListener("resize", handleResize);
    }, [ref.current]);

    return (
        <AspectRatio ref={ref} ratio={3000 / 2001} className="relative">
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
                    className={cn(
                        "phone-skew relative z-20 rounded-t-[15px] rounded-b-[10px] md:rounded-t-[30px] md:rounded-b-[20px]"
                    )}
                    style={{ background: color }}
                    src={croppedImageUrl}
                />
            </div>

            <div className="relative h-full w-full z-40">
                <CustomImage
                    alt="phone"
                    src="/assets/phone-template/clearphone.png"
                    className="pointer-events-none h-full w-full rounded-md"
                />
            </div>
        </AspectRatio>
    );
};

export default PhonePreview;
