"use client";

import { getFeaturedDesigns } from "@/components/case-design/actions/actions";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import { IUser } from "../../../../auth-client";
import CaseDesignSkeleton from "@/components/case-design/skeletons/case-design-skeleton";
import Design from "./design";
import { useSearchParams } from "next/navigation";

const FeaturedDesigns = ({ user }: { user: IUser | undefined }) => {
    const searchParams = useSearchParams();
    const currentSort = searchParams.get("sort") || "none";

    const { data, isLoading } = useQuery({
        queryKey: ["get-featured-designs-page", user?.id, currentSort],
        queryFn: async () =>
            await getFeaturedDesigns({
                userId: user?.id,
                sort: currentSort,
            }),
        retry: true,
        retryDelay: 500,
        staleTime: 5 * 60 * 1000,
    });

    const designs = data?.designs ?? [];
    return (
        <section
            className="
    grid grid-cols-1 
    [@media(min-width:550px)]:grid-cols-2 
    [@media(min-width:950px)]:grid-cols-3 
    gap-6
"
        >
            {isLoading || !designs.length
                ? Array.from({ length: 3 }).map((_, i) => (
                      <CaseDesignSkeleton key={i} />
                  ))
                : designs.map((design) => (
                      <Design key={design.id} {...design} user={user} />
                  ))}
        </section>
    );
};

export default FeaturedDesigns;
