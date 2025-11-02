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
import { Models } from "./models";
import {
    catalogKeys,
    createModel,
    fetchModelsPage,
    ModelsPage,
    PhoneModelDTO,
    toggleCatalogItemActive,
} from "../../actions/actions";
import { PhoneModelFormDialog } from "./create-model";
import { createPhoneModelSchema } from "@/schema/catalog";

const ModelsOverview: React.FC = () => {
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
    } = useInfiniteQuery<ModelsPage>({
        queryKey: catalogKeys.models(q),
        queryFn: ({ pageParam, signal }) =>
            fetchModelsPage({
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

    const models: PhoneModelDTO[] = React.useMemo(
        () => data?.pages.flatMap((p) => p.models) ?? [],
        [data]
    );

    const toggleActiveMutation = useMutation({
        mutationFn: ({ id, next }: { id: string; next: boolean }) =>
            toggleCatalogItemActive({ entity: "model", id, active: next }),
        onMutate: async ({ id, next }) => {
            await qc.cancelQueries({
                queryKey: catalogKeys.models(),
                exact: false,
            });
            const previous = qc.getQueriesData<ModelsPage>({
                queryKey: catalogKeys.models(),
            });
            const patch = (page: ModelsPage) => ({
                ...page,
                models: page.models.map((c) =>
                    c.id === id ? { ...c, active: next } : c
                ),
            });

            previous.forEach(([key, value]) => {
                if (!value) return;
                qc.setQueryData<{
                    pages: ModelsPage[];
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
                queryKey: catalogKeys.models(),
                exact: false,
            });
        },
    });

    const handleToggleActive = (id: string, next: boolean) => {
        toggleActiveMutation.mutate({ id, next });
    };

    const createModelMutation = useMutation({
        mutationFn: (vals: { modelName: string; modelBrand: string }) =>
            createModel({ data: vals }),
        onSuccess: async () => {
            await Promise.all([
                qc.invalidateQueries({
                    queryKey: catalogKeys.models(),
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
                    placeholder="Search model name or brand…"
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
                    <PhoneModelFormDialog
                        schema={createPhoneModelSchema}
                        isPending={createModelMutation.isPending}
                        onSubmit={async (vals) => {
                            await createModelMutation.mutateAsync({
                                modelName: vals.modelName,
                                modelBrand: vals.modelBrand,
                            });
                        }}
                        submitText="Create model"
                        trigger={<Button icon={MdAdd}>Add model</Button>}
                    />
                </div>
            </div>

            {isError && (
                <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm">
                    {(error as Error)?.message ?? "Failed to load models."}
                </div>
            )}

            <Models
                rows={models}
                loading={isLoading || isFetchingNextPage}
                hasNextPage={!!hasNextPage}
                onLoadMore={() => fetchNextPage()}
                onToggleActive={handleToggleActive}
            />
        </div>
    );
};

export default ModelsOverview;
