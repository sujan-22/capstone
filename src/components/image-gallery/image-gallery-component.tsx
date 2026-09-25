"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { useMemo, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { HOME_PAGE_GALLERY_SIZE } from "@/lib/constants";
import { useToast } from "@/hooks/use-toast";
import {
    createDesignFromGalleryImage,
    getImageGallery,
} from "@/app/(site)/gallery-images/actions/actions";
import ImageComponent from "@/app/(site)/gallery-images/components/image";
import MaxWidthWrapper from "../utilities/max-width-wrapper";

export default function ImageGalleryComponent({
    userId,
}: {
    userId: string | null | undefined;
}) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const currentUrl = `${pathname}${
        searchParams.toString() ? "?" + searchParams.toString() : ""
    }`;

    const { toast } = useToast();
    const sort = "none";

    const { data, isLoading } = useQuery({
        queryKey: ["gallery-images", sort],
        queryFn: async () =>
            await getImageGallery(HOME_PAGE_GALLERY_SIZE, 0, sort),
        staleTime: 1000 * 60 * 5,
    });

    const images = useMemo(
        () => data?.images?.flatMap((page) => page) ?? [],
        [data]
    );

    const [pendingImageId, setPendingImageId] = useState<string | null>(null);

    const mutation = useMutation({
        mutationFn: async (args: {
            gallery_image_id: string;
            imageUrl: string;
        }) =>
            createDesignFromGalleryImage(args.gallery_image_id, args.imageUrl),
        onSuccess: (res) => {
            setPendingImageId(null);
            if (res.success && res.designId) {
                router.push(
                    `/configure/customize/${encodeURIComponent(res.designId)}`
                );
            } else {
                console.error("Use image failed:", res.error);
                toast({
                    title: "Failed to create design",
                    description:
                        res.error ||
                        "An unknown error occurred while creating the design.",
                    variant: "destructive",
                });
            }
        },
        onError: (err: unknown) => {
            setPendingImageId(null);
            const message = err instanceof Error ? err.message : String(err);
            console.error("Mutation error:", message);
            toast({
                title: "Failed to create design",
                description: message || "An unknown error occurred.",
                variant: "destructive",
            });
        },
    });

    const handleUseImage = (imageId: string, imageUrl: string) => {
        if (!userId) {
            router.push(
                `/sign-in?redirectTo=${encodeURIComponent(currentUrl)}`
            );
            return;
        }

        setPendingImageId(imageId);

        mutation.mutate({ gallery_image_id: imageId, imageUrl });
    };

    return (
        <section className="py-20 sm:py-28">
            <MaxWidthWrapper>
                <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
                    <div className="lg:col-span-7">
                        <p className="type-label text-ink-soft">
                            Image gallery
                        </p>
                        <h2 className="type-display mt-5 max-w-[13ch]">
                            No photo? Start with one of ours.
                        </h2>
                    </div>
                    <div className="lg:col-span-4 lg:col-start-9">
                        <p className="text-lg leading-relaxed text-ink-soft">
                            Pick any image and we&rsquo;ll set up a case design
                            with it, ready for you to place and customise.
                        </p>
                        <Link
                            href="/gallery-images"
                            className="group mt-5 inline-flex items-center gap-2 font-semibold underline decoration-ink/25 underline-offset-[6px] transition-colors hover:decoration-ink"
                        >
                            Browse the full gallery
                            <ArrowRight
                                aria-hidden
                                className="size-4 transition-transform duration-300 ease-out-expo group-hover:translate-x-1"
                            />
                        </Link>
                    </div>
                </div>

                <div className="mt-14 grid w-full grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 md:grid-cols-4">
                    {isLoading
                        ? Array.from({ length: 8 }).map((_, i) => (
                              <Skeleton
                                  key={i}
                                  className="aspect-[4/5] w-full rounded-md"
                              />
                          ))
                        : images.map((img, i) => {
                              const isPending =
                                  pendingImageId === img.id &&
                                  mutation.isPending;
                              const anyPending = !!pendingImageId;
                              return (
                                  <ImageComponent
                                      key={img.id}
                                      img={{ id: img.id, url: img.url }}
                                      index={i}
                                      anyPending={anyPending}
                                      isPending={isPending}
                                      handleUseImage={handleUseImage}
                                  />
                              );
                          })}
                </div>
            </MaxWidthWrapper>
        </section>
    );
}
