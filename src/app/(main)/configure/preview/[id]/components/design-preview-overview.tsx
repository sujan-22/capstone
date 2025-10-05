"use client";

import React, { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import Phone from "@/components/utilities/phone";
import { createCheckoutSession, getDesignPreview } from "../actions/actions";
import { IUser } from "../../../../../../../auth-client";
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
        queryFn: async () => await getDesignPreview(designId, user.id),
        enabled: !!designId,
        retry: 2,
        retryDelay: 500,
        staleTime: 5 * 60 * 1000,
    });

    const { mutate: createPaymentSession } = useMutation({
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
                userId: user.id,
                userEmail: user.email,
            });
        }
    };

    const design = data.design;

    return (
        <div className=" mt-3 flex flex-col md:flex-row gap-6">
            <div
                className="pointer-events-none select-none fixed inset-0 overflow-visible flex items-start justify-center z-[10000000]"
                aria-hidden="true"
            >
                <Confetti
                    active={showConfetti}
                    config={{
                        angle: 90,
                        spread: 90,
                        startVelocity: 40,
                        elementCount: 100,
                        dragFriction: 0.12,
                        duration: CONFETTI_DURATION_MS,
                        stagger: 3,
                        width: "8px",
                        height: "14px",
                        colors: ["#000", "#333", "#666"],
                    }}
                />
            </div>
            <div className="flex-shrink-0 mx-auto md:mx-0 flex items-start">
                <div className="relative sm:w-48 w-56 h-auto lg:w-64 rounded-md bg-muted overflow-hidden flex items-center justify-center">
                    <Phone
                        imgSrc={design.croppedImageUrl}
                        altText={design.caseName}
                    />
                </div>
            </div>

            <div className="flex-1 flex flex-col gap-4">
                <DesignSummary design={design} />

                <div className="mt-4 flex gap-3 justify-end">
                    <Button
                        size={"sm"}
                        variant={"outline"}
                        onClick={() =>
                            router.push(`/configure/customize/${designId}`)
                        }
                    >
                        Edit Selections
                    </Button>

                    <Button size={"sm"} onClick={() => handleCheckout()}>
                        Checkout
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default DesignPreviewOverview;
