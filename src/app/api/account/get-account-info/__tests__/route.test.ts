/**
 * @jest-environment node
 */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { makeReq } from "@/lib/test/api";
import { GET } from "../route";
import { pool } from "@/lib/database/db";

jest.mock("@/lib/database/db", () => ({
    pool: { connect: jest.fn() },
}));

describe("GET /api/account/get-account-info", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it("returns 401 when x-user-id header is missing", async () => {
        const res = await GET(makeReq());

        expect(res.status).toBe(401);
        await expect(res.json()).resolves.toEqual({
            error: "Not authenticated",
        });
        expect(pool.connect).not.toHaveBeenCalled();
    });

    it("returns user info when authenticated", async () => {
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

        const req = {
            headers: new Headers({ "x-user-id": "user-123" }),
        } as any;
        const res = await GET(req);

        expect(pool.connect).toHaveBeenCalled();
        expect(mockQuery).toHaveBeenCalledTimes(1);
        expect(mockRelease).toHaveBeenCalled();

        expect(res.status).toBe(200);
        await expect(res.json()).resolves.toEqual({
            user: {
                userId: "user-123",
                totalOrders: 2,
                favoriteDesignsCount: 5,
            },
        });
    });

    it("returns 500 on server error", async () => {
        (pool.connect as jest.Mock).mockRejectedValue(new Error("db down"));

        const req = { headers: new Headers({ "x-user-id": "u1" }) } as any;
        const res = await GET(req);

        expect(res.status).toBe(500);
        await expect(res.json()).resolves.toEqual({
            error: "Internal server error",
        });
    });
});
