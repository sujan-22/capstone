import Image from "next/image";
import React from "react";
import { ArrowRight } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import CropMarks from "@/components/print/crop-marks";
import { cn } from "@/lib/utils";

interface ImageComponentProps {
    img: {
        id: string;
        url: string;
    };
    /** Position in the grid, printed as a frame number. */
    index?: number;
    isPending: boolean;
    anyPending: boolean;
    handleUseImage: (gallery_image_id: string, imageUrl: string) => void;
}

const ImageComponent: React.FC<ImageComponentProps> = ({
    img,
    index,
    isPending,
    anyPending,
    handleUseImage,
}) => {
    const frame =
        index !== undefined ? String(index + 1).padStart(2, "0") : null;

    return (
        <button
            type="button"
            onClick={() => handleUseImage(img.id, img.url)}
            disabled={anyPending}
            aria-busy={isPending || undefined}
            className="group block w-full rounded-md text-left disabled:cursor-wait"
        >
            <span className="relative block aspect-[4/5] w-full">
                <span className="absolute inset-0 overflow-hidden rounded-md bg-paper-sunken">
                    <Image
                        src={img.url}
                        alt=""
                        fill
                        sizes="(max-width: 768px) 50vw, 25vw"
                        className={cn(
                            "object-cover transition-transform duration-700 ease-out-expo group-hover:scale-[1.04]",
                            anyPending && !isPending && "opacity-50"
                        )}
                    />
                    <span
                        aria-hidden
                        className="absolute inset-x-0 bottom-0 flex translate-y-full items-center justify-between bg-cobalt px-3.5 py-2.5 text-sm font-semibold text-white transition-transform duration-500 ease-out-expo group-hover:translate-y-0 group-focus-visible:translate-y-0"
                    >
                        Use this image
                        <ArrowRight aria-hidden className="size-4" />
                    </span>
                    {isPending ? (
                        <span className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-ink/75 text-sm text-paper">
                            <Spinner aria-hidden="true" className="size-5" />
                            Setting up your design…
                        </span>
                    ) : null}
                </span>
                <CropMarks
                    gap={6}
                    length={10}
                    className="text-ink/40 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                />
            </span>
            <span className="mt-3 flex flex-col items-start gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                <span className="type-label text-ink-soft">
                    {frame ? `Frame ${frame}` : "Gallery image"}
                </span>
                <span className="inline-flex items-center gap-1 whitespace-nowrap text-sm font-semibold text-cobalt">
                    Use this image
                    <ArrowRight
                        aria-hidden
                        className="size-3.5 transition-transform duration-300 ease-out-expo group-hover:translate-x-0.5"
                    />
                </span>
            </span>
        </button>
    );
};

export default ImageComponent;
