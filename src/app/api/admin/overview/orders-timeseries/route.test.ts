/**
 * @jest-environment node
 */

import { pool } from "@/lib/database/db";

jest.mock("@/lib/database/db", () => ({
    pool: { connect: jest.fn() },
}));

// Mock auth BEFORE importing the route (prevents better-auth from loading)
jest.mock("../../../../../../auth", () => ({
    auth: { api: { getSession: jest.fn() } },
}));

const { auth } = jest.requireMock("../../../../../../auth") as {
    auth: { api: { getSession: jest.Mock } };
};

function setSession(role?: "admin" | "user") {
    if (!role) auth.api.getSession.mockResolvedValue(null);
    else auth.api.getSession.mockResolvedValue({ user: { id: "u1", role } });
}

function makeReq(period?: string) {
    const url = new URL(
        "http://localhost/api/admin/overview/orders-timeseries"
    );
    if (period) url.searchParams.set("period", period);
    return new Request(url.toString()) as Request;
}

describe("GET /admin/overview/orders-timeseries", () => {
    beforeAll(() => {
        jest.spyOn(console, "error").mockImplementation(() => {}); // silence error logs
    });

    afterAll(() => {
        (console.error as jest.Mock).mockRestore();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("returns 401 when not authenticated", async () => {
        setSession(undefined);
        const { GET } = await import("./route");

        const res = await GET(makeReq("7d"));
        // route returns {ok:false,status:401,...} with default HTTP 200
        expect(res.status).toBe(200);
        await expect(res.json()).resolves.toEqual({
            ok: false,
            status: 401,
            message: "Unauthorized",
        });
        expect(pool.connect).not.toHaveBeenCalled();
    });

    it("returns 403 when authenticated but not admin", async () => {
        setSession("user");
        const { GET } = await import("./route");

        const res = await GET(makeReq("30d"));
        expect(res.status).toBe(200);
        await expect(res.json()).resolves.toEqual({
            ok: false,
            status: 403,
            message: "Forbidden",
        });
        expect(pool.connect).not.toHaveBeenCalled();
    });

    it("returns data for admin, period=7d, with correct param order and payload", async () => {
        setSession("admin");

        const release = jest.fn();
        const fakeRow = {
            buckets: [
                { day: "2025-02-13", count: 2, revenue: 120.5 },
                { day: "2025-02-14", count: 0, revenue: 0 },
            ],
            orders: [
                {
                    id: "o1",
                    createdAt: "2025-02-13T16:00:00.000Z",
                    customerName: "Alice",
                    amount: 60.25,
                },
                {
                    id: "o2",
                    createdAt: "2025-02-13T17:00:00.000Z",
                    customerName: "Bob",
                    amount: 60.25,
                },
            ],
        };
        const query = jest.fn().mockResolvedValue({ rows: [fakeRow] });
        (pool.connect as jest.Mock).mockResolvedValue({ query, release });

        const { GET } = await import("./route");
        const res = await GET(makeReq("7d"));

        expect(pool.connect).toHaveBeenCalled();
        expect(query).toHaveBeenCalledTimes(1);

        // Verify param order only: [range.start, range.end, tz]
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const [_sql, params] = query.mock.calls[0] as [string, unknown[]];
        expect(typeof params[0]).toBe("string"); // start ISO
        expect(typeof params[1]).toBe("string"); // end ISO
        expect(params[2]).toBe("America/Toronto");

        const body = await res.json();
        expect(body.period).toBe("7d");
        expect(body.timezone).toBe("America/Toronto");
        expect(typeof body.range.start).toBe("string");
        expect(typeof body.range.end).toBe("string");
        expect(new Date(body.range.start).toString()).not.toBe("Invalid Date");
        expect(new Date(body.range.end).toString()).not.toBe("Invalid Date");
        expect(body.buckets).toEqual(fakeRow.buckets);
        expect(body.orders).toEqual(fakeRow.orders);

        expect(release).toHaveBeenCalled();
    });

    it("defaults to 30d when period is invalid", async () => {
        setSession("admin");

        const release = jest.fn();
        const query = jest
            .fn()
            .mockResolvedValue({ rows: [{ buckets: [], orders: [] }] });
        (pool.connect as jest.Mock).mockResolvedValue({ query, release });

        const { GET } = await import("./route");
        const res = await GET(makeReq("not-a-valid-period"));

        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body.period).toBe("30d");
        expect(Array.isArray(body.buckets)).toBe(true);
        expect(Array.isArray(body.orders)).toBe(true);
        expect(release).toHaveBeenCalled();
    });

    it("returns empty arrays when DB returns no rows", async () => {
        setSession("admin");

        const release = jest.fn();
        const query = jest.fn().mockResolvedValue({ rows: [] });
        (pool.connect as jest.Mock).mockResolvedValue({ query, release });

        const { GET } = await import("./route");
        const res = await GET(makeReq("90d"));

        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body.period).toBe("90d");
        expect(body.buckets).toEqual([]);
        expect(body.orders).toEqual([]);
        expect(release).toHaveBeenCalled();
    });

    it("returns 500 on DB connect error", async () => {
        setSession("admin");
        (pool.connect as jest.Mock).mockRejectedValue(new Error("db down"));

        const { GET } = await import("./route");
        const res = await GET(makeReq("7d"));

        expect(res.status).toBe(500);
        await expect(res.json()).resolves.toEqual({
            error: "Failed to fetch orders time-series",
        });
    });
});
