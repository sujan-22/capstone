"use client";
import React from "react";
import { Separator } from "@/components/ui/separator";
import { useQuery } from "@tanstack/react-query";
import ErrorMessage from "@/components/utilities/error";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getFavoriteDesignsByUser } from "../actions/actions";
import CaseDesignComponent from "@/components/case-design/case-design";
import { IUser } from "../../../../../../auth-client";
import CaseDesignSkeleton from "@/components/case-design/skeletons/case-design-skeleton";

interface FavoriteDesignsPageProps {
    user: IUser;
}

const FavoriteDesignsPage: React.FC<FavoriteDesignsPageProps> = ({ user }) => {
    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: ["get-favorite-designs", user?.id],
        queryFn: async () => await getFavoriteDesignsByUser(user.id),
        retry: true,
        retryDelay: 500,
        staleTime: 5 * 60 * 1000,
        enabled: !!user?.id,
    });

    const designs = data?.designs ?? [];

    const renderContent = () => {
        if (isLoading) {
            return Array.from({ length: 6 }).map((_, i) => (
                <CaseDesignSkeleton key={i} />
            ));
        }

        if (isError) {
            return (
                <ErrorMessage
                    message="Failed to load favorite designs."
                    onRetry={() => refetch()}
                />
            );
        }

        if (!data?.success) {
            return (
                <ErrorMessage
                    message={data?.error ?? "Failed to load favorite designs."}
                    onRetry={() => refetch()}
                />
            );
        }

        if (!designs.length) {
            return (
                <div className="w-full flex flex-col items-center gap-y-4 col-span-full">
                    <h2 className="text-large-semi">No favorite designs yet</h2>
                    <p className="text-base-regular">
                        You haven&apos;t favorited any designs yet. Start
                        exploring and add some to your favorites!
                    </p>
                    <div className="mt-4">
                        <Link href="/" passHref>
                            <Button>Explore Designs</Button>
                        </Link>
                    </div>
                </div>
            );
        }

        return designs.map((design) => (
            <CaseDesignComponent
                key={design.id ?? design.caseName}
                {...design}
                user={user}
            />
        ));
    };

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg">Favorite Designs</h3>
                <p className="text-sm text-muted-foreground">
                    Here are all the designs you have favorited.
                </p>
            </div>

            <Separator />
            <section
                className="
                    grid grid-cols-1
                    [@media(min-width:550px)]:grid-cols-2
                    [@media(min-width:800px)]:grid-cols-3
                    gap-6
                "
            >
                {renderContent()}
            </section>
        </div>
    );
};

export default FavoriteDesignsPage;
