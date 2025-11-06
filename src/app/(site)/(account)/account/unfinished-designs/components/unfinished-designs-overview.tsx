"use client";
import React from "react";
import { Separator } from "@/components/ui/separator";
import { useQuery } from "@tanstack/react-query";
import ErrorMessage from "@/components/utilities/error";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getUnfinishedDesigns } from "../actions/actions";
import UnfinishedDesign from "./unfinished-design";
import UnfinishedDesignSkeleton from "./skeleton/unfinished-design-skeleton";

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
                <div className="w-full flex flex-col items-center gap-4 col-span-full text-center">
                    <h2 className="text-2xl font-semibold">
                        No unfinished designs
                    </h2>
                    <p className="text-base text-muted-foreground max-w-md">
                        You don’t have any unfinished custom case designs yet.
                        Once you start creating a design, it will appear here
                        for you to continue working on it.
                    </p>
                    <Link href="/" passHref>
                        <Button className="mt-2">Start a New Design</Button>
                    </Link>
                </div>
            );
        }

        return designs.map((design) => (
            <UnfinishedDesign design={design} key={design.id} userId={userId} />
        ));
    };

    return (
        <div className="space-y-6">
            <div className="text-center sm:text-left">
                <h3 className="text-2xl font-semibold">
                    Your Unfinished Designs
                </h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-lg">
                    Here are all your ongoing custom case designs. You can
                    continue customizing them or dismiss reminders for designs
                    you’ve completed.
                </p>
            </div>

            <Separator />

            <section className="flex flex-col gap-4">{renderContent()}</section>
        </div>
    );
};

export default UnfinishedDesignsOverviewPage;
