import { useState, useCallback } from "react";
import { useToast } from "./use-toast";
import { useRouter } from "next/navigation";
import { http } from "@/lib/http";

interface UseBuyNowProps {
    designId: string;
}

export function useBuyNow({ designId }: UseBuyNowProps) {
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();
    const router = useRouter();

    const buyNow = useCallback(async () => {
        if (loading) return;
        setLoading(true);

        try {
            const { data } = await http.post<{
                success?: boolean;
                newDesignId?: string;
                error?: string;
            }>(`/api/buy-now/${designId}`);

            if (!data?.success || !data.newDesignId || data.error) {
                toast({
                    title: "Something went wrong!",
                    description:
                        data.error ||
                        "We couldn’t process your request. Please try again later.",
                    variant: "destructive",
                });
                return;
            }

            router.push(`/configure/customize/${data.newDesignId}`);
        } catch (error) {
            console.error(error);
            toast({
                title: "Network error",
                description:
                    "Unable to process your request. Please check your connection and try again.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    }, [designId, loading, toast, router]);

    return { buyNow, loading };
}
