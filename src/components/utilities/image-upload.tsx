'use client";';

import { Image, Loader2, MousePointerSquareDashed } from "lucide-react";
import { SetStateAction } from "react";
import Dropzone, { FileRejection } from "react-dropzone";
import { Progress } from "../ui/progress";

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
        >
            {({ getRootProps, getInputProps }) => {
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
    );
};

export default ImageUpload;
