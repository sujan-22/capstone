/** @jest-environment node */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { pool } from "@/lib/database/db";

// --- Mocks (must be declared before importing the route) ---
jest.mock("@/lib/database/db", () => ({
    pool: { connect: jest.fn() },
}));

jest.mock("@/hooks/use-session", () => ({
    getServerSideSession: jest.fn(),
}));
const { getServerSideSession } = jest.requireMock("@/hooks/use-session") as {
    getServerSideSession: jest.Mock<Promise<{ user: { id: string } | null }>>;
};

function setSession(userId?: string) {
    getServerSideSession.mockResolvedValue(
        userId ? { user: { id: userId } } : { user: null }
    );
}

function makeReq(params?: { sort?: string; limit?: number }) {
    const url = new URL("http://localhost/api/get-featured-designs");
    if (params?.sort) url.searchParams.set("sort", params.sort);
    if (typeof params?.limit === "number")
        url.searchParams.set("limit", String(params.limit));
    return new Request(url.toString());
}

describe("GET /api/get-featured-designs", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it("returns rows with default sort (favorites desc) and no limit", async () => {
        setSession("u1");

        const release = jest.fn();
        const rows = [
            {
                id: "d1",
                imgSrc: "/a.jpg",
                croppedImgUrl: null,
                caseName: "Case A",
                modelName: "Phone X",
                color: "Black",
                material: "TPU",
                finish: "Matte",
                price: 12.5,
                isFavorited: true,
                totalFavorites: 8,
            },
        ];
        const query = jest.fn().mockResolvedValue({ rows });
        (pool.connect as jest.Mock).mockResolvedValue({ query, release });

        const { GET } = await import("./route");
        const res = await GET(makeReq());
        expect(res.status).toBe(200);
        await expect(res.json()).resolves.toEqual(rows);

        // SQL assertions
        const [sql, params] = query.mock.calls[0] as [string, any[]];
        expect(sql).toMatch(/ORDER BY\s+cd\.total_favorites\s+DESC/i);
        expect(sql).not.toMatch(/\bLIMIT\b/i);
        expect(params).toEqual(["u1"]);
        expect(release).toHaveBeenCalled();
    });

    it("applies sort=price_low_to_high", async () => {
        setSession("u1");
        const release = jest.fn();
        const query = jest.fn().mockResolvedValue({ rows: [] });
        (pool.connect as jest.Mock).mockResolvedValue({ query, release });

        const { GET } = await import("./route");
        const res = await GET(makeReq({ sort: "price_low_to_high" }));
        expect(res.status).toBe(200);
        await res.json();

        const [sql] = query.mock.calls[0] as [string];
        expect(sql).toMatch(/ORDER BY\s+cm\.price\s+\+\s+cf\.price\s+ASC/i);
        expect(release).toHaveBeenCalled();
    });

    it("applies sort=price_high_to_low", async () => {
        setSession("u1");
        const release = jest.fn();
        const query = jest.fn().mockResolvedValue({ rows: [] });
        (pool.connect as jest.Mock).mockResolvedValue({ query, release });

        const { GET } = await import("./route");
        const res = await GET(makeReq({ sort: "price_high_to_low" }));
        expect(res.status).toBe(200);
        await res.json();

        const [sql] = query.mock.calls[0] as [string];
        expect(sql).toMatch(/ORDER BY\s+cm\.price\s+\+\s+cf\.price\s+DESC/i);
        expect(release).toHaveBeenCalled();
    });

    it("applies limit when provided", async () => {
        setSession("u1");
        const release = jest.fn();
        const query = jest.fn().mockResolvedValue({ rows: [] });
        (pool.connect as jest.Mock).mockResolvedValue({ query, release });

        const { GET } = await import("./route");
        const res = await GET(makeReq({ limit: 5 }));
        expect(res.status).toBe(200);
        await res.json();

        const [sql] = query.mock.calls[0] as [string];
        expect(sql).toMatch(/\bLIMIT\s+5\b/i);
        expect(release).toHaveBeenCalled();
    });

    it("returns 500 on DB connect error", async () => {
        setSession("u1");
        (pool.connect as jest.Mock).mockRejectedValue(new Error("db down"));

        const { GET } = await import("./route");
        const res = await GET(makeReq());
        expect(res.status).toBe(500);
        await expect(res.json()).resolves.toEqual({
            error: "Failed to fetch featured designs",
        });
    });

    it("returns 500 when query throws", async () => {
        setSession("u1");
        const release = jest.fn();
        const query = jest.fn().mockRejectedValue(new Error("bad query"));
        (pool.connect as jest.Mock).mockResolvedValue({ query, release });

        const { GET } = await import("./route");
        const res = await GET(makeReq());
        expect(res.status).toBe(500);
        await expect(res.json()).resolves.toEqual({
            error: "Failed to fetch featured designs",
        });
        expect(release).toHaveBeenCalled();
    });
});
