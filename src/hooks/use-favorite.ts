import { useState, useCallback } from "react";
import { useToast } from "./use-toast";

interface UseFavoriteProps {
    caseDesignId: string;
    initialFavorited: boolean;
}

export function useFavorite({
    caseDesignId,
    initialFavorited,
}: UseFavoriteProps) {
    const [isFavorited, setIsFavorited] = useState(initialFavorited);
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);

    const toggleFavorite = useCallback(
        async (userId: string) => {
            if (loading) return;
            setLoading(true);

            const prevState = isFavorited;
            setIsFavorited(!prevState);

            try {
                const res = await fetch("/api/favorite", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ userId, caseDesignId }),
                });

                const data = await res.json();

                if (!res.ok) {
                    setIsFavorited(prevState);
                    toast({
                        title: "Oops!",
                        description:
                            data.error ||
                            "Failed to update your favorites. Please try again.",
                        variant: "destructive",
                    });
                    return;
                }

                toast({
                    title: !prevState
                        ? "Added to favorites!"
                        : "Removed from favorites!",
                    description: !prevState
                        ? "This design has been added to your favorites."
                        : "This design has been removed from your favorites.",
                    variant: "default",
                });
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (err) {
                setIsFavorited(prevState);
                toast({
                    title: "Network error",
                    description:
                        "Unable to update your favorites. Please check your connection and try again.",
                    variant: "destructive",
                });
            } finally {
                setLoading(false);
            }
        },
        [caseDesignId, isFavorited, loading, toast]
    );

    return { isFavorited, toggleFavorite, loading };
}
