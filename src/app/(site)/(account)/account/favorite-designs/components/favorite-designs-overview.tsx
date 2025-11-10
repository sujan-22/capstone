"use client";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import ErrorMessage from "@/components/utilities/error";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getFavoriteDesignsByUser } from "../actions/actions";
import UnfinishedDesignSkeleton from "../../unfinished-designs/components/skeleton/unfinished-design-skeleton";
import FavoriteDesign from "./favorite-design";
import AccountHeader from "../../components/account-header";
import { Heart } from "lucide-react";

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
                <div className="w-full flex flex-col items-center gap-4 col-span-full text-center">
                    <h2 className="text-2xl font-semibold">
                        No favorite designs
                    </h2>
                    <p className="text-base text-muted-foreground max-w-md">
                        You don’t have any favorite custom case designs yet.
                        Once you mark a design as favorite, it will appear here.
                    </p>
                    <Link href="/featured-designs" passHref>
                        <Button className="mt-2">
                            Explore our featured designs
                        </Button>
                    </Link>
                </div>
            );
        }

        return designs.map((design) => (
            <FavoriteDesign design={design} key={design.id} userId={userId} />
        ));
    };

    return (
        <div className="space-y-6">
            <AccountHeader
                heading="Your Favorite Designs"
                description="Here are all your favorite custom case designs. You can
                    continue customizing them or remove them from favorites if
                    you’ve completed them."
                icon={Heart}
            />
            <section className="flex flex-col gap-4">{renderContent()}</section>
        </div>
    );
};

export default FavoriteDesignOverview;
