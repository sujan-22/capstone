"use client";

import React, { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import PressSheet from "@/components/print/press-sheet";
import PrintedCase from "@/components/print/printed-case";
import { ArrowRight, Lock } from "lucide-react";
import { createCheckoutSession, getDesignPreview } from "../actions/actions";
import { IUser } from "../../../../../../../../auth-client";
import DesignSummary from "./design-summary";
import { Button } from "@/components/ui/button";
import { notFound, useRouter } from "next/navigation";
import Confetti from "react-dom-confetti";
import { useToast } from "@/hooks/use-toast";
import PreviewSkeleton from "./preview-skeleton";
import ErrorMessage from "@/components/utilities/error";

interface Props {
    id: string;
    user: IUser;
}

const CONFETTI_DURATION_MS = 2300;

const DesignPreviewOverview = ({ id: designId, user }: Props) => {
    const router = useRouter();
    const { toast } = useToast();
    const [showConfetti, setShowConfetti] = useState(false);
    const { data, isLoading, isError, error, refetch } = useQuery({
        queryKey: ["design-preview", designId],
        queryFn: async () => await getDesignPreview(designId),
        enabled: !!designId,
        retry: 2,
        retryDelay: 500,
        staleTime: 5 * 60 * 1000,
    });

    const { mutate: createPaymentSession, isPending } = useMutation({
        mutationKey: ["get-checkout-session"],
        mutationFn: createCheckoutSession,
        onSuccess: ({ url }) => {
            if (url) {
                router.push(url);
            } else {
                throw new Error("Unable to retrieve payment URL");
            }
        },
        onError: () => {
            toast({
                title: "Something went wrong",
                description: "There was an error on our end. Please try again.",
                variant: "destructive",
            });
        },
    });

    useEffect(() => {
        const t = setTimeout(() => setShowConfetti(true), 80);

        const off = setTimeout(
            () => setShowConfetti(false),
            80 + CONFETTI_DURATION_MS
        );

        return () => {
            clearTimeout(t);
            clearTimeout(off);
        };
    }, []);

    if (!designId) return notFound();
    if (isLoading) return <PreviewSkeleton />;
    if (isError || error)
        return (
            <div className="flex justify-center items-center mt-auto min-h-[70vh]">
                <ErrorMessage
                    message="There was an error from our end. Please try again later!"
                    onRetry={() => refetch()}
                />
            </div>
        );

    if (!data || !data.design) {
        return notFound();
    }

    const handleCheckout = () => {
        if (user) {
            createPaymentSession({
                caseDesignId: designId,
            });
        }
    };

    const design = data.design;

    return (
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-10">
            <div
                className="pointer-events-none fixed inset-0 z-[10000000] flex select-none items-start justify-center overflow-visible"
                aria-hidden="true"
            >
                <Confetti
                    active={showConfetti}
                    config={{
                        angle: 90,
                        spread: 90,
                        startVelocity: 40,
                        elementCount: 110,
                        dragFriction: 0.12,
                        duration: CONFETTI_DURATION_MS,
                        stagger: 3,
                        width: "8px",
                        height: "14px",
                        colors: ["#00a3e0", "#e6007e", "#ffe500", "#141414", "#2a36f0"],
                    }}
                />
            </div>

            <div className="min-w-0 lg:col-span-7">
                <div className="relative lg:sticky lg:top-24">
                    <div
                        aria-hidden
                        className="halftone absolute inset-x-6 bottom-10 top-10 rounded-[3px] bg-cobalt text-white/[0.16] sm:inset-x-10"
                    />
                    <PressSheet
                        className="relative mx-auto w-full max-w-[520px]"
                        slug={
                            <>
                                Proof · {design.modelName} · {design.material} ·{" "}
                                {design.finish}
                            </>
                        }
                        footer="1 of 1 · awaiting approval"
                        trimClassName="w-[200px] sm:w-[250px]"
                    >
                        <PrintedCase
                            src={design.croppedImageUrl}
                            alt={`Proof of your ${design.caseName} case`}
                            sizes="(max-width: 640px) 200px, 250px"
                            background={design.colorHex}
                            priority
                        />
                    </PressSheet>
                </div>
            </div>

            <div className="min-w-0 lg:col-span-5">
                <p className="type-label text-ink-soft">Step 03 · Proof</p>
                <h1 className="type-display mt-4 !text-[clamp(2.5rem,4.6vw,4rem)]">
                    Check your proof.
                </h1>
                <p className="mt-5 text-lg leading-relaxed text-ink-soft">
                    This is exactly what we&rsquo;ll print. Happy with it?
                    Approve it to continue to secure checkout with Stripe.
                </p>

                <div className="mt-10">
                    <DesignSummary design={design} />
                </div>

                <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row">
                    <Button
                        size="lg"
                        variant="outline"
                        className="sm:flex-1"
                        onClick={() =>
                            router.push(`/configure/customize/${designId}`)
                        }
                    >
                        Edit selections
                    </Button>

                    <Button
                        size="lg"
                        className="sm:flex-[1.4]"
                        onClick={() => handleCheckout()}
                        isLoading={isPending}
                        disabled={isPending}
                        icon={ArrowRight}
                        iconPosition="right"
                    >
                        Approve &amp; checkout
                    </Button>
                </div>
                <p className="mt-4 flex items-center gap-2 text-xs text-ink-soft">
                    <Lock aria-hidden className="size-3.5" />
                    Payments are processed securely by Stripe.
                </p>
            </div>
        </div>
    );
};

export default DesignPreviewOverview;
