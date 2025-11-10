/* eslint-disable @typescript-eslint/no-explicit-any */
import { renderHook, act, waitFor } from "@testing-library/react";
import { useBuyNow } from "../use-buy-now";

const push = jest.fn();
jest.mock("next/navigation", () => ({
    useRouter: () => ({ push }),
}));

const toast = jest.fn();
jest.mock("../../hooks/use-toast", () => ({
    useToast: () => ({ toast }),
}));

const post = jest.fn();
jest.mock("@/lib/http", () => ({
    http: { post: (...args: any[]) => post(...args) },
}));

describe("useBuyNow", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("navigates to customize on success", async () => {
        post.mockResolvedValue({
            data: { success: true, newDesignId: "d-123" },
        });
        const { result } = renderHook(() => useBuyNow({ designId: "abc" }));
        await act(async () => {
            await result.current.buyNow();
        });
        expect(post).toHaveBeenCalledWith("/api/buy-now/abc");
        expect(push).toHaveBeenCalledWith("/configure/customize/d-123");
        expect(result.current.loading).toBe(false);
    });

    it("shows toast on handled error response", async () => {
        post.mockResolvedValue({ data: { success: false, error: "nope" } });
        const { result } = renderHook(() => useBuyNow({ designId: "abc" }));
        await act(async () => {
            await result.current.buyNow();
        });
        expect(push).not.toHaveBeenCalled();
        expect(toast).toHaveBeenCalledWith(
            expect.objectContaining({
                title: "Something went wrong!",
                description: "nope",
                variant: "destructive",
            })
        );
        expect(result.current.loading).toBe(false);
    });

    it("shows toast on network error", async () => {
        post.mockRejectedValue(new Error("down"));
        const spy = jest.spyOn(console, "error").mockImplementation(() => {});
        const { result } = renderHook(() => useBuyNow({ designId: "abc" }));
        await act(async () => {
            await result.current.buyNow();
        });
        expect(push).not.toHaveBeenCalled();
        expect(toast).toHaveBeenCalledWith(
            expect.objectContaining({
                title: "Network error",
                description: expect.stringContaining(
                    "Unable to process your request"
                ),
                variant: "destructive",
            })
        );
        expect(result.current.loading).toBe(false);
        spy.mockRestore();
    });

    it("prevents reentry when already loading", async () => {
        post.mockImplementation(
            () =>
                new Promise((resolve) =>
                    setTimeout(
                        () =>
                            resolve({
                                data: { success: true, newDesignId: "d-1" },
                            }),
                        25
                    )
                )
        );
        const { result } = renderHook(() => useBuyNow({ designId: "abc" }));

        let p1: Promise<any>;
        await act(async () => {
            p1 = result.current.buyNow();
        });

        await waitFor(() => {
            expect(result.current.loading).toBe(true);
        });

        let p2: Promise<any>;
        await act(async () => {
            p2 = result.current.buyNow();
        });

        await act(async () => {
            await p1!;
            await p2!;
        });

        expect(post).toHaveBeenCalledTimes(1);
    });
});
