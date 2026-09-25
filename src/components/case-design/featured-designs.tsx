"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import CaseDesignComponent from "./case-design";
import { getFeaturedDesigns } from "./actions/actions";
import { IUser } from "../../../auth-client";
import CaseDesignSkeleton from "./skeletons/case-design-skeleton";
import MaxWidthWrapper from "../utilities/max-width-wrapper";

export default function FeaturedDesigns({ user }: { user: IUser | undefined }) {
    const { data, isLoading } = useQuery({
        queryKey: ["get-featured-designs", user?.id],
        queryFn: async () =>
            await getFeaturedDesigns({
                sort: "none",
                limit: 3,
            }),
        retry: true,
        retryDelay: 500,
        staleTime: 5 * 60 * 1000,
    });

    const designs = data?.designs ?? [];

    return (
        <section className="relative overflow-hidden bg-ink py-20 text-paper sm:py-28">
            <MaxWidthWrapper>
                <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
                    <div className="lg:col-span-7">
                        <p className="type-label text-paper/60">
                            Featured designs
                        </p>
                        <h2 className="type-display mt-5">
                            Off the press
                            <span className="text-cobalt-light">.</span>
                        </h2>
                    </div>
                    <div className="lg:col-span-4 lg:col-start-9">
                        <p className="text-lg leading-relaxed text-paper/70">
                            Cases our customers designed and chose to share.
                            Buy one as it is, or save it to your favourites.
                        </p>
                        <Link
                            href="/featured-designs"
                            className="group mt-5 inline-flex items-center gap-2 font-semibold text-paper underline decoration-paper/30 underline-offset-[6px] transition-colors hover:decoration-paper"
                        >
                            See all featured designs
                            <ArrowRight
                                aria-hidden
                                className="size-4 transition-transform duration-300 ease-out-expo group-hover:translate-x-1"
                            />
                        </Link>
                    </div>
                </div>

                <div className="mt-14 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
                    {isLoading || !designs.length
                        ? Array.from({ length: 3 }).map((_, i) => (
                              <CaseDesignSkeleton key={i} isDark />
                          ))
                        : designs.map((design) => (
                              <CaseDesignComponent
                                  key={design.id}
                                  {...design}
                                  user={user}
                                  tone="ink"
                              />
                          ))}
                </div>
            </MaxWidthWrapper>
        </section>
    );
}
