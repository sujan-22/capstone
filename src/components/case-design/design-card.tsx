"use client";

import { Heart } from "lucide-react";
import Phone from "../utilities/phone";
import CropMarks from "../print/crop-marks";
import { Button } from "../ui/button";
import { Spinner } from "../ui/spinner";
import { cn, formatPrice } from "@/lib/utils";

export interface DesignCardProps {
    id: string;
    caseName: string;
    modelName: string;
    color: string;
    material: string;
    finish: string;
    price: number;
    croppedImgUrl: string;
    altText?: string;
    tone?: "ink" | "paper";
    isFavorited: boolean;
    isFavoriteLoading: boolean;
    isBuying: boolean;
    onBuy: () => void;
    onFavorite: () => void;
}

/** A shared case: its print, a job number, the spec, and what you can do. */
export default function DesignCard({
    id,
    caseName,
    modelName,
    color,
    material,
    finish,
    price,
    croppedImgUrl,
    altText,
    tone = "paper",
    isFavorited,
    isFavoriteLoading,
    isBuying,
    onBuy,
    onFavorite,
}: DesignCardProps) {
    const ink = tone === "ink";
    const specs = [
        ["Model", modelName],
        ["Colour", color],
        ["Material", material],
        ["Finish", finish],
    ];

    return (
        <article className="group @container flex flex-col">
            <div
                className={cn(
                    "relative flex justify-center overflow-hidden rounded-md px-10 pb-9 pt-12",
                    ink
                        ? "bg-ink-raised ring-1 ring-paper/10"
                        : "bg-paper-sunken"
                )}
            >
                <span
                    className={cn(
                        "type-label absolute left-4 top-4",
                        ink ? "text-paper/60" : "text-ink-soft"
                    )}
                >
                    No. {id.slice(0, 6).toUpperCase()}
                </span>
                <div className="relative w-[54%] max-w-[190px] transition-transform duration-700 ease-out-expo group-hover:-translate-y-1.5 group-hover:-rotate-2">
                    <Phone
                        imgSrc={croppedImgUrl}
                        altText={altText ?? caseName}
                        dark={ink}
                        sizes="(max-width: 640px) 50vw, 190px"
                        className="drop-shadow-[0_24px_24px_rgb(0_0_0/0.28)]"
                    />
                    <CropMarks
                        gap={10}
                        length={12}
                        className={cn(
                            "opacity-0 transition-opacity duration-500 group-hover:opacity-100",
                            ink ? "text-paper/50" : "text-ink/40"
                        )}
                    />
                </div>
            </div>

            <div className="mt-5 flex items-start justify-between gap-4">
                <h3 className="type-heading line-clamp-2 min-h-[2.7rem]">
                    {caseName}
                </h3>
                <p className="shrink-0 pt-0.5 font-mono text-[0.9375rem] font-medium">
                    {formatPrice(price)}
                </p>
            </div>

            <dl
                className={cn(
                    "mt-3 grid gap-x-5 text-sm @sm:grid-cols-2",
                    ink ? "text-paper" : "text-ink"
                )}
            >
                {specs.map(([label, value]) => (
                    <div
                        key={label}
                        className={cn(
                            "flex min-w-0 items-baseline justify-between gap-3 border-t py-1.5 @sm:py-2",
                            ink ? "border-paper/12" : "border-rule"
                        )}
                    >
                        <dt className={ink ? "text-paper/60" : "text-ink-soft"}>
                            {label}
                        </dt>
                        <dd className="truncate text-right font-medium">
                            {value}
                        </dd>
                    </div>
                ))}
            </dl>

            <div className="mt-4 flex gap-2">
                <Button
                    onClick={onBuy}
                    disabled={isBuying}
                    isLoading={isBuying}
                    size="sm"
                    variant={ink ? "paper" : "default"}
                    className="h-9 flex-1 px-4"
                >
                    Buy now
                    <span className="sr-only">: {caseName}</span>
                </Button>
                <Button
                    onClick={onFavorite}
                    aria-pressed={isFavorited}
                    disabled={isFavoriteLoading}
                    size="sm"
                    variant={ink ? "outline-paper" : "outline"}
                    className="h-9 px-3.5"
                >
                    {isFavoriteLoading ? (
                        <Spinner aria-hidden="true" />
                    ) : (
                        <Heart
                            aria-hidden
                            className={cn(
                                "size-4 transition-transform duration-300",
                                isFavorited &&
                                    "scale-110 fill-process-m text-process-m"
                            )}
                        />
                    )}
                    {isFavorited ? "Saved" : "Save"}
                    <span className="sr-only">: {caseName}</span>
                </Button>
            </div>
        </article>
    );
}
