/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ImageGalleryComponent from "./image-gallery-component";

const push = jest.fn();
const useRouter = () => ({ push });

const mockSearchParams = { toString: () => "" };
const useSearchParams = () => mockSearchParams;
const usePathname = () => "/";

jest.mock("next/navigation", () => ({
    useRouter: jest.fn(() => useRouter()),
    useSearchParams: jest.fn(() => useSearchParams()),
    usePathname: jest.fn(() => usePathname()),
}));

const toast = jest.fn();
jest.mock("next/link", () => ({
    __esModule: true,
    default: ({ href, children, ...rest }: any) => (
        <a href={href} {...rest}>
            {children}
        </a>
    ),
}));

jest.mock("@/hooks/use-toast", () => ({
    useToast: () => ({ toast }),
}));

const getImageGallery = jest.fn();
const createDesignFromGalleryImage = jest.fn();
jest.mock("@/app/(site)/gallery-images/actions/actions", () => ({
    getImageGallery: jest.fn((...args) => getImageGallery(...args)),
    createDesignFromGalleryImage: jest.fn((...args) =>
        createDesignFromGalleryImage(...args)
    ),
}));

jest.mock("@/app/(site)/gallery-images/components/image", () => {
    return function MockImage(props: {
        img: { id: string; url: string };
        handleUseImage: (id: string, url: string) => void;
        isPending?: boolean;
        anyPending?: boolean;
    }) {
        return (
            <button
                onClick={() =>
                    props.handleUseImage(props.img.id, props.img.url)
                }
                aria-label={`use-${props.img.id}`}
            >
                Use {props.img.id}
            </button>
        );
    };
});

jest.mock("../utilities/max-width-wrapper", () => {
    return function MockMW({ children }: { children: React.ReactNode }) {
        return <div data-testid="mw">{children}</div>;
    };
});

jest.mock("@/components/ui/skeleton", () => ({
    Skeleton: jest.fn((props) => {
        return <div data-testid={props["data-testid"] || "skeleton"} />;
    }),
}));

let mockUseQueryReturn: any = { data: undefined, isLoading: false };

type MUOptions = {
    mutationFn: (v: any) => Promise<any> | any;
    onSuccess?: (res: any) => void;
    onError?: (err: any) => void;
};
let mutateBehavior: "success" | "error" = "success";
let mutateError: any = new Error("boom");

jest.mock("@tanstack/react-query", () => ({
    useQuery: jest.fn(() => mockUseQueryReturn),
    useMutation: jest.fn((options: MUOptions) => ({
        isPending: false,
        mutate: async (vars: any) => {
            try {
                const res = await options.mutationFn(vars);
                if (mutateBehavior === "success") {
                    options.onSuccess && options.onSuccess(res);
                } else {
                    options.onError && options.onError(mutateError);
                }
            } catch (e) {
                options.onError && options.onError(e);
            }
        },
    })),
}));

describe("<ImageGalleryComponent />", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockUseQueryReturn = { data: undefined, isLoading: false };
        mutateBehavior = "success";
        mutateError = new Error("boom");
        (getImageGallery as jest.Mock).mockResolvedValue({ images: [[]] });
    });

    it("shows 8 skeletons while loading", () => {
        mockUseQueryReturn = { isLoading: true };
        render(<ImageGalleryComponent userId={"user-1"} />);
        expect(screen.getAllByTestId("skeleton")).toHaveLength(8);
    });

    it("renders images from the query result", () => {
        mockUseQueryReturn = {
            isLoading: false,
            data: {
                images: [
                    [
                        { id: "a", url: "/a.jpg" },
                        { id: "b", url: "/b.jpg" },
                    ],
                ],
            },
        };
        render(<ImageGalleryComponent userId={"user-1"} />);
        expect(
            screen.getByRole("button", { name: /use-a/i })
        ).toBeInTheDocument();
        expect(
            screen.getByRole("button", { name: /use-b/i })
        ).toBeInTheDocument();
    });

    it("redirects to sign-in with redirectTo when user is not logged in", async () => {
        mockUseQueryReturn = {
            isLoading: false,
            data: { images: [[{ id: "a", url: "/a.jpg" }]] },
        };
        const user = userEvent.setup();
        render(<ImageGalleryComponent userId={null} />);
        await user.click(screen.getByRole("button", { name: /use-a/i }));
        expect(push).toHaveBeenCalledWith("/sign-in?redirectTo=%2F");
    });

    it("creates a design and navigates on success", async () => {
        mockUseQueryReturn = {
            isLoading: false,
            data: { images: [[{ id: "a", url: "/a.jpg" }]] },
        };
        (createDesignFromGalleryImage as jest.Mock).mockResolvedValue({
            success: true,
            designId: "d-123",
        });
        const user = userEvent.setup();
        render(<ImageGalleryComponent userId={"user-1"} />);
        await user.click(screen.getByRole("button", { name: /use-a/i }));
        expect(createDesignFromGalleryImage).toHaveBeenCalledWith(
            "a",
            "/a.jpg"
        );
        expect(push).toHaveBeenCalledWith("/configure/customize/d-123");
    });

    it("shows toast on creation failure (handled success=false)", async () => {
        mockUseQueryReturn = {
            isLoading: false,
            data: { images: [[{ id: "a", url: "/a.jpg" }]] },
        };
        (createDesignFromGalleryImage as jest.Mock).mockResolvedValue({
            success: false,
            error: "nope",
        });
        const user = userEvent.setup();
        render(<ImageGalleryComponent userId={"user-1"} />);
        await user.click(screen.getByRole("button", { name: /use-a/i }));
        expect(toast).toHaveBeenCalledWith(
            expect.objectContaining({
                title: "Failed to create design",
                description: "nope",
                variant: "destructive",
            })
        );
    });

    it("shows toast on mutation error", async () => {
        mockUseQueryReturn = {
            isLoading: false,
            data: { images: [[{ id: "a", url: "/a.jpg" }]] },
        };
        (createDesignFromGalleryImage as jest.Mock).mockImplementation(() => {
            throw new Error("network down");
        });
        const user = userEvent.setup();
        render(<ImageGalleryComponent userId={"user-1"} />);
        await user.click(screen.getByRole("button", { name: /use-a/i }));
        expect(toast).toHaveBeenCalledWith(
            expect.objectContaining({
                title: "Failed to create design",
                description: "network down",
                variant: "destructive",
            })
        );
    });

    it("links to the full gallery page", () => {
        mockUseQueryReturn = {
            isLoading: false,
            data: { images: [[{ id: "a", url: "/a.jpg" }]] },
        };
        render(<ImageGalleryComponent userId={"user-1"} />);
        expect(
            screen.getByRole("link", { name: /Browse the full gallery/i })
        ).toHaveAttribute("href", "/gallery-images");
    });
});
