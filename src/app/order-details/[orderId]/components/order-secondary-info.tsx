// components/order-details/order-secondary-info.tsx
"use client";

import { IUserOrderWithDesign } from "@/lib/types/user-orders.types";
import React from "react";
import { IUser } from "../../../../../auth-client";
import { formatPrice } from "@/lib/utils";

const OrderSecondaryInfo = ({
    order,
    user,
}: {
    order: IUserOrderWithDesign;
    user: IUser;
}) => {
    return (
        <div className="flex-1 w-full flex flex-col gap-4">
            {/* Design Details */}
            <section className="bg-muted px-4 py-2.5 rounded-md">
                <h4 className="sm:text-lg font-semibold mb-1">
                    Design Details
                </h4>
                <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 text-sm">
                    <dt className="text-muted-foreground">Model:</dt>
                    <dd className="text-right">{order.design.modelName}</dd>

                    <dt className="text-muted-foreground">Color:</dt>
                    <dd className="text-right">{order.design.color}</dd>

                    <dt className="text-muted-foreground">Material:</dt>
                    <dd className="text-right">{order.design.material}</dd>

                    <dt className="text-muted-foreground">Finish:</dt>
                    <dd className="text-right">{order.design.finish}</dd>
                </dl>
            </section>

            <section className="bg-muted px-4 py-2.5 rounded-md">
                <h4 className="sm:text-lg font-semibold mb-1">
                    Billing & Shipping
                </h4>
                <div className="flex flex-col md:flex-row gap-6 items-stretch">
                    {order.billingAddress && (
                        <div className="flex-1 text-left md:text-left">
                            <h5 className="font-medium mb-1">
                                Billing Address
                            </h5>
                            <p className="text-sm">
                                {order.billingAddress.name} <br />
                                {order.billingAddress.street} <br />
                                {order.billingAddress.city},{" "}
                                {order.billingAddress.state}{" "}
                                {order.billingAddress.postal_code} <br />
                                {order.billingAddress.country}
                            </p>
                        </div>
                    )}

                    {order.shippingAddress && (
                        <div className="flex-1 text-left md:text-center">
                            <h5 className="font-medium mb-1">
                                Shipping Address
                            </h5>
                            <p className="text-sm">
                                {order.shippingAddress.name} <br />
                                {order.shippingAddress.street} <br />
                                {order.shippingAddress.city},{" "}
                                {order.shippingAddress.state}{" "}
                                {order.shippingAddress.postal_code} <br />
                                {order.shippingAddress.country}
                            </p>
                        </div>
                    )}

                    <div className="flex-1 text-left md:text-right">
                        <h5 className="font-medium mb-1">Contact</h5>
                        <p className="text-sm">
                            {user.name} <br />
                            {user.email} <br />
                            Phone:{" "}
                            {order.shippingAddress?.phone_number
                                ? order.shippingAddress.phone_number
                                : order.billingAddress?.phone_number || "N/A"}
                        </p>
                    </div>
                </div>
            </section>

            {/* Pricing Summary */}
            <section className="bg-muted px-4 py-2.5 rounded-md">
                <h4 className="sm:text-lg font-semibold mb-1">
                    Pricing Summary
                </h4>
                <dl className="grid grid-cols-2 gap-x-4 text-sm">
                    <dt className="text-muted-foreground">Subtotal:</dt>
                    <dd className="text-right">
                        {formatPrice(order.subtotal)}
                    </dd>

                    <dt className="text-muted-foreground">Shipping:</dt>
                    <dd className="text-right">FREE</dd>

                    <dt className="text-muted-foreground">Tax:</dt>
                    <dd className="text-right">{formatPrice(order.tax)}</dd>
                </dl>
                <hr className="border-muted-foreground/50 my-3" />
                <dl className="grid grid-cols-2 gap-x-4 text-sm">
                    <dt className="font-semibold">Total:</dt>
                    <dd className="text-right">
                        {formatPrice(order.totalAmount)}
                    </dd>
                </dl>
            </section>
        </div>
    );
};

export default OrderSecondaryInfo;
