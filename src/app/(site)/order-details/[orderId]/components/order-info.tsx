import { IUserOrderWithDesign } from "@/lib/types/user-orders.types";
import { cn, formatDate, getOrderStatus } from "@/lib/utils";
import { Check } from "lucide-react";
import React from "react";

const STAGES = [
    { key: "PENDING", label: "Received" },
    { key: "SHIPPED", label: "Shipped" },
    { key: "FULFILLED", label: "Fulfilled" },
];

const OrderInfo = ({ order }: { order: IUserOrderWithDesign }) => {
    const { tone, label } = getOrderStatus(order.orderStatus);
    const current = STAGES.findIndex(
        (s) => s.key === String(order.orderStatus).toUpperCase()
    );

    return (
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-5">
                <p className="type-label text-ink-soft">Order reference number</p>
                <p className="mt-2 break-all font-mono text-2xl font-medium tracking-tight sm:text-3xl">
                    {order.orderNumber}
                </p>
                <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-ink-soft">
                    <span>Placed {formatDate(order.createdAt)}</span>
                    <span
                        className={cn(
                            "type-label rounded-full px-2.5 py-1",
                            tone
                        )}
                    >
                        {label}
                    </span>
                </p>
            </div>

            <ol
                aria-label="Order progress"
                className="grid grid-cols-3 gap-2 lg:col-span-7"
            >
                {STAGES.map((stage, i) => {
                    const done = current >= 0 && i <= current;
                    return (
                        <li
                            key={stage.key}
                            aria-current={i === current ? "step" : undefined}
                        >
                            <span
                                aria-hidden
                                className={cn(
                                    "block h-1 rounded-full",
                                    done
                                        ? i === current
                                            ? "bg-cobalt"
                                            : "bg-ink"
                                        : "bg-ink/10"
                                )}
                            />
                            <span className="mt-3 flex items-center gap-2 text-sm font-semibold">
                                <span
                                    aria-hidden
                                    className={cn(
                                        "flex size-5 items-center justify-center rounded-full",
                                        done
                                            ? "bg-ink text-paper"
                                            : "border border-ink/20"
                                    )}
                                >
                                    {done ? (
                                        <Check className="size-3" strokeWidth={3} />
                                    ) : null}
                                </span>
                                <span className={done ? "text-ink" : "text-ink-soft"}>
                                    {stage.label}
                                </span>
                            </span>
                        </li>
                    );
                })}
            </ol>
        </div>
    );
};

export default OrderInfo;
