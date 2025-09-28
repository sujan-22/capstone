"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import DesignConfigurator from "./design-configurator";
import { getConfigData } from "../actions/actions";
import { getCustomizeCaseDesign } from "../actions/actions";
import { IUser } from "../../../../../../../auth-client";
import CustomizeOverviewSkeleton from "./customize-overview-skeleton";
import ErrorMessage from "@/components/utilities/error";
import { notFound } from "next/navigation";
interface Props {
    id: string;
    user: IUser;
}

const CustomizeOverview = ({ id, user }: Props) => {
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ["get-customize-design", id],
        queryFn: () => getCustomizeCaseDesign(id as string),
        enabled: !!id,
    });

    const {
        data: configData,
        isLoading: isFetchingConfig,
        isError,
    } = useQuery({
        queryKey: ["get-config-data"],
        queryFn: async () => await getConfigData(),
        retry: true,
        retryDelay: 500,
        staleTime: 5 * 60 * 1000,
    });

    if (isLoading || isFetchingConfig) return <CustomizeOverviewSkeleton />;
    if (error || isError)
        return (
            <div className="flex justify-center items-center mt-auto min-h-[70vh]">
                <ErrorMessage
                    message="There was an error from our end. Please try again later!"
                    onRetry={() => refetch()}
                />
            </div>
        );

    if (!data || !configData?.data) {
        return notFound();
    }
    const {
        width,
        height,
        imageUrl,
        caseColorId,
        caseFinishId,
        caseMaterialId,
        phoneModelId,
        croppedImageUrl,
    } = data;
    const colors = configData.data.caseColors;
    const models = configData.data.phoneModels;
    const materials = configData.data.caseMaterials;
    const finishes = configData.data.caseFinishes;

    return (
        <DesignConfigurator
            imageUrl={imageUrl}
            imageDimensions={{ width, height }}
            configId={id}
            colors={colors}
            models={models}
            materials={materials}
            finishes={finishes}
            croppedImageUrl={croppedImageUrl}
            userId={user.id}
            caseConfig={{
                caseColorId,
                caseFinishId,
                caseMaterialId,
                caseModelId: phoneModelId,
            }}
        />
    );
};

export default CustomizeOverview;
