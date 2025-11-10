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

describe("GET /api/account/get-account-info", () => {
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

    it("returns user info when authenticated", async () => {
        setSession("user-123");

        const mockRelease = jest.fn();
        const mockQuery = jest.fn().mockResolvedValue({
            rows: [
                {
                    user_id: "user-123",
                    total_orders: "2",
                    favorite_designs_count: "5",
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
            user: {
                totalOrders: 2,
                favoriteDesignsCount: 5,
            },
        });
    });

    it("returns 500 on server error", async () => {
        setSession("u1");
        (pool.connect as jest.Mock).mockRejectedValue(new Error("db down"));

        const { GET } = await import("../route");
        const res = await GET();

        expect(res.status).toBe(500);
        await expect(res.json()).resolves.toEqual({
            error: "Internal server error",
        });
    });
});
