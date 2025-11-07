"use client";

import { Button } from "@/components/ui/button";
import Phone from "@/components/utilities/phone";
import React from "react";
import { IFavoriteDesign } from "@/lib/types/user-favorite-designs.types";
import { useFavorite } from "@/hooks/use-favorite";
import { useBuyNow } from "@/hooks/use-buy-now";

interface Props {
    design: IFavoriteDesign;
    userId: string;
}

const FavoriteDesign = ({ design }: Props) => {
    const { toggleFavorite, loading } = useFavorite({
        caseDesignId: design.id,
        initialFavorited: design.isFavorited,
    });

    const { buyNow, loading: isBuyNowLoading } = useBuyNow({
        designId: design.id,
    });

    return (
        <div
            key={design.id}
            className="border rounded-lg p-3 flex flex-col sm:flex-row gap-3 bg-white shadow-sm duration-200"
        >
            <div className="flex-shrink-0 w-24 h-auto relative rounded-md bg-muted overflow-hidden flex items-center justify-center">
                <Phone
                    imgSrc={design.croppedImgUrl}
                    altText={design.caseName}
                />
            </div>

            <div className="flex-1 flex flex-col gap-2">
                <div className="flex-1 flex flex-col gap-2">
                    <h4 className="text-lg font-semibold truncate">
                        {design.caseName}
                    </h4>

                    <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                        <p>
                            <span className="font-medium">Model:</span>{" "}
                            {design.modelName}
                        </p>
                        <p>
                            <span className="font-medium">Color:</span>{" "}
                            {design.color}
                        </p>
                        <p>
                            <span className="font-medium">Material:</span>{" "}
                            {design.material}
                        </p>
                        <p>
                            <span className="font-medium">Finish:</span>{" "}
                            {design.finish}
                        </p>
                    </div>
                </div>

                <div className="mt-auto flex flex-wrap gap-2">
                    <Button
                        onClick={() => buyNow()}
                        aria-label={`Buy ${design.caseName}`}
                        disabled={isBuyNowLoading}
                        isLoading={isBuyNowLoading}
                        size={"sm"}
                    >
                        Buy Now
                    </Button>

                    <Button
                        onClick={() => toggleFavorite()}
                        size={"sm"}
                        aria-label={`Favorite ${design.caseName}`}
                        disabled={loading}
                        isLoading={loading}
                        variant={"outline"}
                    >
                        Remove from favorite
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default FavoriteDesign;
