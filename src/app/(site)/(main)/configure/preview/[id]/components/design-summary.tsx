"use client";

import React from "react";
import { formatPrice } from "@/lib/utils";
import { IPreviewCaseDesign } from "@/app/api/configure/preview/[id]/route";

const DesignSummary = ({ design }: { design: IPreviewCaseDesign }) => {
    return (
        <div className="flex-1 w-full flex flex-col gap-4">
            {/* Design Details */}
            <section className="bg-muted px-4 py-2.5 rounded-md">
                <h4 className="sm:text-lg font-semibold mb-1">
                    Case Design Details
                </h4>
                <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 text-sm">
                    <dt className="text-muted-foreground">Model:</dt>
                    <dd className="text-right">{design.modelName}</dd>

                    <dt className="text-muted-foreground">Color:</dt>
                    <dd className="text-right">{design.color}</dd>

                    <dt className="text-muted-foreground">Material:</dt>
                    <dd className="text-right">{design.material}</dd>

                    <dt className="text-muted-foreground">Finish:</dt>
                    <dd className="text-right">{design.finish}</dd>
                </dl>
            </section>

            {/* Features & Benefits */}
            <section className="bg-muted px-4 py-2.5 rounded-md">
                <h4 className="sm:text-lg font-semibold mb-1">
                    Features & Benefits
                </h4>
                <dl className="mt-2 grid gap-x-3 text-sm">
                    <dt>Wireless charging compatible</dt>

                    <dt>5-year print warranty</dt>

                    <dt>Eco-friendly packaging</dt>
                </dl>
            </section>

            {/* Pricing Summary */}
            <section className="bg-muted px-4 py-2.5 rounded-md">
                <h4 className="sm:text-lg font-semibold mb-1">
                    Cost Breakdown
                </h4>

                {(() => {
                    const TAX_RATE = 0.13; // 13% HST
                    const subtotal =
                        Number(design.materialPrice) +
                        Number(design.finishPrice);

                    const tax = subtotal * TAX_RATE;
                    const total = subtotal + tax;

                    return (
                        <>
                            <dl className="grid grid-cols-2 gap-x-4 text-sm">
                                <dt className="text-muted-foreground">
                                    {design.material} Material:
                                </dt>
                                <dd className="text-right">
                                    {formatPrice(design.materialPrice)}
                                </dd>

                                <dt className="text-muted-foreground">
                                    {design.finish} Finish:
                                </dt>
                                <dd className="text-right">
                                    {formatPrice(design.finishPrice)}
                                </dd>
                            </dl>

                            <hr className="border-muted-foreground/50 my-3" />

                            <dl className="grid grid-cols-2 gap-x-4 text-sm">
                                <dt className="text-muted-foreground">
                                    Subtotal:
                                </dt>
                                <dd className="text-right">
                                    {formatPrice(subtotal)}
                                </dd>

                                <dt className="text-muted-foreground">
                                    Shipping:
                                </dt>
                                <dd className="text-right">FREE</dd>

                                <dt className="text-muted-foreground">
                                    Tax (13%):
                                </dt>
                                <dd className="text-right">
                                    {formatPrice(tax)}
                                </dd>
                            </dl>

                            <hr className="border-muted-foreground/50 my-3" />

                            <dl className="grid grid-cols-2 gap-x-4 text-sm">
                                <dt className="font-semibold">Total:</dt>
                                <dd className="text-right">
                                    {formatPrice(total)}
                                </dd>
                            </dl>
                        </>
                    );
                })()}
            </section>
        </div>
    );
};

export default DesignSummary;
