/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ImageUpload from "../image-upload";

let lastDZProps: any = null;

jest.mock("react-dropzone", () => {
    function MockDropzone(props: any) {
        lastDZProps = props;
        const getRootProps = () => ({
            "data-testid": "drop-root",
            onDragEnter: () => props.onDragEnter && props.onDragEnter({}),
            onDragLeave: () => props.onDragLeave && props.onDragLeave({}),
        });
        const getInputProps = () => ({ "data-testid": "drop-input" });
        return props.children({ getRootProps, getInputProps });
    }
    return { __esModule: true, default: MockDropzone };
});

jest.mock("lucide-react", () => ({
    Image: (p: any) => <svg data-testid="icon-image" {...p} />,
    Loader2: (p: any) => <svg data-testid="icon-loader" {...p} />,
    MousePointerSquareDashed: (p: any) => (
        <svg data-testid="icon-pointer" {...p} />
    ),
}));

jest.mock("../../ui/progress", () => ({
    Progress: (props: any) => (
        <div data-testid="progress" data-value={props.value} />
    ),
}));

const baseProps = () => ({
    onDropAccepted: jest.fn(),
    onDropRejected: jest.fn(),
    setIsDragOver: jest.fn(),
    isDragOver: false,
    isUploading: false,
    isPending: false,
    uploadProgress: 0,
});

describe("<ImageUpload />", () => {
    beforeEach(() => {
        lastDZProps = null;
    });

    it("renders default idle state", () => {
        render(<ImageUpload {...baseProps()} />);

        expect(screen.getByText(/Drop your photo here/i)).toBeInTheDocument();
        expect(screen.getByText(/click to browse/i)).toBeInTheDocument();
        expect(screen.getByTestId("icon-image")).toBeInTheDocument();
        expect(screen.getByText(/PNG, JPG or JPEG · up to 10 MB/i)).toBeInTheDocument();
    });

    it("shows drag-over state and toggles via Dropzone events", async () => {
        const props = baseProps();
        render(<ImageUpload {...props} isDragOver={false} />);

        expect(lastDZProps).toBeTruthy();
        lastDZProps.onDragEnter({});
        expect(props.setIsDragOver).toHaveBeenCalledWith(true);

        lastDZProps.onDragLeave({});
        expect(props.setIsDragOver).toHaveBeenCalledWith(false);
    });

    it("renders drag-over UI when isDragOver is true", () => {
        render(<ImageUpload {...baseProps()} isDragOver />);
        expect(screen.getByTestId("icon-pointer")).toBeInTheDocument();
        expect(screen.getByText(/Drop file to upload/i)).toBeInTheDocument();
    });

    it("renders uploading UI with progress", () => {
        render(
            <ImageUpload {...baseProps()} isUploading uploadProgress={57} />
        );
        expect(screen.getByTestId("icon-loader")).toBeInTheDocument();
        expect(screen.getByText(/Uploading/i)).toBeInTheDocument();
        expect(screen.getByTestId("progress")).toHaveAttribute(
            "data-value",
            "57"
        );
        expect(screen.getByText(/57% sent/i)).toBeInTheDocument();
    });

    it("renders pending UI and hides filetype hint", () => {
        render(<ImageUpload {...baseProps()} isPending />);
        expect(
            screen.getByText(/Redirecting, please wait/i)
        ).toBeInTheDocument();
        expect(screen.queryByText(/PNG, JPG or JPEG/i)).toBeNull();
    });

    it("invokes onDropAccepted with files", async () => {
        const props = baseProps();
        render(<ImageUpload {...props} />);
        const files = [new File(["xx"], "a.jpg", { type: "image/jpeg" })];
        await userEvent.click(screen.getByTestId("drop-root"));
        await lastDZProps.onDropAccepted(files);
        expect(props.onDropAccepted).toHaveBeenCalledWith(files);
    });

    it("invokes onDropRejected with file rejections", async () => {
        const props = baseProps();
        render(<ImageUpload {...props} />);
        const rejects = [{ file: new File(["x"], "bad.txt"), errors: [] }];
        await lastDZProps.onDropRejected(rejects);
        expect(props.onDropRejected).toHaveBeenCalledWith(rejects);
    });

    it("disables the dropzone while an upload is in flight", () => {
        render(<ImageUpload {...baseProps()} isUploading />);
        expect(lastDZProps.disabled).toBe(true);
    });

    it("passes maxSize and accept to Dropzone", () => {
        render(<ImageUpload {...baseProps()} />);
        expect(lastDZProps.maxSize).toBe(10 * 1024 * 1024);
        expect(Object.keys(lastDZProps.accept)).toEqual(
            expect.arrayContaining(["image/jpg", "image/png", "image/jpeg"])
        );
    });
});
