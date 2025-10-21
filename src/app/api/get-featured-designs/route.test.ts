/** @jest-environment node */

import { NextRequest } from "next/server";
import { GET } from "./route";
import { pool } from "@/lib/database/db";

jest.mock("@/lib/database/db", () => ({
    pool: { connect: jest.fn() },
}));

function makeGet(
    query?: Record<string, string | number | undefined | null>,
    headers?: Record<string, string>
): NextRequest {
    const qs = new URLSearchParams();
    if (query) {
        Object.entries(query).forEach(([k, v]) => {
            if (v !== undefined && v !== null) qs.append(k, String(v));
        });
    }
    const url =
        qs.toString().length > 0
            ? `http://localhost/api/get-feature-designs?${qs.toString()}`
            : "http://localhost/api/get-feature-designs";

    const req = new Request(url, {
        method: "GET",
        headers: {
            ...(headers || {}),
        },
    });

    return req as unknown as NextRequest;
}

describe("GET /api/get-feature-designs", () => {
    let mockQuery: jest.Mock;
    let mockRelease: jest.Mock;
    let mockConnect: jest.Mock;

    beforeEach(() => {
        mockQuery = jest.fn();
        mockRelease = jest.fn();
        mockConnect = jest.fn().mockResolvedValue({
            query: mockQuery,
            release: mockRelease,
        });
        (pool.connect as unknown as jest.Mock) = mockConnect;
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("defaults to ORDER BY total_favorites DESC and no LIMIT when params omitted", async () => {
        const rows = [
            {
                id: "d1",
                imgSrc: "/img1.jpg",
                croppedImgUrl: null,
                caseName: "Case A",
                modelName: "Model X",
                color: "Black",
                material: "Matte",
                finish: "Soft",
                price: 29.99,
                isFavorited: false,
                totalFavorites: 7,
            },
        ];
        mockQuery.mockResolvedValueOnce({ rows });

        const res = await GET(makeGet(undefined, { "x-user-id": "user-123" }));

        expect(mockConnect).toHaveBeenCalledTimes(1);
        expect(mockQuery).toHaveBeenCalledTimes(1);

        const [sql, params] = mockQuery.mock.calls[0];

        // Assert default ORDER BY
        expect(String(sql)).toMatch(/ORDER BY\s+cd\.total_favorites\s+DESC/i);
        // Assert no LIMIT clause appended
        expect(String(sql)).not.toMatch(/\sLIMIT\s+\d+/i);

        // Assert parameterized query uses userId at $1
        expect(params).toEqual(["user-123"]);

        expect(res.status).toBe(200);
        await expect(res.json()).resolves.toEqual(rows);
        expect(mockRelease).toHaveBeenCalled();
    });

    it("sort=price_low_to_high uses ORDER BY cm.price + cf.price ASC", async () => {
        mockQuery.mockResolvedValueOnce({ rows: [] });

        const res = await GET(
            makeGet({ sort: "price_low_to_high" }, { "x-user-id": "u1" })
        );

        const [sql, params] = mockQuery.mock.calls[0];
        expect(String(sql)).toMatch(
            /ORDER BY\s+cm\.price\s*\+\s*cf\.price\s+ASC/i
        );
        expect(params).toEqual(["u1"]);

        expect(res.status).toBe(200);
        await expect(res.json()).resolves.toEqual([]);
        expect(mockRelease).toHaveBeenCalled();
    });

    it("sort=price_high_to_low uses ORDER BY cm.price + cf.price DESC", async () => {
        mockQuery.mockResolvedValueOnce({ rows: [] });

        const res = await GET(
            makeGet({ sort: "price_high_to_low" }, { "x-user-id": "u2" })
        );

        const [sql, params] = mockQuery.mock.calls[0];
        expect(String(sql)).toMatch(
            /ORDER BY\s+cm\.price\s*\+\s*cf\.price\s+DESC/i
        );
        expect(params).toEqual(["u2"]);

        expect(res.status).toBe(200);
        await expect(res.json()).resolves.toEqual([]);
        expect(mockRelease).toHaveBeenCalled();
    });

    it("appends LIMIT when limit is provided and > 0", async () => {
        mockQuery.mockResolvedValueOnce({ rows: new Array(3).fill({}) });

        const res = await GET(makeGet({ limit: 3 }, { "x-user-id": "u3" }));

        const [sql] = mockQuery.mock.calls[0];
        // LIMIT is string-concatenated in the route, so just assert presence of LIMIT 3
        expect(String(sql)).toMatch(/\sLIMIT\s+3\b/i);

        expect(res.status).toBe(200);
        await expect(res.json()).resolves.toHaveLength(3);
        expect(mockRelease).toHaveBeenCalled();
    });

    it("does not append LIMIT when limit=0 (route only appends when truthy)", async () => {
        mockQuery.mockResolvedValueOnce({ rows: [] });

        const res = await GET(makeGet({ limit: 0 }, { "x-user-id": "u4" }));

        const [sql] = mockQuery.mock.calls[0];
        expect(String(sql)).not.toMatch(/\sLIMIT\s+0\b/i);

        expect(res.status).toBe(200);
        await expect(res.json()).resolves.toEqual([]);
        expect(mockRelease).toHaveBeenCalled();
    });

    it("uses empty string for userId when header missing (still binds parameter)", async () => {
        mockQuery.mockResolvedValueOnce({ rows: [] });

        const res = await GET(makeGet({ limit: 5 }));
        const [, params] = mockQuery.mock.calls[0];

        // Route defaults userId = ""
        expect(params).toEqual([""]);
        expect(res.status).toBe(200);
        await expect(res.json()).resolves.toEqual([]);
        expect(mockRelease).toHaveBeenCalled();
    });

    it("returns 500 on DB error and releases client", async () => {
        mockQuery.mockRejectedValueOnce(new Error("db down"));

        const res = await GET(makeGet({ sort: "none" }, { "x-user-id": "u5" }));

        expect(res.status).toBe(500);
        await expect(res.json()).resolves.toEqual({
            error: "Failed to fetch featured designs",
        });
        expect(mockRelease).toHaveBeenCalled();
    });
});
