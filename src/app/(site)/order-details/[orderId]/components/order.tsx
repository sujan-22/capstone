// components/order-details/order.tsx
"use client";

import React from "react";
import { IUserOrderWithDesign } from "@/lib/types/user-orders.types";
import OrderInfo from "./order-info";
import { IUser } from "../../../../../../auth-client";
import OrderSecondayInfo from "./order-secondary-info";
import PhonePreview from "@/components/utilities/phone-preview";

const Order = ({
    order,
    user,
}: {
    order: IUserOrderWithDesign;
    user: IUser;
}) => {
    return (
        <div className="flex flex-col gap-6 w-full">
            <OrderInfo order={order} />
            <div className="flex space-x-6 overflow-hidden bg-muted px-4 py-2.5 rounded-md ring-1 ring-inset ring-gray-900/10">
                <PhonePreview
                    croppedImageUrl={order.design.croppedImgUrl}
                    color={order.design.colorHex}
                />
            </div>
            <div className="flex flex-col md:flex-row gap-6">
                <OrderSecondayInfo order={order} user={user} />
            </div>
        </div>
    );
};

export default Order;
