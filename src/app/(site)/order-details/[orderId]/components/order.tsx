"use client";

import React from "react";
import { IUserOrderWithDesign } from "@/lib/types/user-orders.types";
import OrderInfo from "./order-info";
import { IUser } from "../../../../../../auth-client";
import OrderSecondaryInfo from "./order-secondary-info";
import PhonePreview from "@/components/utilities/phone-preview";
import OrderReceipt from "@/components/order/order-receipt";

const Order = ({
    order,
    user,
}: {
    order: IUserOrderWithDesign;
    user: IUser;
}) => {
    return (
        <div className="flex w-full flex-col gap-12">
            <OrderInfo order={order} />
            <div className="grid gap-10 lg:grid-cols-12">
                <figure className="relative overflow-hidden rounded-md bg-paper-sunken lg:col-span-7">
                    <div className="halftone absolute inset-0 text-ink/[0.06]" />
                    <PhonePreview
                        croppedImageUrl={order.design.croppedImgUrl}
                        color={order.design.colorHex}
                    />
                </figure>
                <div className="lg:col-span-5">
                    <OrderSecondaryInfo order={order} user={user} />
                </div>
            </div>
            <OrderReceipt
                order={order}
                contact={{ name: user.name, email: user.email }}
            />
        </div>
    );
};

export default Order;
