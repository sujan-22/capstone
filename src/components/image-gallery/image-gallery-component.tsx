"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
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
import { Icons } from "../utilities/icons";

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
        <>
            <section className="relative left-1/2 right-1/2 -mx-[50vw] w-screen bg-blue-50 dark:bg-blue-950 text-foreground dark:text-secondary py-16">
                <MaxWidthWrapper>
                    <div className="flex flex-col items-center gap-16 sm:gap-32">
                        <div className="flex flex-col items-center gap-4 sm:gap-6">
                            <h2 className="tracking-tight text-center text-balance !leading-tight font-bold text-5xl md:text-6xl">
                                Pick an image{" "}
                                <span className="relative inline-block px-2">
                                    to start{" "}
                                    <Icons.underlineDashed className="hidden sm:block pointer-events-none absolute w-full inset-x-0 -bottom-6 text-blue-600" />
                                </span>{" "}
                                your case
                            </h2>
                            <p className="text-center text-muted-foreground max-w-xl mx-auto mt-4">
                                Browse our image gallery and choose your
                                favorite. We’ll create a case design instantly
                                so you can jump right into customizing colors,
                                finishes, and more.
                            </p>
                        </div>
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
                                          pendingImageId === img.id &&
                                          mutation.isPending;
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
                        <Button
                            variant={"outline"}
                            onClick={() => router.push("/gallery-images")}
                            className="text-primary"
                            size={"sm"}
                        >
                            Explore more
                        </Button>
                    </div>
                </MaxWidthWrapper>
            </section>
        </>
    );
}
