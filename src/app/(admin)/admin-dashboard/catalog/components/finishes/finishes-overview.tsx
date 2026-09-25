"use client";

import { useDebounce } from "@/hooks/use-debounce";
import { SearchField } from "../../../components/controls";

import * as React from "react";
import {
    useInfiniteQuery,
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";
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
import { ADMIN_DATA_PAGE_SIZE } from "@/lib/constants";

const FinishesOverview: React.FC = () => {
    const [q, setQ] = React.useState<string>("");
    const query = useDebounce(q.trim(), 300);
    const qc = useQueryClient();

    const {
        data,
        isLoading,
        isError,
        error,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useInfiniteQuery<FinishesPage>({
        queryKey: catalogKeys.finishes(query),
        queryFn: ({ pageParam, signal }) =>
            fetchFinishesPage({
                cursor: (pageParam as string | null) ?? null,
                limit: ADMIN_DATA_PAGE_SIZE,
                q: query,
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
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <SearchField
                    value={q}
                    onChange={setQ}
                    label="Search finishes"
                    placeholder="Search finish name or description…"
                />
                <div className="flex gap-2">
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
                <div className="rounded-md border border-destructive/30 bg-destructive/[0.04] p-3 text-sm text-destructive">
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
