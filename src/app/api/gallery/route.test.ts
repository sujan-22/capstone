/** @jest-environment node */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextRequest } from "next/server";
import { GET } from "./route";
import { pool } from "@/lib/database/db";

jest.mock("@/lib/database/db", () => ({
    pool: {
        connect: jest.fn().mockResolvedValue({
            query: jest.fn(),
            release: jest.fn(),
        }),
    },
}));

function makeGet(
    query?: Record<string, string | number | undefined | null>
): NextRequest {
    const qs = new URLSearchParams();
    if (query) {
        Object.entries(query).forEach(([k, v]) => {
            if (v !== undefined && v !== null) qs.append(k, String(v));
        });
    }
    const url =
        qs.toString().length > 0
            ? `http://localhost/api/gallery?${qs.toString()}`
            : "http://localhost/api/gallery";

    return new Request(url, { method: "GET" }) as unknown as NextRequest;
}

describe("GET /api/gallery", () => {
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

        (pool.connect as jest.Mock) = mockConnect;
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("400 for invalid query params (e.g., bad sort)", async () => {
        const res = await GET(makeGet({ sort: "weird" as any }));
        expect(res.status).toBe(400);
        const json = await res.json();
        expect(json).toHaveProperty("error", "Invalid query parameters");
        expect(json).toHaveProperty("details");
        expect(mockConnect).not.toHaveBeenCalled();
    });

    it("sort=popularity_desc orders by usage_count DESC then created_at", async () => {
        const rows = [
            {
                id: "g3",
                url: "/img3.jpg",
                created_at: "2025-09-30T00:00:00.000Z",
                usage_count: 10,
            },
        ];

        mockQuery.mockResolvedValueOnce({
            rows,
            rowCount: rows.length,
        });

        const res = await GET(
            makeGet({ sort: "popularity_desc", limit: 5, offset: 15 })
        );
        const [sql, params] = mockQuery.mock.calls[0];
        expect(sql).toMatch(
            /ORDER BY\s+COALESCE\(cd\.usage_count,\s*0\)\s+DESC,\s+gi\.created_at\s+DESC/i
        );
        expect(params).toEqual([5, 15]);

        expect(res.status).toBe(200);
        await expect(res.json()).resolves.toEqual({
            images: rows,
            pagination: { limit: 5, offset: 15, count: 1 },
        });
        expect(mockRelease).toHaveBeenCalled();
    });

    it("sort=popularity_asc orders by usage_count ASC then created_at", async () => {
        const rows = [
            {
                id: "g4",
                url: "/img4.jpg",
                created_at: "2025-09-29T00:00:00.000Z",
                usage_count: 0,
            },
        ];

        mockQuery.mockResolvedValueOnce({
            rows,
            rowCount: rows.length,
        });

        const res = await GET(
            makeGet({ sort: "popularity_asc", limit: 3, offset: 6 })
        );
        const [sql, params] = mockQuery.mock.calls[0];
        expect(sql).toMatch(
            /ORDER BY\s+COALESCE\(cd\.usage_count,\s*0\)\s+ASC,\s+gi\.created_at\s+DESC/i
        );
        expect(params).toEqual([3, 6]);

        expect(res.status).toBe(200);
        await expect(res.json()).resolves.toEqual({
            images: rows,
            pagination: { limit: 3, offset: 6, count: 1 },
        });
        expect(mockRelease).toHaveBeenCalled();
    });
});
