"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import DesignConfigurator from "./design-configurator";
import { getConfigData } from "../actions/actions";
import { getCustomizeCaseDesign } from "../actions/actions";
import { IUser } from "../../../../../../../auth-client";
interface Props {
    id: string;
    user: IUser;
}

const CustomizeOverview = ({ id, user }: Props) => {
    const { data, isLoading, error } = useQuery({
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

    if (isLoading || isFetchingConfig) return <div>Loading...</div>;
    if (error || !data || !configData?.data || isError)
        return <div>Error loading design</div>;

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
