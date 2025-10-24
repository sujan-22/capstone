"use client";

import React from "react";
import OrderInfoSkeleton from "./order-info-skeleton";
import OrderSecondaryInfoSkeleton from "./order-secondary-info-skeleton";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import CustomImage from "@/components/utilities/custom-image";

const OrderSkeleton: React.FC = () => {
    return (
        <div className="flex flex-col gap-6 w-full">
            <div className="w-full">
                <OrderInfoSkeleton />
            </div>
            <div className="flex space-x-6 overflow-hidden rounded-xl bg-gray-900/5 ring-1 ring-inset ring-gray-900/10 lg:rounded-2xl">
                <AspectRatio ratio={3000 / 2001} className="relative w-full">
                    <div className="relative h-full w-full z-40">
                        <CustomImage
                            alt="phone"
                            src="/assets/phone-template/clearphone.png"
                            className="pointer-events-none h-full w-full rounded-md"
                        />
                    </div>
                </AspectRatio>
            </div>

            <div className="flex flex-col md:flex-row gap-6">
                <OrderSecondaryInfoSkeleton />
            </div>
        </div>
    );
};

export default OrderSkeleton;
