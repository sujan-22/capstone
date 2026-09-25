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
import { ADMIN_DATA_PAGE_SIZE } from "@/lib/constants";

const ModelsOverview: React.FC = () => {
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
    } = useInfiniteQuery<ModelsPage>({
        queryKey: catalogKeys.models(query),
        queryFn: ({ pageParam, signal }) =>
            fetchModelsPage({
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
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <SearchField
                    value={q}
                    onChange={setQ}
                    label="Search phone models"
                    placeholder="Search model name or brand…"
                />
                <div className="flex gap-2">
                    <PhoneModelFormDialog
                        schema={createPhoneModelSchema}
                        isPending={createModelMutation.isPending}
                        onSubmit={async (vals) => {
                            await createModelMutation.mutateAsync({
                                modelName: vals.modelName,
                                modelBrand: vals.modelBrand,
                            });
                        }}
                        submitText="Save"
                        trigger={<Button icon={MdAdd}>Add model</Button>}
                    />
                </div>
            </div>

            {isError && (
                <div className="rounded-md border border-destructive/30 bg-destructive/[0.04] p-3 text-sm text-destructive">
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
