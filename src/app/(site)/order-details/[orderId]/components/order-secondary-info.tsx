"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { IUserOrderWithDesign } from "@/lib/types/user-orders.types";
import React from "react";
import { IUser } from "../../../../../../auth-client";

/** The design that was ordered. */
const OrderSecondaryInfo = ({
    order,
}: {
    order: IUserOrderWithDesign;
    user: IUser;
}) => {
    const specs = [
        ["Model", order.design.modelName],
        ["Colour", order.design.color],
        ["Material", order.design.material],
        ["Finish", order.design.finish],
    ];

    return (
        <section aria-labelledby="design-heading" className="flex h-full flex-col">
            <h2
                id="design-heading"
                className="type-label border-b border-ink pb-3 text-ink"
            >
                Case design
            </h2>
            <p className="type-title mt-6">{order.design.caseName}</p>
            <dl className="mt-6">
                {specs.map(([label, value]) => (
                    <div
                        key={label}
                        className="flex items-center justify-between gap-4 border-b border-rule py-3"
                    >
                        <dt className="text-ink-soft">{label}</dt>
                        <dd className="flex items-center gap-2 font-medium">
                            {label === "Colour" && order.design.colorHex ? (
                                <span
                                    aria-hidden
                                    className="size-3.5 rounded-full shadow-[inset_0_0_0_1px_rgb(20_20_20/0.15)]"
                                    style={{ background: order.design.colorHex }}
                                />
                            ) : null}
                            {value}
                        </dd>
                    </div>
                ))}
            </dl>
            <Link
                href="/configure/upload"
                className="group mt-8 inline-flex items-center gap-2 self-start font-semibold text-cobalt underline-offset-4 hover:underline"
            >
                Design another case
                <ArrowRight
                    aria-hidden
                    className="size-4 transition-transform duration-300 ease-out-expo group-hover:translate-x-1"
                />
            </Link>
        </section>
    );
};

export default OrderSecondaryInfo;
