"use client";

import * as React from "react";
import {
    useInfiniteQuery,
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MdAdd, MdSearch } from "react-icons/md";
import { Colors } from "./colors";
import {
    CaseColorDTO,
    ColorsPage,
    catalogKeys,
    createColor,
    fetchColorsPage,
    toggleCatalogItemActive,
} from "../../actions/actions";
import { ColorSwatchFormDialog } from "./color-dialog";

const ColorsOverview: React.FC = () => {
    const [q, setQ] = React.useState<string>("");
    const qc = useQueryClient();

    const {
        data,
        isLoading,
        isError,
        error,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        refetch,
    } = useInfiniteQuery<ColorsPage>({
        queryKey: catalogKeys.colors(q),
        queryFn: ({ pageParam, signal }) =>
            fetchColorsPage({
                cursor: (pageParam as string | null) ?? null,
                limit: 50,
                q,
                signal,
            }),
        getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
        staleTime: 30_000,
        refetchOnWindowFocus: false,
        initialPageParam: null,
    });

    const colors: CaseColorDTO[] = React.useMemo(
        () => data?.pages.flatMap((p) => p.colors) ?? [],
        [data]
    );

    const toggleActiveMutation = useMutation({
        mutationFn: ({ id, next }: { id: string; next: boolean }) =>
            toggleCatalogItemActive({ entity: "color", id, active: next }),
        onMutate: async ({ id, next }) => {
            await qc.cancelQueries({
                queryKey: catalogKeys.colors(),
                exact: false,
            });
            const previous = qc.getQueriesData<ColorsPage>({
                queryKey: catalogKeys.colors(),
            });
            const patch = (page: ColorsPage) => ({
                ...page,
                colors: page.colors.map((c) =>
                    c.id === id ? { ...c, active: next } : c
                ),
            });

            previous.forEach(([key, value]) => {
                if (!value) return;
                qc.setQueryData<{
                    pages: ColorsPage[];
                    pageParams: unknown[];
                }>(key, (old) =>
                    old
                        ? {
                              ...old,
                              pages: old.pages.map(patch),
                          }
                        : old
                );
            });

            return { previous };
        },

        onError: (_err, _vars, ctx) => {
            if (!ctx) return;
            ctx.previous.forEach(([key, value]) => {
                qc.setQueryData(key, value);
            });
        },

        onSettled: async () => {
            await qc.invalidateQueries({
                queryKey: catalogKeys.colors(),
                exact: false,
            });
        },
    });

    const handleToggleActive = (id: string, next: boolean) => {
        toggleActiveMutation.mutate({ id, next });
    };

    const createColorMutation = useMutation({
        mutationFn: (vals: { name: string; hex: string }) =>
            createColor({ data: vals }),
        onSuccess: async () => {
            await Promise.all([
                qc.invalidateQueries({
                    queryKey: catalogKeys.colors(),
                    exact: false,
                }),
                qc.invalidateQueries({
                    queryKey: catalogKeys.all,
                    exact: false,
                }),
            ]);
        },
    });

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <Input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Search color name or hex…"
                    className="w-full max-w-sm"
                />
                <div className="flex gap-2">
                    <Button
                        onClick={() => refetch()}
                        variant="outline"
                        icon={MdSearch}
                    >
                        Search
                    </Button>
                    <ColorSwatchFormDialog
                        title="Add Color"
                        description="Pick a swatch and give it a clear, customer-friendly name."
                        isPending={createColorMutation.isPending}
                        trigger={<Button icon={MdAdd}>Add color</Button>}
                        onSubmit={(vals) =>
                            createColorMutation.mutateAsync({
                                name: vals.name,
                                hex: vals.hex,
                            })
                        }
                    />
                </div>
            </div>

            {isError && (
                <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm">
                    {(error as Error)?.message ?? "Failed to load colors."}
                </div>
            )}

            <Colors
                rows={colors}
                loading={isLoading || isFetchingNextPage}
                hasNextPage={!!hasNextPage}
                onLoadMore={() => fetchNextPage()}
                onToggleActive={handleToggleActive}
            />
        </div>
    );
};

export default ColorsOverview;
