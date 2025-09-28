// components/order-details/order.tsx
"use client";

import React from "react";
import { IUserOrderWithDesign } from "@/lib/types/user-orders.types";
import Phone from "@/components/utilities/phone";
import OrderInfo from "./order-info";
import { IUser } from "../../../../../auth-client";
import OrderSecondayInfo from "./order-secondary-info";

const Order = ({
    order,
    user,
}: {
    order: IUserOrderWithDesign;
    user: IUser;
}) => {
    return (
        <div className="flex flex-col gap-6 my-10 w-full">
            <span className="text-xl">Order Details</span>
            <OrderInfo order={order} />
            <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-shrink-0 mx-auto md:mx-0 flex items-center justify-center">
                    <div className="relative sm:w-48 w-56 h-auto lg:w-64 rounded-md bg-muted overflow-hidden flex items-center justify-center">
                        <Phone
                            imgSrc={order.design.croppedImgUrl}
                            altText={order.design.caseName}
                        />
                    </div>
                </div>
                <OrderSecondayInfo order={order} user={user} />
            </div>
        </div>
    );
};

export default Order;
