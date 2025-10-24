"use client";

import CaseDesignComponent from "./case-design";
import { getFeaturedDesigns } from "./actions/actions";
import { IUser } from "../../../auth-client";
import { useQuery } from "@tanstack/react-query";
import { Icons } from "../utilities/icons";
import { Button } from "../ui/button";
import CaseDesignSkeleton from "./skeletons/case-design-skeleton";
import { useRouter } from "next/navigation";
import MaxWidthWrapper from "../utilities/max-width-wrapper";

export default function FeaturedDesigns({ user }: { user: IUser | undefined }) {
    const router = useRouter();
    const { data, isLoading } = useQuery({
        queryKey: ["get-featured-designs", user?.id],
        queryFn: async () =>
            await getFeaturedDesigns({
                userId: user?.id,
                sort: "none",
                limit: 3,
            }),
        retry: true,
        retryDelay: 500,
        staleTime: 5 * 60 * 1000,
    });

    const designs = data?.designs ?? [];

    return (
        <section className="relative left-1/2 right-1/2 -mx-[50vw] w-screen bg-slate-800 text-secondary py-16">
            <MaxWidthWrapper>
                <div className="flex flex-col items-center gap-16 sm:gap-32">
                    <div className="flex flex-col items-center gap-4 sm:gap-6">
                        <h2 className="tracking-tight text-center text-balance !leading-tight font-bold text-5xl md:text-6xl">
                            Explore our{" "}
                            <span className="relative inline-block px-2">
                                featured{" "}
                                <Icons.underlineDashed className="hidden sm:block pointer-events-none absolute w-full inset-x-0 -bottom-6 text-blue-600" />
                            </span>{" "}
                            designs
                        </h2>
                        <p className="text-center text-muted max-w-xl mx-auto mt-4">
                            Discover hand-picked designs from our creative
                            community. Each piece showcases unique style and
                            craftsmanship to inspire your next custom case.
                        </p>
                    </div>
                    <section
                        className="
                        grid grid-cols-1 
                        [@media(min-width:550px)]:grid-cols-2 
                        [@media(min-width:800px)]:grid-cols-3 
                        gap-6
                        "
                    >
                        {isLoading || !designs.length
                            ? Array.from({ length: 3 }).map((_, i) => (
                                  <CaseDesignSkeleton key={i} isDark />
                              ))
                            : designs.map((design) => (
                                  <CaseDesignComponent
                                      key={design.id}
                                      {...design}
                                      user={user}
                                  />
                              ))}
                    </section>
                    <Button
                        variant={"outline"}
                        onClick={() => router.push("/featured-designs")}
                        className="text-primary"
                        size={"sm"}
                    >
                        Explore more
                    </Button>
                </div>
            </MaxWidthWrapper>
        </section>
    );
}
