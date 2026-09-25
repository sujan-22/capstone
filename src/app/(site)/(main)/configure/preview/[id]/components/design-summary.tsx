"use client";

import React from "react";
import { BatteryCharging, Leaf, ShieldCheck } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { IPreviewCaseDesign } from "@/app/api/configure/preview/[id]/route";
import { TAX_RATE } from "@/lib/constants";

const FEATURES = [
    { icon: BatteryCharging, text: "Wireless charging compatible" },
    { icon: ShieldCheck, text: "5-year print warranty" },
    { icon: Leaf, text: "Eco-friendly packaging" },
];

const DesignSummary = ({ design }: { design: IPreviewCaseDesign }) => {
    const subtotal = Number(design.materialPrice) + Number(design.finishPrice);
    const tax = subtotal * TAX_RATE;
    const total = subtotal + tax;

    const specs = [
        ["Model", design.modelName],
        ["Colour", design.color],
        ["Material", design.material],
        ["Finish", design.finish],
    ];

    return (
        <div className="flex w-full flex-col gap-8">
            <section aria-labelledby="spec-heading">
                <h2
                    id="spec-heading"
                    className="type-label border-b border-ink pb-3 text-ink"
                >
                    Case design details
                </h2>
                <dl>
                    {specs.map(([label, value]) => (
                        <div
                            key={label}
                            className="flex items-center justify-between gap-4 border-b border-rule py-3"
                        >
                            <dt className="text-ink-soft">{label}</dt>
                            <dd className="flex items-center gap-2 text-right font-medium">
                                {label === "Colour" && design.colorHex ? (
                                    <span
                                        aria-hidden
                                        className="size-3.5 rounded-full shadow-[inset_0_0_0_1px_rgb(20_20_20/0.15)]"
                                        style={{ background: design.colorHex }}
                                    />
                                ) : null}
                                {value}
                            </dd>
                        </div>
                    ))}
                </dl>
            </section>

            <ul className="flex flex-wrap gap-2">
                {FEATURES.map(({ icon: Icon, text }) => (
                    <li
                        key={text}
                        className="inline-flex items-center gap-1.5 rounded-full border border-rule bg-paper-raised px-3 py-1.5 text-xs font-medium"
                    >
                        <Icon aria-hidden className="size-3.5 text-cobalt" />
                        {text}
                    </li>
                ))}
            </ul>

            <section
                aria-labelledby="cost-heading"
                className="perforated relative bg-paper-raised px-6 py-7 shadow-[0_24px_48px_-32px_rgb(20_20_20/0.35)]"
            >
                <h2
                    id="cost-heading"
                    className="type-label text-center text-ink-soft"
                >
                    Cost breakdown
                </h2>
                <dl className="mt-5 space-y-2.5 font-mono text-sm">
                    <div className="flex justify-between gap-4">
                        <dt className="text-ink-soft">
                            {design.material} material
                        </dt>
                        <dd>{formatPrice(design.materialPrice)}</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                        <dt className="text-ink-soft">{design.finish} finish</dt>
                        <dd>{formatPrice(design.finishPrice)}</dd>
                    </div>
                </dl>
                <dl className="mt-4 space-y-2.5 border-t border-dashed border-ink/25 pt-4 font-mono text-sm">
                    <div className="flex justify-between gap-4">
                        <dt className="text-ink-soft">Subtotal</dt>
                        <dd>{formatPrice(subtotal)}</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                        <dt className="text-ink-soft">Shipping</dt>
                        <dd>FREE</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                        <dt className="text-ink-soft">
                            Tax ({Math.round(TAX_RATE * 100)}%)
                        </dt>
                        <dd>{formatPrice(tax)}</dd>
                    </div>
                </dl>
                <dl className="mt-4 flex items-baseline justify-between gap-4 border-t border-ink pt-4">
                    <dt className="type-label text-ink">Total</dt>
                    <dd className="font-mono text-2xl font-medium tracking-[-0.03em]">
                        {formatPrice(total)}
                    </dd>
                </dl>
            </section>
        </div>
    );
};

export default DesignSummary;
