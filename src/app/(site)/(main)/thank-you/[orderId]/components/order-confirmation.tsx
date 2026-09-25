import React from "react";
import Link from "next/link";
import { ArrowRight, CircleCheck } from "lucide-react";
import { IUserOrderWithDesign } from "../../../../../../lib/types/user-orders.types";
import PhonePreview from "@/components/utilities/phone-preview";
import SmallLogo from "@/components/utilities/small-logo";
import OrderReceipt from "@/components/order/order-receipt";
import RegistrationMark from "@/components/print/registration-mark";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const OrderConfirmation = ({ order }: { order: IUserOrderWithDesign }) => {
    return (
        <div className="pb-20 pt-8 sm:pt-12">
            <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-10">
                <div className="lg:col-span-6">
                    <p className="type-label flex items-center gap-2 text-success">
                        <CircleCheck aria-hidden className="size-4" />
                        Thank you · order confirmed
                    </p>
                    <h1 className="type-display mt-6 !text-[clamp(3rem,7vw,6rem)]">
                        Sent to press<span className="text-cobalt">.</span>
                    </h1>
                    <p className="mt-6 max-w-lg text-lg leading-relaxed text-ink-soft">
                        We&rsquo;ve received your order and it&rsquo;s being
                        carefully processed. We&rsquo;ll print your case and
                        ship it free with FedEx.
                    </p>

                    <div className="mt-8 inline-flex flex-col rounded-md border border-ink px-5 py-4">
                        <span className="type-label text-ink-soft">
                            Order reference number
                        </span>
                        <span className="mt-1.5 font-mono text-xl font-medium tracking-tight">
                            {order.orderNumber}
                        </span>
                    </div>

                    <div className="mt-8 flex flex-wrap gap-3">
                        <Link
                            href={`/order-details/${order.id}`}
                            className={buttonVariants({ variant: "ink", size: "lg" })}
                        >
                            View order details
                            <ArrowRight
                                aria-hidden
                                className="size-4 transition-transform duration-300 ease-out-expo group-hover/button:translate-x-0.5"
                            />
                        </Link>
                        <Link
                            href="/configure/upload"
                            className={cn(
                                buttonVariants({ variant: "outline", size: "lg" })
                            )}
                        >
                            Design another case
                        </Link>
                    </div>
                </div>

                <div className="lg:col-span-6">
                    <figure className="relative overflow-hidden rounded-md bg-paper-sunken">
                        <div className="halftone absolute inset-0 text-ink/[0.06]" />
                        <PhonePreview
                            croppedImageUrl={order.design.croppedImgUrl}
                            color={order.design.colorHex}
                        />
                        <figcaption className="absolute inset-x-4 top-4 flex items-center justify-between">
                            <span className="type-label rounded-full bg-paper-raised px-3 py-1.5 text-ink">
                                {order.design.caseName}
                            </span>
                            <RegistrationMark size={16} />
                        </figcaption>
                    </figure>
                </div>
            </div>

            <div className="mt-16 border-t border-ink pt-10">
                <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
                    <h2 className="type-title">Your order</h2>
                    <p className="text-sm text-ink-soft">
                        At <SmallLogo />, every case is printed with care to
                        match your style.
                    </p>
                </div>
                <OrderReceipt order={order} />
            </div>
        </div>
    );
};

export default OrderConfirmation;
