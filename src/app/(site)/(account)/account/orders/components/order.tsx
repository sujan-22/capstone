"use client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { formatDate, formatPrice } from "@/lib/utils";
import { IUserOrderWithDesign } from "@/lib/types/user-orders.types";
import Phone from "@/components/utilities/phone";
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

    return (
        <div
            className="flex flex-col text-sm w-full max-w-full"
            data-testid="order-card"
        >
            <div className="flex flex-col text-muted-foreground text-xs sm:text-sm gap-y-1">
                <div className="flex flex-wrap items-center gap-x-2">
                    <span className="font-semibold text-primary">
                        #{order.orderNumber}
                    </span>
                    <span className="truncate">{order.design.caseName}</span>
                </div>
                <div className="flex flex-wrap items-center gap-x-4">
                    <span>
                        <span className="font-medium">Date:</span>{" "}
                        {formatDate(order.createdAt)}
                    </span>
                    <span>
                        <span className="font-medium">Total:</span>{" "}
                        {formatPrice(order.totalAmount)}
                    </span>
                </div>
            </div>

            {/* Main section */}
            <div className="w-full h-full mt-3">
                <div className="flex flex-col sm:flex-row gap-4 items-start">
                    {/* Phone preview */}
                    <div className="flex-shrink-0 mx-auto sm:mx-0">
                        <div className="relative w-44 h-auto rounded-md bg-muted overflow-hidden flex items-center justify-center">
                            <Phone
                                imgSrc={order.design.croppedImgUrl}
                                altText={order.design.caseName}
                            />
                        </div>
                    </div>

                    {/* Design details */}
                    <div className="flex-1 w-full">
                        <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-2 text-sm">
                            <dt className="text-muted-foreground">Model:</dt>
                            <dd className="text-right">
                                {order.design.modelName}
                            </dd>

                            <dt className="text-muted-foreground">Color:</dt>
                            <dd className="text-right">{order.design.color}</dd>

                            <dt className="text-muted-foreground">Material:</dt>
                            <dd className="text-right">
                                {order.design.material}
                            </dd>

                            <dt className="text-muted-foreground">Finish:</dt>
                            <dd className="text-right">
                                {order.design.finish}
                            </dd>
                        </dl>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row justify-end gap-2 my-4">
                <Button
                    variant={
                        order.design.isSharedPublicly
                            ? "outline"
                            : order.design.hasRequestedToSharePublicly
                            ? "secondary"
                            : "default"
                    }
                    size="sm"
                    className="w-full sm:w-auto"
                    onClick={() => requestToShare()}
                    disabled={
                        isPending ||
                        order.design.hasRequestedToSharePublicly ||
                        order.design.isSharedPublicly
                    }
                    isLoading={isPending}
                >
                    {order.design.isSharedPublicly
                        ? "Already Shared"
                        : order.design.hasRequestedToSharePublicly
                        ? "Already Requested"
                        : "Request to Share Publicly"}
                </Button>

                <Button
                    variant="outline"
                    size="sm"
                    className="w-full sm:w-auto"
                    onClick={() => router.push(`/order-details/${order.id}`)}
                >
                    See details
                </Button>
            </div>
        </div>
    );
};

export default OrderCard;
