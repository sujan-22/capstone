"use client";

import { Image, Loader2, MousePointerSquareDashed } from "lucide-react";
import { SetStateAction } from "react";
import Dropzone, { FileRejection } from "react-dropzone";
import { Progress } from "../ui/progress";
import { cn } from "@/lib/utils";

interface Props {
    onDropAccepted: (files: File[]) => void;
    onDropRejected: (files: FileRejection[]) => void;
    setIsDragOver: (value: SetStateAction<boolean>) => void;
    isDragOver: boolean;
    isUploading: boolean;
    isPending: boolean;
    uploadProgress: number;
}

const ImageUpload: React.FC<Props> = ({
    onDropAccepted,
    setIsDragOver,
    isDragOver,
    isPending,
    isUploading,
    uploadProgress,
    onDropRejected,
}) => {
    const busy = isUploading || isPending;

    return (
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
            disabled={busy}
        >
            {({ getRootProps, getInputProps }) => {
                return (
                    <div
                        className={cn(
                            "group flex h-full w-full flex-1 cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed px-6 py-12 text-center outline-none transition-colors focus-visible:border-cobalt",
                            isDragOver
                                ? "border-cobalt"
                                : "border-ink/15 hover:border-ink/35",
                            busy && "cursor-default"
                        )}
                        {...getRootProps()}
                    >
                        <input {...getInputProps()} aria-label="Upload a photo" />

                        <span
                            aria-hidden
                            className={cn(
                                "relative flex aspect-[9/16] w-16 items-center justify-center rounded-[14px] border-2 transition-all duration-500 ease-out-expo",
                                isDragOver
                                    ? "-rotate-6 scale-110 border-cobalt bg-cobalt text-white"
                                    : "border-ink/25 bg-paper text-ink-soft group-hover:-rotate-3 group-hover:border-ink/50"
                            )}
                        >
                            <span className="absolute left-1.5 top-1.5 size-4 rounded-[5px] bg-current opacity-30" />
                            {isDragOver ? (
                                <MousePointerSquareDashed className="size-6" />
                            ) : busy ? (
                                <Loader2 className="size-6 animate-spin" />
                            ) : (
                                // eslint-disable-next-line jsx-a11y/alt-text
                                <Image className="size-6" />
                            )}
                        </span>

                        <div className="mt-7 flex flex-col items-center" aria-live="polite">
                            {isUploading ? (
                                <>
                                    <p className="type-title">Uploading…</p>
                                    <Progress
                                        className="mt-5 h-1.5 w-56"
                                        value={uploadProgress}
                                    />
                                    <p className="type-label mt-3 text-ink-soft">
                                        {uploadProgress}% sent
                                    </p>
                                </>
                            ) : isPending ? (
                                <>
                                    <p className="type-title">
                                        Setting up your case
                                    </p>
                                    <p className="mt-3 text-ink-soft">
                                        Redirecting, please wait…
                                    </p>
                                </>
                            ) : isDragOver ? (
                                <>
                                    <p className="type-title text-cobalt">
                                        Drop file to upload
                                    </p>
                                    <p className="mt-3 text-ink-soft">
                                        Let go and we&rsquo;ll put it on a case.
                                    </p>
                                </>
                            ) : (
                                <>
                                    <p className="type-title">
                                        Drop your photo here
                                    </p>
                                    <p className="mt-3 text-ink-soft">
                                        or{" "}
                                        <span className="font-semibold text-cobalt underline underline-offset-4">
                                            click to browse
                                        </span>{" "}
                                        your files
                                    </p>
                                </>
                            )}
                        </div>

                        {busy ? null : (
                            <p className="type-label mt-8 text-ink-soft">
                                PNG, JPG or JPEG · up to 10 MB
                            </p>
                        )}
                    </div>
                );
            }}
        </Dropzone>
    );
};

export default ImageUpload;
