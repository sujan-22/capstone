"use client";

import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Phone from "@/components/utilities/phone";
import { getDesignPreview } from "../actions/actions";
import { IUser } from "../../../../../../../auth-client";
import DesignSummary from "./design-summary";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Confetti from "react-dom-confetti";

interface Props {
    id: string;
    user: IUser;
}

const CONFETTI_DURATION_MS = 2300;

const DesignPreviewOverview = ({ id: designId, user }: Props) => {
    const router = useRouter();
    const [showConfetti, setShowConfetti] = useState(false);
    const { data, isLoading, isError, error } = useQuery({
        queryKey: ["design-preview", designId],
        queryFn: async () => await getDesignPreview(designId, user.id),
        enabled: !!designId,
        retry: 2,
        retryDelay: 500,
        staleTime: 5 * 60 * 1000,
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

    if (!designId) return <div>Invalid ID</div>;
    if (isLoading) return <div>Loading preview...</div>;
    if (isError)
        return (
            <div>
                Error:{" "}
                {error instanceof Error ? error.message : "Unknown error"}
            </div>
        );

    if (!data || !data.design) {
        return;
    }

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

                    <Button
                        size={"sm"}
                        onClick={() => router.push("/checkout")}
                    >
                        Checkout
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default DesignPreviewOverview;
