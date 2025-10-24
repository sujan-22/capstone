"use client";

import React, { useRef, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
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
        userImage.crossOrigin = "anonymous";
        userImage.src = imageUrl;
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

    return (
        <div className="relative h-[70vh] mt-3 grid grid-cols-1 lg:grid-cols-3">
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

            <div className="h-[70vh] w-full col-span-full lg:col-span-1 flex flex-col bg-white">
                <ScrollArea className="relative flex-1 overflow-auto">
                    <div
                        aria-hidden="true"
                        className="absolute z-10 inset-x-0 bottom-0 h-12 bg-gradient-to-t from-white pointer-events-none"
                    />
                    <div className=" px-8 pb-12">
                        <h2 className=" tracking-tight font-bold text-3xl">
                            Customize your case
                        </h2>
                        <div className=" w-full h-px bg-zinc-200 my-6" />
                        <div className="relative mt-4 h-full flex flex-col justify-between">
                            <div className="flex flex-col gap-6">
                                <ColorPicker
                                    colors={colors}
                                    value={options.color}
                                    onChange={(c) =>
                                        setOptions((p) => ({ ...p, color: c }))
                                    }
                                />

                                <ModelSelector
                                    models={models}
                                    value={options.model}
                                    onSelect={(m) =>
                                        setOptions((p) => ({ ...p, model: m }))
                                    }
                                />

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

                                <OptionRadioGroup
                                    name="finish"
                                    options={finishes}
                                    value={options.finish}
                                    onChange={(v) =>
                                        setOptions((p) => ({ ...p, finish: v }))
                                    }
                                />
                            </div>
                        </div>
                    </div>
                </ScrollArea>

                <div className=" w-full px-8">
                    <div className=" h-px w-full bg-zinc-200" />
                    <div className=" w-full flex my-3 justify-end items-center">
                        <div className=" w-full flex gap-6 items-center">
                            <p className=" font-medium whitespace-nowrap">
                                {formatPrice(
                                    Number(options.finish.price) +
                                        Number(options.material.price)
                                )}
                            </p>
                            <Button
                                isLoading={isSaving}
                                disabled={isSaving}
                                onClick={handleContinue}
                                size="sm"
                                variant={"outline"}
                                className=" w-full"
                            >
                                Continue{" "}
                                <FaArrowRightLong className=" h-4 w-4 ml-1.5 inline" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
