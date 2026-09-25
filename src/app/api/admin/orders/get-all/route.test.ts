/**
 * @jest-environment node
 */

import { pool } from "@/lib/database/db";

jest.mock("@/lib/database/db", () => ({
    pool: { connect: jest.fn() },
}));

// Mock auth BEFORE importing the route (avoid better-auth loading)
jest.mock("../../../../../../auth", () => ({
    auth: { api: { getSession: jest.fn() } },
}));

// Use real cursor helpers + parseLimit
const utils = jest.requireActual("@/lib/utils") as {
    encodeCursor: (createdAtISO: string, id: string) => string;
    decodeCursor: (cursor: string | null) => {
        createdAt?: string;
        id?: string;
    };
    parseLimit: (v: string | null) => number;
};

const { auth } = jest.requireMock("../../../../../../auth") as {
    auth: { api: { getSession: jest.Mock } };
};

function setSession(role?: "admin" | "user") {
    if (!role) auth.api.getSession.mockResolvedValue(null);
    else auth.api.getSession.mockResolvedValue({ user: { id: "uX", role } });
}

function makeReq(
    params: Record<string, string | number | null | undefined> = {}
) {
    const url = new URL("http://localhost/api/admin/orders/get-all");
    Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
    });
    return new Request(url.toString()) as Request;
}

describe("GET /admin/orders/get-all", () => {
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

    it("returns orders (no pagination needed) for admin", async () => {
        setSession("admin");

        const release = jest.fn();
        const rows = [
            {
                id: "o2",
                order_number: "DMC-0002",
                case_design_id: "cd2",
                order_status: "processing",
                created_at: "2025-02-02T12:00:00.000Z",
                user_id: "u2",
                user_name: "Alice",
                user_email: "alice@example.com",
                has_requested_to_share_publicly: true,
                is_shared_publicly: false,
            },
            {
                id: "o1",
                order_number: "DMC-0001",
                case_design_id: "cd1",
                order_status: "paid",
                created_at: "2025-02-01T10:00:00.000Z",
                user_id: "u1",
                user_name: "Bob",
                user_email: "bob@example.com",
                has_requested_to_share_publicly: false,
                is_shared_publicly: false,
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
            orders: [
                {
                    id: "o2",
                    orderNumber: "DMC-0002",
                    caseDesign: {
                        id: "cd2",
                        hasRequestedToSharePublicly: true,
                        isSharedPublicly: false,
                        croppedImageUrl: null,
                    },
                    status: "processing",
                    totalAmount: 0,
                    createdAt: "2025-02-02T12:00:00.000Z",
                    customer: {
                        id: "u2",
                        name: "Alice",
                        email: "alice@example.com",
                    },
                },
                {
                    id: "o1",
                    orderNumber: "DMC-0001",
                    caseDesign: {
                        id: "cd1",
                        hasRequestedToSharePublicly: false,
                        isSharedPublicly: false,
                        croppedImageUrl: null,
                    },
                    status: "paid",
                    totalAmount: 0,
                    createdAt: "2025-02-01T10:00:00.000Z",
                    customer: {
                        id: "u1",
                        name: "Bob",
                        email: "bob@example.com",
                    },
                },
            ],
            nextCursor: null,
        });
    });

    it("paginates and returns nextCursor when > limit", async () => {
        setSession("admin");

        const release = jest.fn();
        // Route fetches limit+1; simulate 2 rows for limit=1
        const rows = [
            {
                id: "o9",
                order_number: "DMC-0009",
                case_design_id: "cd9",
                order_status: "paid",
                created_at: "2025-03-03T10:00:00.000Z",
                user_id: "u9",
                user_name: "Nina",
                user_email: "nina@example.com",
                has_requested_to_share_publicly: false,
                is_shared_publicly: true,
            },
            {
                id: "o8",
                order_number: "DMC-0008",
                case_design_id: "cd8",
                order_status: "processing",
                created_at: "2025-03-02T09:00:00.000Z",
                user_id: "u8",
                user_name: "Max",
                user_email: "max@example.com",
                has_requested_to_share_publicly: false,
                is_shared_publicly: false,
            },
        ];
        const query = jest.fn().mockResolvedValue({ rows });
        (pool.connect as jest.Mock).mockResolvedValue({ query, release });

        const { GET } = await import("./route");
        const res = await GET(makeReq({ limit: 1 }));
        expect(res.status).toBe(200);

        const body = await res.json();
        expect(body.orders).toEqual([
            {
                id: "o9",
                orderNumber: "DMC-0009",
                caseDesign: {
                    id: "cd9",
                    hasRequestedToSharePublicly: false,
                    isSharedPublicly: true,
                    croppedImageUrl: null,
                },
                status: "paid",
                totalAmount: 0,
                createdAt: "2025-03-03T10:00:00.000Z",
                customer: { id: "u9", name: "Nina", email: "nina@example.com" },
            },
        ]);

        // nextCursor should point at the last returned item (o9)
        const decoded = utils.decodeCursor(body.nextCursor);
        expect(decoded.createdAt).toBe("2025-03-03T10:00:00.000Z");
        expect(decoded.id).toBe("o9");
    });

    it("applies search query q (and limit+1) to SQL params", async () => {
        setSession("admin");

        const release = jest.fn();
        const query = jest.fn().mockResolvedValue({ rows: [] });
        (pool.connect as jest.Mock).mockResolvedValue({ query, release });

        const { GET } = await import("./route");
        const res = await GET(makeReq({ q: "DMC-0001", limit: 10 }));
        expect(res.status).toBe(200);
        await res.json();

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const [_sql, params] = query.mock.calls[0] as [string, unknown[]];
        expect(params).toContain("DMC-0001");
        expect(params[params.length - 1]).toBe(11); // limit+1
    });

    it("filters by userId", async () => {
        setSession("admin");

        const release = jest.fn();
        const query = jest.fn().mockResolvedValue({ rows: [] });
        (pool.connect as jest.Mock).mockResolvedValue({ query, release });

        const { GET } = await import("./route");
        const res = await GET(makeReq({ userId: "u123", limit: 5 }));
        expect(res.status).toBe(200);
        await res.json();

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const [_sql, params] = query.mock.calls[0] as [string, unknown[]];
        expect(params).toContain("u123");
        expect(params[params.length - 1]).toBe(6); // limit+1
    });

    it("filters by a known status, case-insensitively", async () => {
        setSession("admin");

        const release = jest.fn();
        const query = jest.fn().mockResolvedValue({ rows: [] });
        (pool.connect as jest.Mock).mockResolvedValue({ query, release });

        const { GET } = await import("./route");
        const res = await GET(makeReq({ status: "shipped", limit: 5 }));
        expect(res.status).toBe(200);
        await res.json();

        const [sql, params] = query.mock.calls[0] as [string, unknown[]];
        expect(params).toContain("SHIPPED");
        expect(sql).toContain("UPPER(o.order_status)");
    });

    it("ignores unknown status values", async () => {
        setSession("admin");

        const release = jest.fn();
        const query = jest.fn().mockResolvedValue({ rows: [] });
        (pool.connect as jest.Mock).mockResolvedValue({ query, release });

        const { GET } = await import("./route");
        const res = await GET(makeReq({ status: "'; DROP TABLE", limit: 5 }));
        expect(res.status).toBe(200);
        await res.json();

        const [sql, params] = query.mock.calls[0] as [string, unknown[]];
        expect(sql).not.toContain("UPPER(o.order_status)");
        expect(params).toEqual([6]);
    });

    it("maps the design thumbnail and order total", async () => {
        setSession("admin");

        const release = jest.fn();
        const rows = [
            {
                id: "o5",
                order_number: "DMC-0005",
                case_design_id: "cd5",
                order_status: "PENDING",
                total_amount: "28.23",
                created_at: "2025-04-01T10:00:00.000Z",
                user_id: "u5",
                user_name: "Kai",
                user_email: "kai@example.com",
                has_requested_to_share_publicly: false,
                is_shared_publicly: false,
                cropped_image_url: "https://example.com/c.png",
            },
        ];
        const query = jest.fn().mockResolvedValue({ rows });
        (pool.connect as jest.Mock).mockResolvedValue({ query, release });

        const { GET } = await import("./route");
        const body = await (await GET(makeReq({ limit: 5 }))).json();

        expect(body.orders[0].totalAmount).toBe(28.23);
        expect(body.orders[0].caseDesign.croppedImageUrl).toBe(
            "https://example.com/c.png"
        );
    });

    it("returns 500 on DB error", async () => {
        setSession("admin");
        (pool.connect as jest.Mock).mockRejectedValue(new Error("db down"));

        const { GET } = await import("./route");
        const res = await GET(makeReq());

        expect(res.status).toBe(500);
        await expect(res.json()).resolves.toEqual({
            error: "Failed to fetch orders",
        });
    });
});
