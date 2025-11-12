/**
 * @jest-environment node
 */

import { pool } from "@/lib/database/db";

jest.mock("@/lib/database/db", () => ({
    pool: { connect: jest.fn() },
}));

// Mock session BEFORE importing route (prevents better-auth transitively)
jest.mock("@/hooks/use-session", () => ({
    getServerSideSession: jest.fn(),
}));

// Use real cursor + limit utilities
const utils = jest.requireActual("@/lib/utils") as {
    encodeCursor: (createdAtISO: string, id: string) => string;
    decodeCursor: (cursor: string | null) => {
        createdAt?: string;
        id?: string;
    };
    parseLimit: (v: string | null) => number;
};

const { getServerSideSession } = jest.requireMock("@/hooks/use-session") as {
    getServerSideSession: jest.Mock;
};

function setSession(role?: "admin" | "user" | null) {
    if (!role) {
        getServerSideSession.mockResolvedValue({ user: null });
    } else {
        getServerSideSession.mockResolvedValue({
            user: { id: "u1", role },
        });
    }
}

function makeReq(
    params: Record<string, string | number | null | undefined> = {}
) {
    const url = new URL("http://localhost/api/admin/images/get-all");
    Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
    });
    return new Request(url.toString()) as Request;
}

describe("GET /admin/images/get-all", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it("returns 403 when not authenticated", async () => {
        setSession(null); // no user
        const { GET } = await import("./route");

        const res = await GET(makeReq());
        expect(res.status).toBe(403);
        await expect(res.json()).resolves.toEqual({ error: "Forbidden" });
        expect(pool.connect).not.toHaveBeenCalled();
    });

    it("returns 403 when authenticated but not admin", async () => {
        setSession("user");
        const { GET } = await import("./route");

        const res = await GET(makeReq());
        expect(res.status).toBe(403);
        await expect(res.json()).resolves.toEqual({ error: "Forbidden" });
        expect(pool.connect).not.toHaveBeenCalled();
    });

    it("returns images (no pagination needed) for admin", async () => {
        setSession("admin");

        const release = jest.fn();
        const rows = [
            {
                id: "g2",
                url: "https://cdn/img2.jpg",
                active: true,
                created_at: "2024-02-02T10:00:00.000Z",
                created_at_iso: "2024-02-02T10:00:00.000000Z",
                usage_count: 3,
                last_used_at: "2024-02-03T11:22:33.000Z",
            },
            {
                id: "g1",
                url: "https://cdn/img1.jpg",
                active: false,
                created_at: "2024-02-01T10:00:00.000Z",
                created_at_iso: "2024-02-01T10:00:00.000000Z",
                usage_count: 0,
                last_used_at: null,
            },
        ];
        const query = jest.fn().mockResolvedValue({ rows });
        (pool.connect as jest.Mock).mockResolvedValue({ query, release });

        const { GET } = await import("./route");

        const res = await GET(makeReq({ limit: 25 }));
        expect(pool.connect).toHaveBeenCalled();
        expect(query).toHaveBeenCalledTimes(1);
        expect(release).toHaveBeenCalled();
        expect(res.status).toBe(200);

        await expect(res.json()).resolves.toEqual({
            images: [
                {
                    id: "g2",
                    url: "https://cdn/img2.jpg",
                    active: true,
                    usageCount: 3,
                    createdAt: "2024-02-02T10:00:00.000000Z",
                    lastUsedAt: "2024-02-03T11:22:33.000Z",
                },
                {
                    id: "g1",
                    url: "https://cdn/img1.jpg",
                    active: false,
                    usageCount: 0,
                    createdAt: "2024-02-01T10:00:00.000000Z",
                    lastUsedAt: null,
                },
            ],
            nextCursor: null,
        });
    });

    it("paginates and returns nextCursor when > limit", async () => {
        setSession("admin");

        const release = jest.fn();
        // Provide 2 rows while limit=1, route fetches limit+1 (2)
        const rows = [
            {
                id: "g3",
                url: "https://cdn/img3.jpg",
                active: true,
                created_at: "2024-03-03T10:00:00.000Z",
                created_at_iso: "2024-03-03T10:00:00.000000Z",
                usage_count: 10,
                last_used_at: "2024-03-04T09:00:00.000Z",
            },
            {
                id: "g2",
                url: "https://cdn/img2.jpg",
                active: true,
                created_at: "2024-03-02T10:00:00.000Z",
                created_at_iso: "2024-03-02T10:00:00.000000Z",
                usage_count: 1,
                last_used_at: null,
            },
        ];
        const query = jest.fn().mockResolvedValue({ rows });
        (pool.connect as jest.Mock).mockResolvedValue({ query, release });

        const { GET } = await import("./route");
        const res = await GET(makeReq({ limit: 1 }));
        expect(res.status).toBe(200);
        const body = await res.json();

        expect(body.images).toEqual([
            {
                id: "g3",
                url: "https://cdn/img3.jpg",
                active: true,
                usageCount: 10,
                createdAt: "2024-03-03T10:00:00.000000Z",
                lastUsedAt: "2024-03-04T09:00:00.000Z",
            },
        ]);

        // nextCursor should point to last returned row (g3)
        const decoded = utils.decodeCursor(body.nextCursor);
        expect(decoded.createdAt).toBe("2024-03-03T10:00:00.000000Z");
        expect(decoded.id).toBe("g3");
    });

    it("applies cursor filtering when cursor is provided", async () => {
        setSession("admin");

        const release = jest.fn();
        const query = jest.fn().mockResolvedValue({ rows: [] });
        (pool.connect as jest.Mock).mockResolvedValue({ query, release });

        const cISO = "2024-04-01T12:34:56.000000Z";
        const cId = "g9";
        const cursor = utils.encodeCursor(cISO, cId);

        const { GET } = await import("./route");
        const res = await GET(makeReq({ cursor, limit: 10 }));
        expect(res.status).toBe(200);
        await res.json();

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const [_sql, params] = query.mock.calls[0] as [string, unknown[]];
        // Expect params to be [cAt, cId, limit+1]
        expect(params[0]).toBe(cISO);
        expect(params[1]).toBe(cId);
        expect(params[2]).toBe(11);
    });

    it("returns 500 on DB error", async () => {
        setSession("admin");
        (pool.connect as jest.Mock).mockRejectedValue(new Error("db down"));

        const { GET } = await import("./route");
        const res = await GET(makeReq());

        expect(res.status).toBe(500);
        await expect(res.json()).resolves.toEqual({
            error: "Failed to load images",
        });
    });
});
