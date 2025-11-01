"use client";

import * as React from "react";
import {
    useInfiniteQuery,
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MdSearch } from "react-icons/md";
import {
    CaseFinishDTO,
    catalogKeys,
    createFinish,
    fetchFinishesPage,
    FinishesPage,
    toggleCatalogItemActive,
} from "../../actions/actions";
import { Finishes } from "./finishes";
import { CreateFinishDialog } from "./create-finish";
import { updateFinishSchema } from "@/schema/catalog";

const FinishesOverview: React.FC = () => {
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
    } = useInfiniteQuery<FinishesPage>({
        queryKey: catalogKeys.finishes(q),
        queryFn: ({ pageParam, signal }) =>
            fetchFinishesPage({
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

    const finishes: CaseFinishDTO[] = React.useMemo(
        () => data?.pages.flatMap((p) => p.finishes) ?? [],
        [data]
    );

    const toggleActiveMutation = useMutation({
        mutationFn: ({ id, next }: { id: string; next: boolean }) =>
            toggleCatalogItemActive({ entity: "finish", id, active: next }),
        onMutate: async ({ id, next }) => {
            await qc.cancelQueries({
                queryKey: catalogKeys.finishes(),
                exact: false,
            });
            const previous = qc.getQueriesData<FinishesPage>({
                queryKey: catalogKeys.finishes(),
            });
            const patch = (page: FinishesPage) => ({
                ...page,
                finishes: page.finishes.map((c) =>
                    c.id === id ? { ...c, active: next } : c
                ),
            });

            previous.forEach(([key, value]) => {
                if (!value) return;
                qc.setQueryData<{
                    pages: FinishesPage[];
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
                queryKey: catalogKeys.finishes(),
                exact: false,
            });
        },
    });

    const handleToggleActive = (id: string, next: boolean) => {
        toggleActiveMutation.mutate({ id, next });
    };

    const createFinishMutation = useMutation({
        mutationFn: (vals: {
            name: string;
            description: string;
            price: number;
        }) => createFinish({ data: vals }),
        onSuccess: async () => {
            await Promise.all([
                qc.invalidateQueries({
                    queryKey: catalogKeys.finishes(),
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
                    placeholder="Search finish name or description…"
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
                    <CreateFinishDialog
                        schema={updateFinishSchema}
                        isPending={createFinishMutation.isPending}
                        onSubmit={async (vals) => {
                            const price =
                                typeof vals.price === "number"
                                    ? vals.price
                                    : Number(vals.price || 0);
                            await createFinishMutation.mutateAsync({
                                name: vals.name,
                                description: vals.description,
                                price,
                            });
                        }}
                    />
                </div>
            </div>

            {isError && (
                <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm">
                    {(error as Error)?.message ?? "Failed to load finishes."}
                </div>
            )}

            <Finishes
                rows={finishes}
                loading={isLoading || isFetchingNextPage}
                hasNextPage={!!hasNextPage}
                onLoadMore={() => fetchNextPage()}
                onToggleActive={handleToggleActive}
            />
        </div>
    );
};

export default FinishesOverview;
