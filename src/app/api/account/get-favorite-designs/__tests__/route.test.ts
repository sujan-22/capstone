/**
 * @jest-environment node
 */

import { pool } from "@/lib/database/db";

jest.mock("@/lib/database/db", () => ({
    pool: { connect: jest.fn() },
}));

jest.mock("@/hooks/use-session", () => ({
    getServerSideSession: jest.fn(),
}));

const { getServerSideSession } = jest.requireMock("@/hooks/use-session") as {
    getServerSideSession: jest.Mock;
};

function setSession(userId?: string) {
    getServerSideSession.mockResolvedValue({
        user: userId ? { id: userId } : null,
    });
}

describe("GET /api/account/get-favorite-designs", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it("returns 401 when not authenticated", async () => {
        setSession(undefined);
        const { GET } = await import("../route");
        const res = await GET();

        expect(res.status).toBe(401);
        await expect(res.json()).resolves.toEqual({
            error: "Not authenticated",
        });
        expect(pool.connect).not.toHaveBeenCalled();
    });

    it("returns favorite designs for authenticated user", async () => {
        setSession("user-123");

        const mockRelease = jest.fn();
        const mockQuery = jest.fn().mockResolvedValue({
            rows: [
                {
                    id: "d1",
                    imgSrc: "/img1.jpg",
                    croppedImgUrl: "/crop1.jpg",
                    caseName: "Nebula",
                    modelName: "iPhone 15 Pro",
                    color: "Black",
                    material: "Polycarbonate",
                    finish: "Matte",
                    price: "59.99",
                    favorited_by_user_ids: ["user-123", "user-9"],
                },
                {
                    id: "d2",
                    imgSrc: "/img2.jpg",
                    croppedImgUrl: "/crop2.jpg",
                    caseName: "Aurora",
                    modelName: "Pixel 8",
                    color: "White",
                    material: "TPU",
                    finish: "Glossy",
                    price: 42,
                    favorited_by_user_ids: ["user-123"],
                },
            ],
        });

        (pool.connect as jest.Mock).mockResolvedValue({
            query: mockQuery,
            release: mockRelease,
        });

        const { GET } = await import("../route");
        const res = await GET();

        expect(pool.connect).toHaveBeenCalled();
        expect(mockQuery).toHaveBeenCalledTimes(1);
        expect(mockRelease).toHaveBeenCalled();

        expect(res.status).toBe(200);
        await expect(res.json()).resolves.toEqual({
            favoriteDesigns: [
                {
                    id: "d1",
                    imgSrc: "/img1.jpg",
                    croppedImgUrl: "/crop1.jpg",
                    caseName: "Nebula",
                    modelName: "iPhone 15 Pro",
                    color: "Black",
                    material: "Polycarbonate",
                    finish: "Matte",
                    price: 59.99,
                    isFavorited: true,
                    totalFavorites: 2,
                },
                {
                    id: "d2",
                    imgSrc: "/img2.jpg",
                    croppedImgUrl: "/crop2.jpg",
                    caseName: "Aurora",
                    modelName: "Pixel 8",
                    color: "White",
                    material: "TPU",
                    finish: "Glossy",
                    price: 42,
                    isFavorited: true,
                    totalFavorites: 1,
                },
            ],
        });
    });

    it("returns empty list when no favorites", async () => {
        setSession("user-123");

        const mockRelease = jest.fn();
        const mockQuery = jest.fn().mockResolvedValue({ rows: [] });

        (pool.connect as jest.Mock).mockResolvedValue({
            query: mockQuery,
            release: mockRelease,
        });

        const { GET } = await import("../route");
        const res = await GET();

        expect(res.status).toBe(200);
        await expect(res.json()).resolves.toEqual({ favoriteDesigns: [] });
    });

    it("returns 500 on server error", async () => {
        setSession("user-123");
        (pool.connect as jest.Mock).mockRejectedValue(new Error("db down"));

        const { GET } = await import("../route");
        const res = await GET();

        expect(res.status).toBe(500);
        await expect(res.json()).resolves.toEqual({
            error: "Internal server error",
        });
    });
});
