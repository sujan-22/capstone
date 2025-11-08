"use client";

import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { FileRejection } from "react-dropzone";
import { useMutation } from "@tanstack/react-query";
import { uploadUserImage } from "../actions/actions";
import ImageUpload from "@/components/utilities/image-upload";

const UploadComponent = ({ }: { userId: string }) => {
    const [isDragOver, setIsDragOver] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isPending, startTransition] = useTransition();
    const router = useRouter();
    const { toast } = useToast();

    const mutation = useMutation({
        mutationFn: (file: File) =>
            uploadUserImage(file, (p) => setUploadProgress(p)),
        onError: (error) => {
            toast({
                title: "Upload failed",
                description: error?.message || "Unknown error occurred",
                variant: "destructive",
            });
            setUploadProgress(0);
        },
        onSuccess: (data) => {
            toast({
                title: "Upload successful",
                description: "Your image has been uploaded!",
            });
            setUploadProgress(100);

            router.prefetch(`/configure/customize/${data.designId}`);
            startTransition(() =>
                router.push(`/configure/customize/${data.designId}`)
            );
        },
    });

    const onDropRejected = (files: FileRejection[]) => {
        setIsDragOver(false);

        files.forEach((rejection) => {
            rejection.errors.forEach((err) => {
                if (err.code === "file-too-large") {
                    toast({
                        title: "File too large",
                        description: `Maximum file size is 10 MB. Your file is ${(
                            rejection.file.size /
                            (1024 * 1024)
                        ).toFixed(2)} MB.`,
                        variant: "destructive",
                    });
                } else if (err.code === "file-invalid-type") {
                    toast({
                        title: "Invalid file type",
                        description: "Please choose a PNG, JPG, or JPEG image.",
                        variant: "destructive",
                    });
                } else {
                    toast({
                        title: "Upload failed",
                        description: err.message,
                        variant: "destructive",
                    });
                }
            });
        });
    };

    const onDropAccepted = (files: File[]) => {
        const [file] = files;
        setIsDragOver(false);
        mutation.mutate(file);
    };

    const isUploading = mutation.isPending;

    return (
        <div
            className={cn(
                "relative h-[70vh] flex-1 w-full rounded-xl bg-gray-900/5 p-2 ring-1 ring-inset ring-gray-900/10 lg:rounded-xl flex justify-center flex-col items-center",
                { "ring-blue-900/25 bg-blue-900/10": isDragOver }
            )}
        >
            <div className="relative flex flex-1 flex-col items-center justify-center w-full">
                <ImageUpload
                    onDropAccepted={onDropAccepted}
                    onDropRejected={onDropRejected}
                    setIsDragOver={setIsDragOver}
                    isDragOver={isDragOver}
                    isUploading={isUploading}
                    isPending={isPending}
                    uploadProgress={uploadProgress}
                />
            </div>
        </div>
    );
};

export default UploadComponent;
