"use client";

import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Image, Loader2, MousePointerSquareDashed } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import Dropzone, { FileRejection } from "react-dropzone";
import { useMutation } from "@tanstack/react-query";
import { uploadUserImage } from "../actions/actions";

const UploadComponent = ({ userId }: { userId: string }) => {
    const [isDragOver, setIsDragOver] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isPending, startTransition] = useTransition();
    const router = useRouter();
    const { toast } = useToast();

    const mutation = useMutation({
        mutationFn: (file: File) => uploadUserImage(file, userId),
        onMutate: () => {
            setUploadProgress(0);
        },
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

            startTransition(() => {
                setTimeout(() => {
                    router.push(`/configure/customize/${data.designId}`);
                }, 500);
            });
        },
    });

    const onDropRejected = (files: FileRejection[]) => {
        const [file] = files;
        setIsDragOver(false);
        toast({
            title: `${file.file.type} type is not supported`,
            description: "Please choose a PNG, JPG, or JPEG image instead",
            variant: "destructive",
        });
    };

    const onDropAccepted = (files: File[]) => {
        const [file] = files;
        setIsDragOver(false);

        setUploadProgress(10);
        mutation.mutate(file);
    };

    const isUploading = mutation.isPending;

    return (
        <div
            className={cn(
                "relative h-[70vh] flex-1 mt-3 w-full rounded-xl bg-gray-900/5 p-2 ring-1 ring-inset ring-gray-900/10 lg:rounded-xl flex justify-center flex-col items-center",
                { "ring-blue-900/25 bg-blue-900/10": isDragOver }
            )}
        >
            <div className="relative flex flex-1 flex-col items-center justify-center w-full">
                <Dropzone
                    onDropRejected={onDropRejected}
                    onDropAccepted={onDropAccepted}
                    maxSize={10 * 1024 * 1024}
                    accept={{
                        "image/jpg": [".jpg"],
                        "image/png": [".png"],
                        "image/jpeg": [".jpeg"],
                    }}
                    onDragEnter={() => setIsDragOver(true)}
                    onDragLeave={() => setIsDragOver(false)}
                >
                    {({ getRootProps, getInputProps, fileRejections }) => {
                        if (fileRejections.length > 0) {
                            fileRejections.forEach((rejection) => {
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
                                    } else if (
                                        err.code === "file-invalid-type"
                                    ) {
                                        toast({
                                            title: "Invalid file type",
                                            description:
                                                "Please choose a PNG, JPG, or JPEG image.",
                                            variant: "destructive",
                                        });
                                    }
                                });
                            });
                        }
                        return (
                            <div
                                className="h-full w-full flex flex-1 flex-col items-center justify-center"
                                {...getRootProps()}
                            >
                                <input {...getInputProps()} />
                                {isDragOver ? (
                                    <MousePointerSquareDashed className="h-6 w-6 text-zinc-500" />
                                ) : isUploading || isPending ? (
                                    <Loader2 className="animate-spin h-6 w-6 text-zinc-500 mb-2" />
                                ) : (
                                    // eslint-disable-next-line jsx-a11y/alt-text
                                    <Image className="h-6 w-6 text-zinc-500 mb-2" />
                                )}

                                <div className="flex flex-col justify-center mb-2 text-sm text-zinc-700">
                                    {isUploading ? (
                                        <div className="flex flex-col items-center">
                                            <p>Uploading...</p>
                                            <Progress
                                                className="mt-2 w-40 h-2 bg-gray-300"
                                                value={uploadProgress}
                                            />
                                        </div>
                                    ) : isPending ? (
                                        <div className="flex flex-col items-center">
                                            <p>Redirecting, please wait...</p>
                                        </div>
                                    ) : isDragOver ? (
                                        <p>
                                            <span className="font-semibold">
                                                Drop file{" "}
                                            </span>
                                            to upload
                                        </p>
                                    ) : (
                                        <p>
                                            <span className="font-semibold">
                                                Click to upload{" "}
                                            </span>
                                            or drag and drop
                                        </p>
                                    )}
                                </div>

                                {isPending ? null : (
                                    <p className="text-xs text-zinc-500">
                                        PNG, JPG, JPEG
                                    </p>
                                )}
                            </div>
                        );
                    }}
                </Dropzone>
            </div>
        </div>
    );
};

export default UploadComponent;
