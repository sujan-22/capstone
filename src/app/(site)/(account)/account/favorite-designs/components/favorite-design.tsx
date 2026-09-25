"use client";

import { Button } from "@/components/ui/button";
import DesignRow from "../../components/design-row";
import { formatPrice } from "@/lib/utils";
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
        <DesignRow
            data-testid="favorite-card"
            imgSrc={design.croppedImgUrl}
            caseName={design.caseName}
            modelName={design.modelName}
            color={design.color}
            material={design.material}
            finish={design.finish}
            badge={
                <span className="shrink-0 font-mono text-[0.9375rem] font-medium">
                    {formatPrice(design.price)}
                </span>
            }
            actions={
                <>
                    <Button
                        onClick={() => buyNow()}
                        disabled={isBuyNowLoading}
                        isLoading={isBuyNowLoading}
                        size="sm"
                        className="h-9 px-4"
                    >
                        Buy now
                        <span className="sr-only">: {design.caseName}</span>
                    </Button>
                    <Button
                        onClick={() => toggleFavorite()}
                        size="sm"
                        disabled={loading}
                        isLoading={loading}
                        variant="outline"
                        className="h-9 px-4"
                    >
                        Remove from favourites
                        <span className="sr-only">: {design.caseName}</span>
                    </Button>
                </>
            }
        />
    );
};

export default FavoriteDesign;
