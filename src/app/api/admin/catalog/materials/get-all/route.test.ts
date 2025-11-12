/**
 * @jest-environment node
 */

import { pool } from "@/lib/database/db";

jest.mock("@/lib/database/db", () => ({
    pool: { connect: jest.fn() },
}));

// Mock auth BEFORE importing the route to avoid better-auth loading
jest.mock("../../../../../../../auth", () => ({
    auth: { api: { getSession: jest.fn() } },
}));

// Use real cursor helpers
const utils = jest.requireActual("@/lib/utils") as {
    encodeCursor: (createdAtISO: string, id: string) => string;
    decodeCursor: (cursor: string | null) => {
        createdAt?: string;
        id?: string;
    };
};
const { auth } = jest.requireMock("../../../../../../../auth") as {
    auth: { api: { getSession: jest.Mock } };
};

function setSession(role?: "admin" | "user") {
    if (!role) auth.api.getSession.mockResolvedValue(null);
    else auth.api.getSession.mockResolvedValue({ user: { id: "u1", role } });
}

// Build Request with query params
function makeReq(
    params: Record<string, string | number | null | undefined> = {}
) {
    const url = new URL("http://localhost/api/admin/catalog/materials/get-all");
    Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
    });
    return new Request(url.toString()) as Request;
}

describe("GET /admin/catalog/materials/get-all", () => {
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

    it("returns materials (no pagination) for admin", async () => {
        setSession("admin");

        const release = jest.fn();
        const rows = [
            {
                id: "m2",
                name: "Polycarbonate",
                description: "Rigid",
                price: 5.25,
                created_at: "2024-02-02T10:00:00.000Z",
                updated_at: "2024-02-03T10:00:00.000Z",
                active: true,
            },
            {
                id: "m1",
                name: "TPU",
                description: "Flexible",
                price: 3.5,
                created_at: "2024-02-01T10:00:00.000Z",
                updated_at: "2024-02-01T12:00:00.000Z",
                active: false,
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
            materials: [
                {
                    id: "m2",
                    name: "Polycarbonate",
                    description: "Rigid",
                    price: 5.25,
                    createdAt: "2024-02-02T10:00:00.000Z",
                    updatedAt: "2024-02-03T10:00:00.000Z",
                    active: true,
                },
                {
                    id: "m1",
                    name: "TPU",
                    description: "Flexible",
                    price: 3.5,
                    createdAt: "2024-02-01T10:00:00.000Z",
                    updatedAt: "2024-02-01T12:00:00.000Z",
                    active: false,
                },
            ],
            nextCursor: null,
        });
    });

    it("paginates and returns nextCursor when > limit", async () => {
        setSession("admin");

        const release = jest.fn();
        const rows = [
            {
                id: "m3",
                name: "Aluminum",
                description: "Metal",
                price: 6,
                created_at: "2024-03-03T10:00:00.000Z",
                updated_at: "2024-03-04T10:00:00.000Z",
                active: true,
            },
            {
                id: "m2",
                name: "Polycarbonate",
                description: "Rigid",
                price: 5.25,
                created_at: "2024-03-02T10:00:00.000Z",
                updated_at: "2024-03-02T11:00:00.000Z",
                active: true,
            },
            {
                id: "m1",
                name: "TPU",
                description: "Flexible",
                price: 3.5,
                created_at: "2024-03-01T10:00:00.000Z",
                updated_at: "2024-03-01T12:00:00.000Z",
                active: false,
            },
        ];
        const query = jest.fn().mockResolvedValue({ rows });
        (pool.connect as jest.Mock).mockResolvedValue({ query, release });

        const { GET } = await import("./route");
        const res = await GET(makeReq({ limit: 2 }));
        expect(res.status).toBe(200);

        const body = await res.json();
        expect(body.materials).toEqual([
            {
                id: "m3",
                name: "Aluminum",
                description: "Metal",
                price: 6,
                createdAt: "2024-03-03T10:00:00.000Z",
                updatedAt: "2024-03-04T10:00:00.000Z",
                active: true,
            },
            {
                id: "m2",
                name: "Polycarbonate",
                description: "Rigid",
                price: 5.25,
                createdAt: "2024-03-02T10:00:00.000Z",
                updatedAt: "2024-03-02T11:00:00.000Z",
                active: true,
            },
        ]);
        const decoded = utils.decodeCursor(body.nextCursor);
        expect(decoded.createdAt).toBe("2024-03-02T10:00:00.000Z");
        expect(decoded.id).toBe("m2");
    });

    it("applies search query q", async () => {
        setSession("admin");

        const release = jest.fn();
        const rows = [
            {
                id: "m9",
                name: "Bio-TPU",
                description: "eco",
                price: 4,
                created_at: "2024-05-01T10:00:00.000Z",
                updated_at: "2024-05-02T10:00:00.000Z",
                active: true,
            },
        ];
        const query = jest.fn().mockResolvedValue({ rows });
        (pool.connect as jest.Mock).mockResolvedValue({ query, release });

        const { GET } = await import("./route");
        const res = await GET(makeReq({ q: "tpu", limit: 10 }));
        expect(res.status).toBe(200);
        await res.json();

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const [_sql, params] = query.mock.calls[0] as [string, unknown[]];
        expect(params[params.length - 1]).toBe(11); // limit+1
        expect(params).toContain("tpu");
    });

    it("returns 500 on DB error", async () => {
        setSession("admin");
        (pool.connect as jest.Mock).mockRejectedValue(new Error("db down"));

        const { GET } = await import("./route");
        const res = await GET(makeReq());

        expect(res.status).toBe(500);
        await expect(res.json()).resolves.toEqual({
            error: "Failed to fetch materials",
        });
    });
});
