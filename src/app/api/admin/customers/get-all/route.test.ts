/**
 * @jest-environment node
 */

import { pool } from "@/lib/database/db";

jest.mock("@/lib/database/db", () => ({
    pool: { connect: jest.fn() },
}));

// Mock auth BEFORE importing route (avoid better-auth loading)
jest.mock("../../../../../../auth", () => ({
    auth: { api: { getSession: jest.fn() } },
}));

// Use real encode/decode/parseLimit utilities
const utils = jest.requireActual("@/lib/utils") as {
    encodeCursor: (createdAtISO: string, id: string) => string;
    decodeCursor: (cursor: string | null) => {
        createdAt?: string;
        id?: string;
    };
};

const { auth } = jest.requireMock("../../../../../../auth") as {
    auth: { api: { getSession: jest.Mock } };
};

function setSession(role?: "admin" | "user") {
    if (!role) {
        auth.api.getSession.mockResolvedValue(null);
    } else {
        auth.api.getSession.mockResolvedValue({ user: { id: "u1", role } });
    }
}

function makeReq(
    params: Record<string, string | number | null | undefined> = {}
) {
    const url = new URL("http://localhost/api/admin/customers/get-all");
    Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
    });
    return new Request(url.toString()) as Request;
}

describe("GET /admin/customers/get-all", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it("returns 401 when not authenticated", async () => {
        setSession(undefined);
        const { GET } = await import("./route");

        const res = await GET(makeReq());
        expect(res.status).toBe(401);
        await expect(res.json()).resolves.toEqual({ error: "Unauthorized" });
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

    it("returns customers (no pagination needed) for admin", async () => {
        setSession("admin");

        const release = jest.fn();
        const rows = [
            {
                id: "u2",
                name: "Jane Smith",
                username: "jane",
                email: "jane@example.com",
                role: "user",
                banned: false,
                banReason: null,
                banExpires: null,
                createdAt: "2024-02-02T10:00:00.000Z",
                orders_count: "2",
                revenue: "119.98",
                last_order_at: "2024-02-03T11:00:00.000Z",
            },
            {
                id: "u1",
                name: "John Doe",
                username: "john",
                email: "john@example.com",
                role: "admin",
                banned: true,
                banReason: "spam",
                banExpires: null,
                createdAt: "2024-02-01T10:00:00.000Z",
                orders_count: "0",
                revenue: "0",
                last_order_at: null,
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
            customers: [
                {
                    id: "u2",
                    name: "Jane Smith",
                    username: "jane",
                    email: "jane@example.com",
                    createdAt: "2024-02-02T10:00:00.000Z",
                    ordersCount: 2,
                    revenue: 119.98,
                    lastOrderAt: "2024-02-03T11:00:00.000Z",
                    role: "user",
                    banned: false,
                    banReason: null,
                    banExpires: null,
                },
                {
                    id: "u1",
                    name: "John Doe",
                    username: "john",
                    email: "john@example.com",
                    createdAt: "2024-02-01T10:00:00.000Z",
                    ordersCount: 0,
                    revenue: 0,
                    lastOrderAt: null,
                    role: "admin",
                    banned: true,
                    banReason: "spam",
                    banExpires: null,
                },
            ],
            nextCursor: null,
        });
    });

    it("paginates and returns nextCursor when > limit", async () => {
        setSession("admin");

        const release = jest.fn();
        // API fetches limit+1 rows; simulate 2 rows with limit=1
        const rows = [
            {
                id: "u3",
                name: "Alice",
                username: "alice",
                email: "alice@example.com",
                role: "user",
                banned: false,
                banReason: null,
                banExpires: null,
                createdAt: "2024-03-03T10:00:00.000Z",
                orders_count: "5",
                revenue: "250.00",
                last_order_at: "2024-03-04T12:00:00.000Z",
            },
            {
                id: "u2",
                name: "Bob",
                username: "bob",
                email: "bob@example.com",
                role: "user",
                banned: false,
                banReason: null,
                banExpires: null,
                createdAt: "2024-03-02T10:00:00.000Z",
                orders_count: "1",
                revenue: "49.99",
                last_order_at: "2024-03-02T11:00:00.000Z",
            },
        ];
        const query = jest.fn().mockResolvedValue({ rows });
        (pool.connect as jest.Mock).mockResolvedValue({ query, release });

        const { GET } = await import("./route");
        const res = await GET(makeReq({ limit: 1 }));
        expect(res.status).toBe(200);

        const body = await res.json();
        // Only first row should be returned (keyset slice)
        expect(body.customers).toEqual([
            {
                id: "u3",
                name: "Alice",
                username: "alice",
                email: "alice@example.com",
                createdAt: "2024-03-03T10:00:00.000Z",
                ordersCount: 5,
                revenue: 250,
                lastOrderAt: "2024-03-04T12:00:00.000Z",
                role: "user",
                banned: false,
                banReason: null,
                banExpires: null,
            },
        ]);
        // nextCursor should point at the last returned item (u3)
        const decoded = utils.decodeCursor(body.nextCursor);
        expect(decoded.createdAt).toBe("2024-03-03T10:00:00.000Z");
        expect(decoded.id).toBe("u3");
    });

    it("applies search query q", async () => {
        setSession("admin");

        const release = jest.fn();
        const rows = [
            {
                id: "u9",
                name: "Blueberry User",
                username: "blue-berry",
                email: "blue@example.com",
                role: "user",
                banned: false,
                banReason: null,
                banExpires: null,
                createdAt: "2024-05-01T10:00:00.000Z",
                orders_count: "0",
                revenue: "0",
                last_order_at: null,
            },
        ];
        const query = jest.fn().mockResolvedValue({ rows });
        (pool.connect as jest.Mock).mockResolvedValue({ query, release });

        const { GET } = await import("./route");
        const res = await GET(makeReq({ q: "blue", limit: 10 }));
        expect(res.status).toBe(200);
        await res.json(); // consume body

        // Ensure SQL got q and limit+1 at the end
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const [_sql, params] = query.mock.calls[0] as [string, unknown[]];
        expect(params[params.length - 1]).toBe(11);
        expect(params).toContain("blue");
    });

    it("returns 500 on DB error", async () => {
        setSession("admin");
        (pool.connect as jest.Mock).mockRejectedValue(new Error("db down"));

        const { GET } = await import("./route");
        const res = await GET(makeReq());

        expect(res.status).toBe(500);
        await expect(res.json()).resolves.toEqual({
            error: "Failed to fetch customers",
        });
    });
});
