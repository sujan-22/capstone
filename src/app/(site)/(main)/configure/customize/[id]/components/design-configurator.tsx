"use client";

import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { FaArrowRightLong } from "react-icons/fa6";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { formatPrice } from "@/lib/utils";
import {
    CaseColor,
    CaseFinish,
    CaseMaterial,
    PhoneModel,
} from "@/lib/database/table_types";
import { updateImageInAWS, updateCaseConfig } from "../actions/actions";
import CanvasEditor from "./canvas-editor";
import ColorPicker from "./color-picker";
import ModelSelector from "./model-selector";
import OptionRadioGroup from "./options-radio-group";

interface Props {
    configId: string;
    imageUrl: string;
    croppedImageUrl: string | null;
    imageDimensions: { width: number; height: number };
    models: PhoneModel[];
    materials: CaseMaterial[];
    finishes: CaseFinish[];
    colors: CaseColor[];
    userId: string;
    caseConfig: {
        caseFinishId: string;
        caseMaterialId: string;
        caseColorId: string;
        caseModelId: string;
    };
}

export default function DesignConfigurator(props: Props) {
    const {
        configId,
        imageUrl,
        imageDimensions,
        models,
        materials,
        finishes,
        colors,
        userId,
        caseConfig,
        croppedImageUrl,
    } = props;
    const { toast } = useToast();
    const router = useRouter();

    const [options, setOptions] = useState({
        color: colors.find((color) => color.id === caseConfig.caseColorId),
        model: models.find((model) => model.id === caseConfig.caseModelId),
        material: materials.find(
            (material) => material.id === caseConfig.caseMaterialId
        ),
        finish: finishes.find(
            (finish) => finish.id === caseConfig.caseFinishId
        ),
    } as {
        color: CaseColor;
        model: PhoneModel;
        material: CaseMaterial;
        finish: CaseFinish;
    });

    const [renderedDimensions, setRenderedDimenosions] = useState({
        width: imageDimensions.width / 4,
        height: imageDimensions.height / 4,
    });

    const [renderedPosition, setRenderedPosition] = useState({
        x: 150,
        y: 205,
    });

    const caseRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const saveImageMut = useMutation({
        mutationKey: ["update-image"],
        mutationFn: async (args: { file: File }) =>
            updateImageInAWS(args.file, configId, userId, croppedImageUrl),
        onError: () =>
            toast({
                title: "Something went wrong",
                description:
                    "There was an error uploading the image. Please try again.",
                variant: "destructive",
            }),
    });

    const updateConfigMut = useMutation({
        mutationKey: ["update-config"],
        mutationFn: async (args: {
            colorId: string;
            modelId: string;
            finishId: string;
            materialId: string;
            caseDesignId: string;
        }) =>
            updateCaseConfig(args.caseDesignId, {
                colorId: args.colorId,
                materialId: args.materialId,
                finishId: args.finishId,
                modelId: args.modelId,
            }),
        onError: () =>
            toast({
                title: "Something went wrong",
                description:
                    "There was an error saving the configuration. Please try again.",
                variant: "destructive",
            }),
    });

    async function buildConfigFile(): Promise<File> {
        if (!caseRef.current || !containerRef.current)
            throw new Error("Missing DOM refs");

        const caseRect = caseRef.current.getBoundingClientRect();
        const containerRect = containerRef.current.getBoundingClientRect();

        const leftOffset = caseRect.left - containerRect.left;
        const topOffset = caseRect.top - containerRect.top;
        const actualX = renderedPosition.x - leftOffset;
        const actualY = renderedPosition.y - topOffset;

        const devicePR =
            typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
        const exportScale = Math.max(3, Math.round(devicePR));

        const canvas = document.createElement("canvas");
        canvas.width = Math.round(caseRect.width * exportScale);
        canvas.height = Math.round(caseRect.height * exportScale);

        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Failed to get canvas context");

        const userImage = new Image();
        const proxied = `/api/image-proxy?url=${encodeURIComponent(
            imageUrl
        )}&t=${Date.now()}`;
        userImage.src = proxied;

        await new Promise<void>((resolve, reject) => {
            userImage.onload = () => resolve();
            userImage.onerror = (e) => reject(e);
        });

        const destX = Math.round(actualX * exportScale);
        const destY = Math.round(actualY * exportScale);
        const destW = Math.round(renderedDimensions.width * exportScale);
        const destH = Math.round(renderedDimensions.height * exportScale);

        ctx.drawImage(
            userImage,
            0,
            0,
            userImage.naturalWidth,
            userImage.naturalHeight,
            destX,
            destY,
            destW,
            destH
        );

        const blob: Blob = await new Promise((resolve, reject) =>
            canvas.toBlob((b) => {
                if (b) resolve(b);
                else reject(new Error("Failed to convert canvas to blob"));
            }, "image/png")
        );

        const file = new File([blob], "design.png", { type: "image/png" });
        return file;
    }

    async function handleContinue() {
        try {
            const file = await buildConfigFile();
            const uploadRes = await saveImageMut.mutateAsync({
                file,
            });

            if (!uploadRes || !uploadRes.success)
                throw new Error(uploadRes?.error || "Image upload failed");

            const updateRes = await updateConfigMut.mutateAsync({
                colorId: options.color.id,
                materialId: options.material.id,
                finishId: options.finish.id,
                modelId: options.model.id,
                caseDesignId: configId,
            });

            if (!updateRes || !updateRes.success)
                throw new Error(updateRes?.error || "Failed to update config");

            router.push(`/configure/preview/${configId}`);
        } catch (err) {
            toast({
                title: "Something went wrong",
                description:
                    err instanceof Error
                        ? err.message
                        : "Failed to save configuration",
                variant: "destructive",
            });
        }
    }

    const isSaving = saveImageMut.isPending || updateConfigMut.isPending;

    const total = Number(options.finish.price) + Number(options.material.price);

    return (
        <div className="grid overflow-hidden rounded-lg border border-rule bg-paper-raised shadow-[0_40px_80px_-60px_rgb(20_20_20/0.45)] lg:grid-cols-[minmax(0,1fr)_400px]">
            <CanvasEditor
                imageUrl={imageUrl}
                imageDimensions={imageDimensions}
                color={options.color}
                renderedDimensions={renderedDimensions}
                renderedPosition={renderedPosition}
                setRenderedDimenosions={setRenderedDimenosions}
                setRenderedPosition={setRenderedPosition}
                caseRef={caseRef}
                containerRef={containerRef}
            />

            <aside className="flex flex-col border-t border-rule lg:h-[clamp(480px,calc(100dvh-15rem),820px)] lg:border-l lg:border-t-0">
                <header className="border-b border-rule px-6 py-5">
                    <p className="type-label text-ink-soft">Job ticket</p>
                    <h1 className="type-title mt-2">Customise your case</h1>
                </header>

                <div className="flex-1 divide-y divide-rule overflow-y-auto">
                    <OptionSection n="01" title="Colour" value={options.color.name}>
                        <ColorPicker
                            colors={colors}
                            value={options.color}
                            onChange={(c) =>
                                setOptions((p) => ({ ...p, color: c }))
                            }
                        />
                    </OptionSection>

                    <OptionSection n="02" title="Model">
                        <ModelSelector
                            models={models}
                            value={options.model}
                            onSelect={(m) =>
                                setOptions((p) => ({ ...p, model: m }))
                            }
                        />
                    </OptionSection>

                    <OptionSection n="03" title="Material">
                        <OptionRadioGroup
                            name="material"
                            options={materials}
                            value={options.material}
                            onChange={(v) =>
                                setOptions((p) => ({
                                    ...p,
                                    material: v,
                                }))
                            }
                        />
                    </OptionSection>

                    <OptionSection n="04" title="Finish">
                        <OptionRadioGroup
                            name="finish"
                            options={finishes}
                            value={options.finish}
                            onChange={(v) =>
                                setOptions((p) => ({ ...p, finish: v }))
                            }
                        />
                    </OptionSection>
                </div>

                <footer className="border-t border-rule bg-paper px-6 py-5">
                    <div className="flex items-end justify-between gap-4">
                        <div>
                            <p className="type-label text-ink-soft">Your case</p>
                            <p
                                aria-live="polite"
                                className="mt-1.5 font-mono text-[1.75rem] leading-none font-medium tracking-[-0.03em]"
                            >
                                {formatPrice(total)}
                            </p>
                        </div>
                        <p className="text-right text-xs leading-relaxed text-ink-soft">
                            Before tax.
                            <br />
                            Shipping is free.
                        </p>
                    </div>
                    <Button
                        isLoading={isSaving}
                        disabled={isSaving}
                        onClick={handleContinue}
                        size="lg"
                        className="mt-5 w-full"
                        icon={FaArrowRightLong}
                        iconPosition="right"
                    >
                        {isSaving ? "Saving your design…" : "Continue to proof"}
                    </Button>
                </footer>
            </aside>
        </div>
    );
}

function OptionSection({
    n,
    title,
    value,
    children,
}: {
    n: string;
    title: string;
    value?: string;
    children: React.ReactNode;
}) {
    return (
        <section className="px-6 py-6">
            <div className="mb-4 flex items-baseline justify-between gap-3">
                <h2 className="flex items-baseline gap-2.5">
                    <span className="type-label text-ink-soft">{n}</span>
                    <span className="type-heading">{title}</span>
                </h2>
                {value ? (
                    <span className="truncate text-sm text-ink-soft">{value}</span>
                ) : null}
            </div>
            {children}
        </section>
    );
}
