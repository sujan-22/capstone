"use client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { cn, formatDate, formatPrice, getOrderStatus } from "@/lib/utils";
import { IUserOrderWithDesign } from "@/lib/types/user-orders.types";
import DesignRow from "../../components/design-row";
import { Check } from "lucide-react";
import { handleRequestToShareDesign } from "../actions/actions";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

const OrderCard = ({
    order,
}: {
    order: IUserOrderWithDesign;
    userId: string;
}) => {
    const router = useRouter();
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const { mutate: requestToShare, isPending } = useMutation({
        mutationFn: async () => handleRequestToShareDesign(order.design.id),
        onSuccess: () => {
            toast({
                title: "Request sent",
                description:
                    "Your request to share the design has been sent successfully and is under review.",
            });
        },
        onSettled: (data) => {
            if (data?.success) {
                queryClient.invalidateQueries({
                    queryKey: ["get-orders"],
                });
            }
        },
        onError: (err) => {
            toast({
                title: "Error",
                description:
                    err?.message ||
                    "There was an error sending your request. Please try again.",
                variant: "destructive",
            });
        },
    });

    const { tone, label } = getOrderStatus(order.orderStatus);
    const shared = order.design.isSharedPublicly;
    const requested = order.design.hasRequestedToSharePublicly;

    return (
        <DesignRow
            data-testid="order-card"
            imgSrc={order.design.croppedImgUrl}
            caseName={order.design.caseName}
            modelName={order.design.modelName}
            color={order.design.color}
            material={order.design.material}
            finish={order.design.finish}
            kicker={<>#{order.orderNumber}</>}
            badge={
                <span className={cn("type-label shrink-0 rounded-full px-2.5 py-1", tone)}>
                    {label}
                </span>
            }
            meta={
                <>
                    Ordered {formatDate(order.createdAt)} ·{" "}
                    <span className="font-medium text-ink">
                        {formatPrice(order.totalAmount)}
                    </span>
                </>
            }
            actions={
                <>
                    <Button
                        variant="ink"
                        size="sm"
                        className="h-9 px-4"
                        onClick={() => router.push(`/order-details/${order.id}`)}
                    >
                        See details
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-9 px-4"
                        onClick={() => requestToShare()}
                        disabled={isPending || requested || shared}
                        isLoading={isPending}
                    >
                        {shared ? (
                            <>
                                <Check aria-hidden className="size-3.5" />
                                Shared publicly
                            </>
                        ) : requested ? (
                            "Share requested"
                        ) : (
                            "Request to share publicly"
                        )}
                    </Button>
                </>
            }
        />
    );
};

export default OrderCard;
