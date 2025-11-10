/* eslint-disable @typescript-eslint/no-explicit-any */
import { renderHook, act } from "@testing-library/react";
import { useFavorite } from "../use-favorite";

const invalidateQueries = jest.fn();
jest.mock("@tanstack/react-query", () => ({
    __esModule: true,
    useQueryClient: () => ({ invalidateQueries }),
}));

const toast = jest.fn();
jest.mock("../../hooks/use-toast", () => ({
    useToast: () => ({ toast }),
}));

jest.mock("axios", () => ({
    __esModule: true,
    default: { post: jest.fn() },
}));

describe("useFavorite", () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const axios = require("axios").default as { post: jest.Mock };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("optimistically toggles and invalidates on success (add)", async () => {
        axios.post.mockResolvedValue({ data: { success: true } });
        const { result } = renderHook(() =>
            useFavorite({ caseDesignId: "d1", initialFavorited: false })
        );
        await act(async () => {
            await result.current.toggleFavorite();
        });
        expect(axios.post).toHaveBeenCalledWith(
            "/api/favorite",
            { caseDesignId: "d1" },
            { headers: { "Content-Type": "application/json" } }
        );
        expect(result.current.isFavorited).toBe(true);
        expect(invalidateQueries).toHaveBeenCalledWith({
            queryKey: ["get-favorite-designs"],
        });
        expect(toast).toHaveBeenCalledWith(
            expect.objectContaining({
                title: "Added to favorites!",
                variant: "default",
            })
        );
        expect(result.current.loading).toBe(false);
    });

    it("optimistically toggles and invalidates on success (remove)", async () => {
        axios.post.mockResolvedValue({ data: { success: true } });
        const { result } = renderHook(() =>
            useFavorite({ caseDesignId: "d2", initialFavorited: true })
        );
        await act(async () => {
            await result.current.toggleFavorite();
        });
        expect(result.current.isFavorited).toBe(false);
        expect(invalidateQueries).toHaveBeenCalled();
        expect(toast).toHaveBeenCalledWith(
            expect.objectContaining({
                title: "Removed from favorites!",
                variant: "default",
            })
        );
    });

    it("rolls back on handled error response", async () => {
        axios.post.mockResolvedValue({
            data: { success: false, error: "nope" },
        });
        const { result } = renderHook(() =>
            useFavorite({ caseDesignId: "d3", initialFavorited: false })
        );
        await act(async () => {
            await result.current.toggleFavorite();
        });
        expect(result.current.isFavorited).toBe(false);
        expect(toast).toHaveBeenCalledWith(
            expect.objectContaining({
                title: "Oops!",
                description: "nope",
                variant: "destructive",
            })
        );
        expect(invalidateQueries).not.toHaveBeenCalled();
    });

    it("rolls back on network error", async () => {
        axios.post.mockRejectedValue(new Error("down"));
        const { result } = renderHook(() =>
            useFavorite({ caseDesignId: "d4", initialFavorited: true })
        );
        await act(async () => {
            await result.current.toggleFavorite();
        });
        expect(result.current.isFavorited).toBe(true);
        expect(toast).toHaveBeenCalledWith(
            expect.objectContaining({
                title: "Network error",
                variant: "destructive",
            })
        );
        expect(invalidateQueries).not.toHaveBeenCalled();
    });

    it("prevents reentry while loading", async () => {
        jest.useFakeTimers();
        axios.post.mockImplementation(
            () =>
                new Promise((resolve) =>
                    setTimeout(() => resolve({ data: { success: true } }), 1000)
                )
        );
        const { result } = renderHook(() =>
            useFavorite({ caseDesignId: "d5", initialFavorited: false })
        );

        let p1: Promise<any>;
        await act(async () => {
            p1 = result.current.toggleFavorite();
        });
        expect(result.current.loading).toBe(true);

        await act(async () => {
            result.current.toggleFavorite();
        });
        expect(axios.post).toHaveBeenCalledTimes(1);

        await act(async () => {
            jest.advanceTimersByTime(1000);
            await p1!;
        });
        jest.useRealTimers();
    });
});
