"use client";

import { useInfiniteQuery, useMutation } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import {
    createDesignFromGalleryImage,
    getImageGallery,
} from "../actions/actions";
import { Button } from "@/components/ui/button";
import { useMemo, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { IMAGE_GALLERY_PAGE_SIZE } from "@/lib/constants";
import { useToast } from "@/hooks/use-toast";
import { Spinner } from "@/components/ui/spinner";

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
            queryKey: ["gallery-images", sort],
            queryFn: async ({ pageParam = 0 }) =>
                await getImageGallery(IMAGE_GALLERY_PAGE_SIZE, pageParam, sort),
            getNextPageParam: (lastPage) => {
                const { offset, count, limit } = lastPage.pagination;
                return count < limit ? undefined : offset + limit;
            },
            staleTime: 1000 * 60 * 5,
            initialPageParam: 0,
        });

    const images = useMemo(
        () => data?.pages.flatMap((page) => page.images) ?? [],
        [data]
    );

    const [pendingImageId, setPendingImageId] = useState<string | null>(null);

    const mutation = useMutation({
        mutationFn: async (args: {
            gallery_image_id: string;
            imageUrl: string;
        }) =>
            createDesignFromGalleryImage(
                userId!,
                args.gallery_image_id,
                args.imageUrl
            ),
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
                              <div key={img.id} className="group relative">
                                  <Card className="overflow-hidden rounded-2xl hover:shadow-lg transition-all">
                                      <CardContent className="p-0">
                                          <div className="relative aspect-[4/5] w-full">
                                              <Image
                                                  src={img.url}
                                                  alt={`Gallery image ${img.id}`}
                                                  fill
                                                  sizes="(max-width: 768px) 100vw, 25vw"
                                                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                                              />

                                              {isPending && (
                                                  <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center rounded-2xl z-10">
                                                      <Spinner className="text-secondary" />
                                                      <span className="text-white text-sm">
                                                          Processing your
                                                          request...
                                                      </span>
                                                  </div>
                                              )}
                                          </div>
                                      </CardContent>
                                  </Card>

                                  {!isPending && (
                                      <div
                                          className="pointer-events-none absolute inset-0 flex items-center justify-center 
               bg-black/0 transition-opacity duration-200 opacity-0 group-hover:opacity-60 md:group-hover:pointer-events-auto rounded-2xl"
                                          aria-hidden
                                      >
                                          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                              <Button
                                                  onClick={() =>
                                                      handleUseImage(
                                                          img.id,
                                                          img.url
                                                      )
                                                  }
                                                  variant="secondary"
                                                  className="rounded-full px-4 py-2"
                                                  aria-label={`Use gallery image ${img.id} to create a design`}
                                                  disabled={anyPending}
                                              >
                                                  Use this image
                                              </Button>
                                          </div>
                                      </div>
                                  )}

                                  <div className="mt-3 md:hidden flex justify-center">
                                      <Button
                                          onClick={() =>
                                              handleUseImage(img.id, img.url)
                                          }
                                          variant="outline"
                                          className="rounded-2xl w-full"
                                          aria-label={`Use gallery image ${img.id} to create a design`}
                                          disabled={anyPending}
                                          isLoading={isPending}
                                      >
                                          Use this image
                                      </Button>
                                  </div>
                              </div>
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
