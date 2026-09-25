"use client";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import ErrorMessage from "@/components/utilities/error";
import EmptyState from "../../components/empty-state";
import { getFavoriteDesignsByUser } from "../actions/actions";
import UnfinishedDesignSkeleton from "../../unfinished-designs/components/skeleton/unfinished-design-skeleton";
import FavoriteDesign from "./favorite-design";
import AccountHeader from "../../components/account-header";

interface FavoriteDesignOverviewProps {
    userId: string;
}

const FavoriteDesignOverview: React.FC<FavoriteDesignOverviewProps> = ({
    userId,
}) => {
    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: ["get-favorite-designs", userId],
        queryFn: async () => await getFavoriteDesignsByUser(),
        retry: true,
        retryDelay: 500,
        staleTime: 5 * 60 * 1000,
        enabled: !!userId,
    });

    const designs = data?.designs ?? [];

    const renderContent = () => {
        if (isLoading) {
            return Array.from({ length: 2 }).map((_, i) => (
                <UnfinishedDesignSkeleton key={i} shouldHideThirdButton />
            ));
        }

        if (isError) {
            return (
                <ErrorMessage
                    message="Unable to load your favorite designs."
                    onRetry={() => refetch()}
                />
            );
        }

        if (!data?.success) {
            return (
                <ErrorMessage
                    message={
                        data?.error ?? "Unable to load your favorite designs."
                    }
                    onRetry={() => refetch()}
                />
            );
        }

        if (!designs.length) {
            return (
                <EmptyState
                    title="No favourites yet"
                    description="Save designs you like from our featured designs and they'll wait for you here."
                    href="/featured-designs"
                    cta="Explore featured designs"
                />
            );
        }

        return designs.map((design) => (
            <FavoriteDesign design={design} key={design.id} userId={userId} />
        ));
    };

    return (
        <div>
            <AccountHeader
                heading="Favourites"
                description="Designs you've saved. Buy one as it is, or remove it once you're done with it."
                aside={
                    designs.length ? (
                        <span className="type-label text-ink-soft">
                            {designs.length} saved
                        </span>
                    ) : null
                }
            />
            <section className="flex flex-col">{renderContent()}</section>
        </div>
    );
};

export default FavoriteDesignOverview;
