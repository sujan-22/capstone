"use client";
import React from "react";
import { useFavorite } from "@/hooks/use-favorite";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useBuyNow } from "@/hooks/use-buy-now";
import { IUser } from "../../../../../auth-client";
import DesignCard from "@/components/case-design/design-card";

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

const Design: React.FC<ICaseDesignProps> = ({
    id,
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
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const currentUrl = `${pathname}${
        searchParams.toString() ? "?" + searchParams.toString() : ""
    }`;
    const { isFavorited, toggleFavorite, loading } = useFavorite({
        caseDesignId: id,
        initialFavorited,
    });

    const { buyNow, loading: isBuyNowLoading } = useBuyNow({ designId: id });
    const queryClient = useQueryClient();

    const signIn = () =>
        router.push(`/sign-in?redirectTo=${encodeURIComponent(currentUrl)}`);

    return (
        <DesignCard
            id={id}
            caseName={caseName}
            modelName={modelName}
            color={color}
            material={material}
            finish={finish}
            price={price}
            croppedImgUrl={croppedImgUrl}
            altText={altText}
            tone="paper"
            isFavorited={isFavorited}
            isFavoriteLoading={loading}
            isBuying={isBuyNowLoading}
            onBuy={() => {
                if (!user) return signIn();
                buyNow();
            }}
            onFavorite={() => {
                if (!user) return signIn();
                toggleFavorite();
                queryClient.invalidateQueries();
            }}
        />
    );
};

export default Design;
