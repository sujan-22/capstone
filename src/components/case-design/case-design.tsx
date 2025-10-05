"use client";
import React from "react";
import Phone from "../utilities/phone";
import { Button } from "../ui/button";
import { useFavorite } from "@/hooks/use-favorite";
import { IUser } from "../../../auth-client";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { useBuyNow } from "@/hooks/use-buy-now";

export interface ICaseDesignProps {
    id: string;
    imgSrc: string;
    altText?: string;
    caseName: string;
    modelName: string;
    color: string;
    material: string;
    finish: string;
    price: number;
    isFavorited: boolean;
    user: IUser | null | undefined;
    croppedImgUrl: string;
}

const CaseDesignComponent: React.FC<ICaseDesignProps> = ({
    id,
    // imgSrc,
    altText,
    caseName,
    modelName,
    color,
    material,
    finish,
    price,
    isFavorited: initialFavorited,
    user,
    croppedImgUrl,
}) => {
    const userId = user?.id || "";
    const router = useRouter();
    const { isFavorited, toggleFavorite, loading } = useFavorite({
        caseDesignId: id,
        initialFavorited,
    });

    const { buyNow, loading: isBuyNowLoading } = useBuyNow({ designId: id });
    const queryClient = useQueryClient();

    return (
        <article className="max-w-xs mx-auto p-1">
            <div className="flex justify-center">
                <Phone imgSrc={croppedImgUrl} altText={altText ?? caseName} />
            </div>
            <h2 className="mt-4 text-left text-md font-semibold line-clamp-2 h-14">
                {caseName}
            </h2>
            <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-2 text-sm">
                <dt className="text-muted-foreground">Model:</dt>
                <dd className="text-right">{modelName}</dd>

                <dt className="text-muted-foreground">Color:</dt>
                <dd className="text-right">{color}</dd>

                <dt className="text-muted-foreground">Material:</dt>
                <dd className="text-right">{material}</dd>

                <dt className="text-muted-foreground">Finish:</dt>
                <dd className="text-right">{finish}</dd>

                <dt className="text-muted-foreground">Price:</dt>
                <dd className="text-right font-medium">{formatPrice(price)}</dd>
            </dl>

            <div className="mt-4 flex justify-between space-y-3">
                <Button
                    onClick={() => buyNow(userId)}
                    aria-label={`Buy ${caseName}`}
                    disabled={isBuyNowLoading}
                    isLoading={isBuyNowLoading}
                >
                    Buy Now
                </Button>

                {
                    <Button
                        onClick={() => {
                            if (!user) {
                                router.push("/sign-in");
                                return;
                            }
                            toggleFavorite(userId);
                            queryClient.invalidateQueries();
                        }}
                        aria-label={`Favorite ${caseName}`}
                        disabled={loading}
                    >
                        {isFavorited ? "Favorited" : "Favorite"}
                    </Button>
                }
            </div>
        </article>
    );
};

export default CaseDesignComponent;
