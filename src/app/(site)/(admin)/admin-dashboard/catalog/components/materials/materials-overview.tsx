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
import { Materials } from "./materials";
import {
    CaseMaterialDTO,
    catalogKeys,
    createMaterial,
    fetchMaterialsPage,
    MaterialsPage,
    toggleCatalogItemActive,
} from "../../actions/actions";
import { CreateMaterialDialog } from "./create-material";
import { updateMaterialSchema } from "@/schema/catalog";

const MaterialsOverview: React.FC = () => {
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
    } = useInfiniteQuery<MaterialsPage>({
        queryKey: catalogKeys.materials(q),
        queryFn: ({ pageParam, signal }) =>
            fetchMaterialsPage({
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

    const materials: CaseMaterialDTO[] = React.useMemo(
        () => data?.pages.flatMap((p) => p.materials) ?? [],
        [data]
    );

    const toggleActiveMutation = useMutation({
        mutationFn: ({ id, next }: { id: string; next: boolean }) =>
            toggleCatalogItemActive({ entity: "material", id, active: next }),
        onMutate: async ({ id, next }) => {
            await qc.cancelQueries({
                queryKey: catalogKeys.materials(),
                exact: false,
            });
            const previous = qc.getQueriesData<MaterialsPage>({
                queryKey: catalogKeys.materials(),
            });
            const patch = (page: MaterialsPage) => ({
                ...page,
                materials: page.materials.map((c) =>
                    c.id === id ? { ...c, active: next } : c
                ),
            });

            previous.forEach(([key, value]) => {
                if (!value) return;
                qc.setQueryData<{
                    pages: MaterialsPage[];
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
                queryKey: catalogKeys.materials(),
                exact: false,
            });
        },
    });

    const handleToggleActive = (id: string, next: boolean) => {
        toggleActiveMutation.mutate({ id, next });
    };

    const createMaterialMutation = useMutation({
        mutationFn: (vals: {
            name: string;
            description: string;
            price: number;
        }) => createMaterial({ data: vals }),
        onSuccess: async () => {
            await Promise.all([
                qc.invalidateQueries({
                    queryKey: catalogKeys.materials(),
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
                    placeholder="Search material name or description…"
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
                    <CreateMaterialDialog
                        schema={updateMaterialSchema}
                        isPending={createMaterialMutation.isPending}
                        onSubmit={async (vals) => {
                            const price =
                                typeof vals.price === "number"
                                    ? vals.price
                                    : Number(vals.price || 0);
                            await createMaterialMutation.mutateAsync({
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
                    {(error as Error)?.message ?? "Failed to load materials."}
                </div>
            )}

            <Materials
                rows={materials}
                loading={isLoading || isFetchingNextPage}
                hasNextPage={!!hasNextPage}
                onLoadMore={() => fetchNextPage()}
                onToggleActive={handleToggleActive}
            />
        </div>
    );
};

export default MaterialsOverview;
