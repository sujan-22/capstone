"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogTrigger,
    DialogClose,
} from "@/components/ui/dialog";
import { MdAdd, MdClose } from "react-icons/md";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import type { FileRejection } from "react-dropzone";
import ImageUpload from "@/components/utilities/image-upload";
import { cn } from "@/lib/utils";
import { uploadGalleryImage } from "../actions/actions";

interface Props {
    onUploaded: () => void;
}

export const AddImageDialog: React.FC<Props> = ({ onUploaded }) => {
    const [open, setOpen] = React.useState(false);
    const [isDragOver, setIsDragOver] = React.useState(false);
    const [uploadProgress, setUploadProgress] = React.useState(0);
    const { toast } = useToast();

    const mutation = useMutation({
        mutationFn: (file: File) =>
            uploadGalleryImage(file, (p) => setUploadProgress(p)),
        onError: (error) => {
            toast({
                title: "Upload failed",
                description: error?.message || "Unknown error occurred",
                variant: "destructive",
            });
            setUploadProgress(0);
        },
        onSuccess: () => {
            toast({
                title: "Upload successful",
                description: "Your image has been uploaded!",
            });
            setUploadProgress(100);
            setTimeout(() => {
                setOpen(false);
                setUploadProgress(0);
                onUploaded?.();
            }, 350);
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
        <Dialog open={open} onOpenChange={(v) => !isUploading && setOpen(v)}>
            <DialogTrigger asChild>
                <Button icon={MdAdd}>Add image</Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[480px]">
                <DialogHeader>
                    <DialogTitle>Add an image</DialogTitle>
                    <DialogDescription>
                        Upload a new gallery image (PNG/JPG, ≤ 10 MB).
                    </DialogDescription>
                </DialogHeader>

                <div
                    className={cn(
                        "relative w-full rounded-xl border-2 border-dashed p-6 sm:p-8 bg-gray-900/5",
                        "flex flex-col items-center justify-center",
                        "min-h-[18rem] sm:min-h-[22rem]",
                        { "ring-blue-900/25 bg-blue-900/10": isDragOver }
                    )}
                >
                    <div className="relative w-full h-full">
                        <ImageUpload
                            onDropAccepted={onDropAccepted}
                            onDropRejected={onDropRejected}
                            setIsDragOver={setIsDragOver}
                            isDragOver={isDragOver}
                            isUploading={isUploading}
                            isPending={false}
                            uploadProgress={uploadProgress}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <DialogClose asChild>
                        <Button
                            type="button"
                            variant="outline"
                            disabled={isUploading}
                            icon={MdClose}
                        >
                            Cancel
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
