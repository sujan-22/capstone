"use client";

import { useInfiniteQuery, useMutation } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import {
    createDesignFromGalleryImage,
    getImageGallery,
} from "../actions/actions";
import { Button } from "@/components/ui/button";
import { useMemo, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { IMAGE_GALLERY_PAGE_SIZE } from "@/lib/constants";
import { useToast } from "@/hooks/use-toast";
import ImageComponent from "./image";

export default function GalleryImagesPreview({
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
    const sort =
        (searchParams.get("sort") as
            | "none"
            | "popularity_asc"
            | "popularity_desc"
            | null) ?? "none";

    const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
        useInfiniteQuery({
            queryKey: ["paginated-gallery-images", sort],
            queryFn: async ({ pageParam = 0 }) =>
                await getImageGallery(IMAGE_GALLERY_PAGE_SIZE, pageParam, sort),
            getNextPageParam: (lastPage) => {
                if (!lastPage?.pagination) return undefined;
                const {
                    offset = 0,
                    count = 0,
                    limit = 0,
                } = lastPage.pagination;
                if (count < limit || !limit) return undefined;
                return offset + limit;
            },

            staleTime: 1000 * 60 * 5,
            initialPageParam: 0,
            enabled: !!sort,
        });

    const images = useMemo(
        () => data?.pages?.flatMap((page) => page.images) ?? [],
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
        <section className="pb-16">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full">
                {isLoading
                    ? Array.from({ length: 8 }).map((_, i) => (
                          <Skeleton
                              key={i}
                              className="h-64 w-full rounded-2xl"
                          />
                      ))
                    : images.map((img) => {
                          const isPending =
                              pendingImageId === img.id && mutation.isPending;
                          const anyPending = !!pendingImageId;
                          return (
                              <ImageComponent
                                  key={img.id}
                                  img={{ id: img.id, url: img.url }}
                                  anyPending={anyPending}
                                  isPending={isPending}
                                  handleUseImage={handleUseImage}
                              />
                          );
                      })}
            </div>

            {hasNextPage && (
                <div className="flex justify-center mt-10">
                    <Button
                        onClick={() => fetchNextPage()}
                        disabled={isFetchingNextPage}
                        variant="outline"
                        className="rounded-xl"
                        isLoading={isFetchingNextPage}
                    >
                        Load more
                    </Button>
                </div>
            )}
        </section>
    );
}
