"use client";

import * as React from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MdSearch } from "react-icons/md";
import { Materials } from "./materials";
import {
    CaseMaterialDTO,
    catalogKeys,
    fetchMaterialsPage,
    MaterialsPage,
} from "../../actions/actions";

const MaterialsOverview: React.FC = () => {
    const [q, setQ] = React.useState<string>("");

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
            />
        </div>
    );
};

export default MaterialsOverview;
