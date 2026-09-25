"use client";

import { IUserOrderWithDesign } from "@/lib/types/user-orders.types";
import OrderCard from "./order";
import EmptyState from "../../components/empty-state";

const OrderOverview = ({
    orders,
    userId,
}: {
    orders: IUserOrderWithDesign[];
    userId: string;
}) => {
    if (orders?.length) {
        return (
            <div className="flex w-full flex-col">
                {orders.map((o) => (
                    <OrderCard key={o.id} order={o} userId={userId} />
                ))}
            </div>
        );
    }

    return (
        <EmptyState
            data-testid="no-orders-container"
            title="No orders yet"
            description="You haven't ordered a case yet. Upload a photo and your first one is a few minutes away."
            href="/configure/upload"
            cta="Start a case"
        />
    );
};

export default OrderOverview;
