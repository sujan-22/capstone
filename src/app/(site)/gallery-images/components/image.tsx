import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import Image from "next/image";
import React from "react";

interface ImageComponentProps {
    img: {
        id: string;
        url: string;
    };
    isPending: boolean;
    anyPending: boolean;
    handleUseImage: (gallery_image_id: string, imageUrl: string) => void;
}

const ImageComponent: React.FC<ImageComponentProps> = ({
    img,
    isPending,
    anyPending,
    handleUseImage,
}) => {
    return (
        <div key={img.id} className="group relative">
            <Card className="overflow-hidden rounded-2xl hover:shadow-lg transition-all p-0">
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
                                    Processing your request...
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
                            onClick={() => handleUseImage(img.id, img.url)}
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
                    onClick={() => handleUseImage(img.id, img.url)}
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
};

export default ImageComponent;
