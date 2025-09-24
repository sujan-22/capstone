"use client";

import CaseDesignComponent from "./case-design";
import { getFeaturedDesigns } from "./actions/actions";
import { IUser } from "../../../auth-client";
import { useQuery } from "@tanstack/react-query";
import { Icons } from "../utilities/icons";

export default function FeaturedDesigns({ user }: { user: IUser | undefined }) {
    const { data } = useQuery({
        queryKey: ["get-featured-designs", user?.id],
        queryFn: async () => await getFeaturedDesigns(user?.id),
        retry: true,
        retryDelay: 500,
        staleTime: 5 * 60 * 1000,
    });

    const designs = data?.designs ?? [];

    return (
        <section className="py-16">
            <div className="flex flex-col items-center gap-16 sm:gap-32">
                <div className="flex flex-col lg:flex-row items-center gap-4 sm:gap-6">
                    <h2 className="order-1 tracking-tight text-center text-balance !leading-tight font-bold text-5xl md:text-6xl">
                        Explore our{" "}
                        <span className="relative inline-block px-2">
                            featured{" "}
                            <Icons.underlineDashed className="hidden sm:block pointer-events-none absolute w-full inset-x-0 -bottom-6 text-blue-600" />
                        </span>{" "}
                        designs
                    </h2>
                </div>
                <section
                    className="
    grid grid-cols-1 
    [@media(min-width:550px)]:grid-cols-2 
    [@media(min-width:800px)]:grid-cols-3 
    gap-6
  "
                >
                    {designs.map((design) => (
                        <CaseDesignComponent
                            key={design.caseName}
                            {...design}
                            user={user}
                        />
                    ))}
                </section>
            </div>
        </section>
    );
}
