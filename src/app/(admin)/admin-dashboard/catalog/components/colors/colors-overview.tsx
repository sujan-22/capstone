"use client";

import { useDebounce } from "@/hooks/use-debounce";
import { SearchField } from "../../../components/controls";

import * as React from "react";
import {
    useInfiniteQuery,
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { MdAdd } from "react-icons/md";
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
import { ADMIN_DATA_PAGE_SIZE } from "@/lib/constants";

const ColorsOverview: React.FC = () => {
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
    } = useInfiniteQuery<ColorsPage>({
        queryKey: catalogKeys.colors(query),
        queryFn: ({ pageParam, signal }) =>
            fetchColorsPage({
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
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <SearchField
                    value={q}
                    onChange={setQ}
                    label="Search colours"
                    placeholder="Search color name or hex…"
                />
                <div className="flex gap-2">
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
                <div className="rounded-md border border-destructive/30 bg-destructive/[0.04] p-3 text-sm text-destructive">
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
