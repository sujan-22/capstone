"use client";

import * as React from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MdSearch } from "react-icons/md";
import { Models } from "./models";
import {
    catalogKeys,
    fetchModelsPage,
    ModelsPage,
    PhoneModelDTO,
} from "../../actions/actions";

const ModelsOverview: React.FC = () => {
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
            />
        </div>
    );
};

export default ModelsOverview;
