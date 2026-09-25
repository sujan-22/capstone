"use client";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import ErrorMessage from "@/components/utilities/error";
import EmptyState from "../../components/empty-state";
import { getUnfinishedDesigns } from "../actions/actions";
import UnfinishedDesign from "./unfinished-design";
import UnfinishedDesignSkeleton from "./skeleton/unfinished-design-skeleton";
import AccountHeader from "../../components/account-header";

interface UnfinishedDesignsOverviewPageProps {
    userId: string;
}

const UnfinishedDesignsOverviewPage: React.FC<
    UnfinishedDesignsOverviewPageProps
> = ({ userId }) => {
    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: ["get-unfinished-designs", userId],
        queryFn: async () => await getUnfinishedDesigns(),
        retry: true,
        retryDelay: 500,
        staleTime: 5 * 60 * 1000,
        enabled: !!userId,
    });

    const designs = data?.designs ?? [];

    const renderContent = () => {
        if (isLoading) {
            return Array.from({ length: 2 }).map((_, i) => (
                <UnfinishedDesignSkeleton key={i} />
            ));
        }

        if (isError) {
            return (
                <ErrorMessage
                    message="Unable to load your unfinished designs."
                    onRetry={() => refetch()}
                />
            );
        }

        if (!data?.success) {
            return (
                <ErrorMessage
                    message={
                        data?.error ?? "Unable to load your unfinished designs."
                    }
                    onRetry={() => refetch()}
                />
            );
        }

        if (!designs.length) {
            return (
                <EmptyState
                    title="No unfinished designs"
                    description="Designs you start but don't order are saved here, so you can come back to them any time."
                    href="/configure/upload"
                    cta="Start a new design"
                />
            );
        }

        return designs.map((design) => (
            <UnfinishedDesign design={design} key={design.id} userId={userId} />
        ));
    };

    return (
        <div>
            <AccountHeader
                heading="Unfinished designs"
                description="Cases you've started but not ordered. Pick one up where you left off, or clear it out."
                aside={
                    designs.length ? (
                        <span className="type-label text-ink-soft">
                            {designs.length} in progress
                        </span>
                    ) : null
                }
            />
            <section className="flex flex-col">{renderContent()}</section>
        </div>
    );
};

export default UnfinishedDesignsOverviewPage;
