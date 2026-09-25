"use client";

import * as React from "react";
import {
    useInfiniteQuery,
    useMutation,
    useQueryClient,
    type InfiniteData,
} from "@tanstack/react-query";
import { ImagesGrid } from "./images-grid";
import {
    adminImagesKeys,
    fetchAdminImagesPage,
    setImageActive,
    type AdminImageItem,
    type ImagesPage,
} from "../actions/actions";
import { ADMIN_DATA_PAGE_SIZE } from "@/lib/constants";

export default function ImagesOverview() {
    const qc = useQueryClient();
    const queryKey = adminImagesKeys.list("", {});

    const {
        data,
        isLoading,
        isError,
        error,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useInfiniteQuery<ImagesPage>({
        queryKey,
        queryFn: ({ pageParam, signal }) =>
            fetchAdminImagesPage({
                cursor: (pageParam as string | null) ?? null,
                limit: ADMIN_DATA_PAGE_SIZE,
                signal,
            }),
        getNextPageParam: (last) => last.nextCursor ?? undefined,
        staleTime: 30_000,
        refetchOnWindowFocus: false,
        initialPageParam: null,
    });

    const images: AdminImageItem[] = React.useMemo(
        () => data?.pages.flatMap((p) => p.images) ?? [],
        [data]
    );

    const toggleMutation = useMutation({
        mutationFn: ({ id, next }: { id: string; next: boolean }) =>
            setImageActive(id, next),

        onMutate: async ({ id, next }) => {
            await qc.cancelQueries({ queryKey });

            const previous =
                qc.getQueryData<InfiniteData<ImagesPage>>(queryKey);

            qc.setQueryData<InfiniteData<ImagesPage>>(queryKey, (old) => {
                if (!old?.pages) return old;
                return {
                    ...old,
                    pages: old.pages.map((pg) => ({
                        ...pg,
                        images: pg.images.map((im) =>
                            im.id === id ? { ...im, active: next } : im
                        ),
                    })),
                };
            });

            return { previous };
        },

        onError: (_err, _vars, ctx) => {
            if (ctx?.previous) {
                qc.setQueryData(queryKey, ctx.previous);
            }
        },

        onSettled: () => {
            qc.invalidateQueries({ queryKey });
        },
    });

    return (
        <div className="space-y-5">
            {isError && (
                <div className="rounded-md border border-destructive/30 bg-destructive/[0.04] p-3 text-sm text-destructive">
                    {(error as Error)?.message ?? "Failed to load images."}
                </div>
            )}

            <ImagesGrid
                rows={images}
                loading={isLoading || isFetchingNextPage}
                hasNextPage={!!hasNextPage}
                onLoadMore={() => fetchNextPage()}
                onToggleActive={async (id, next) =>
                    toggleMutation.mutate({ id, next })
                }
            />
        </div>
    );
}
