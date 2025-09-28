import React from "react";
import { IUserOrderWithDesign } from "../../../../../lib/types/user-orders.types";
import { formatPrice } from "@/lib/utils";
import PhonePreview from "@/components/utilities/phone-preview";
import SmallLogo from "@/components/utilities/small-logo";

const OrderConfirmation = ({ order }: { order: IUserOrderWithDesign }) => {
    return (
        <div className="py-16">
            <div className=" max-w-xl">
                <p className=" text-base font-medium text-blue-600">
                    Thank you!
                </p>
                <h1 className=" my-2 text-4xl font-bold tracking-tight sm:text-5xl">
                    Your case is on the way!
                </h1>
                <p className="text-gray-700">
                    We’ve received your order and it is being carefully
                    processed.
                </p>
                <div className="mt-8 text-sm font-medium">
                    <p>Order Reference Number</p>
                    <p className=" text-muted-foreground">
                        {order.orderNumber}
                    </p>
                </div>
            </div>
            <div className=" mt-10 border-t border-zinc-200">
                <div className=" mt-10 flex flex-auto flex-col">
                    <h4 className=" font-semibold">
                        You made a greate choice!
                    </h4>
                    <p className=" mt-2 text-sm text-muted-foreground">
                        At <SmallLogo />, we craft every phone case with care
                        and precision to match your unique style. Enjoy your
                        personalized design, made to protect and enhance your
                        device!
                    </p>
                </div>
            </div>
            <div className="flex space-x-6 overflow-hidden mt-4 rounded-xl bg-gray-900/5 ring-1 ring-inset ring-gray-900/10 lg:rounded-2xl">
                <PhonePreview
                    croppedImageUrl={order.design.croppedImgUrl}
                    color={order.design.colorHex}
                />
            </div>
            <div>
                <div className="grid grid-cols-2 gap-x-6 py-10 text-sm">
                    <div>
                        <p className="font-medium text-gray-900">
                            Shipping address
                        </p>
                        <div className="mt-2 text-muted-foreground">
                            <address className="not-italic">
                                <span className="block">
                                    {order.shippingAddress?.name}
                                </span>
                                <span className="block">
                                    {order.shippingAddress?.street}
                                </span>
                                <span className="block">
                                    {order.shippingAddress?.postal_code}{" "}
                                    {order.shippingAddress?.city}
                                </span>
                            </address>
                        </div>
                    </div>
                    <div>
                        <p className="font-medium text-gray-900">
                            Billing address
                        </p>
                        <div className="mt-2 text-muted-foreground">
                            <address className="not-italic">
                                <span className="block">
                                    {order.billingAddress?.name}
                                </span>
                                <span className="block">
                                    {order.billingAddress?.street}
                                </span>
                                <span className="block">
                                    {order.billingAddress?.postal_code}{" "}
                                    {order.billingAddress?.city}
                                </span>
                            </address>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-x-6 border-t border-zinc-200 py-10 text-sm">
                    <div>
                        <p className="font-medium">Payment status</p>
                        <p className="mt-2 text-muted-foreground">Paid</p>
                    </div>

                    <div>
                        <p className="font-medium">Shipping Method</p>
                        <p className="mt-2 text-muted-foreground">
                            FedEx, takes up to 3 working days
                        </p>
                    </div>
                </div>
            </div>

            <div className="space-y-2 border-t border-zinc-200 pt-10 text-sm">
                <div className="flex justify-between">
                    <p className="font-medium">Subtotal</p>
                    <p className="text-muted-foreground">
                        {formatPrice(order.subtotal)}
                    </p>
                </div>
                <div className="flex justify-between">
                    <p className="font-medium">Shipping</p>
                    <p className="text-muted-foreground">FREE</p>
                </div>
                <div className="flex justify-between">
                    <p className="font-medium">Tax</p>
                    <p className="text-muted-foreground">
                        {formatPrice(order.tax)}
                    </p>
                </div>
                <div className="flex justify-between">
                    <p className="font-medium">Total</p>
                    <p className="text-muted-foreground">
                        {formatPrice(order.totalAmount)}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default OrderConfirmation;
