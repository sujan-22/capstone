"use client";
import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useFavorite } from "@/hooks/use-favorite";
import { useBuyNow } from "@/hooks/use-buy-now";
import { IUser } from "../../../auth-client";
import DesignCard from "./design-card";

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
    tone?: "ink" | "paper";
}

const CaseDesignComponent: React.FC<ICaseDesignProps> = ({
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
    tone = "ink",
}) => {
    const router = useRouter();
    const pathname = usePathname() ?? "/";
    const { isFavorited, toggleFavorite, loading } = useFavorite({
        caseDesignId: id,
        initialFavorited,
    });

    const { buyNow, loading: isBuyNowLoading } = useBuyNow({ designId: id });
    const queryClient = useQueryClient();

    const signIn = () =>
        router.push(`/sign-in?redirectTo=${encodeURIComponent(pathname)}`);

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
            tone={tone}
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

export default CaseDesignComponent;
