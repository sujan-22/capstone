import { IUserOrderWithDesign } from "@/lib/types/user-orders.types";
import { formatDate } from "@/lib/utils";
import React from "react";

const OrderInfo = ({ order }: { order: IUserOrderWithDesign }) => {
    return (
        <div className="text-sm bg-muted px-4 py-2.5 rounded-md">
            <p>
                Order Date:{" "}
                <span className=" text-muted-foreground">
                    {formatDate(order.createdAt)}
                </span>
            </p>
            <p className="mt-1">
                Order Reference Number:{" "}
                <span className=" text-muted-foreground">
                    {order.orderNumber}
                </span>
            </p>
            <div className="flex items-center text-compact-small gap-x-4 mt-1">
                <>
                    <p>
                        Order Status:{" "}
                        <span
                            className={`px-2 py-1 rounded-3xl text-white ${
                                order.orderStatus === "Pending"
                                    ? "bg-yellow-500"
                                    : order.orderStatus === "Shipped"
                                    ? "bg-blue-500"
                                    : "bg-green-500"
                            }`}
                        >
                            {order.orderStatus}
                        </span>
                    </p>
                    {/* <p>
                        Payment status:{" "}
                        <span className="text-muted-foreground">
                            {order.isPaid ? <>Paid</> : <>Not paid</>}
                        </span>
                    </p> */}
                </>
            </div>
        </div>
    );
};

export default OrderInfo;
