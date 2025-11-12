/**
 * @jest-environment node
 */

import { pool } from "@/lib/database/db";

jest.mock("@/lib/database/db", () => ({
    pool: { connect: jest.fn() },
}));

jest.mock("../../../../../../../auth", () => ({
    auth: { api: { getSession: jest.fn() } },
}));

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
    if (!role) {
        auth.api.getSession.mockResolvedValue(null);
    } else {
        auth.api.getSession.mockResolvedValue({
            user: { id: "u1", role },
        });
    }
}

function makeReq(
    params: Record<string, string | number | null | undefined> = {}
) {
    const url = new URL("http://localhost/api/admin/catalog/colors/get-all");
    Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
    });
    return new Request(url.toString()) as Request;
}

describe("GET /admin/catalog/colors/get-all", () => {
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

    it("returns colors (no pagination needed) for admin", async () => {
        setSession("admin");

        const release = jest.fn();
        const rows = [
            {
                id: "c2",
                name: "Midnight",
                hex: "#001122",
                created_at: "2024-02-02T10:00:00.000Z",
                updated_at: "2024-02-03T10:00:00.000Z",
                active: true,
            },
            {
                id: "c1",
                name: "Snow",
                hex: "#FFFFFF",
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
            colors: [
                {
                    id: "c2",
                    name: "Midnight",
                    hex: "#001122",
                    createdAt: "2024-02-02T10:00:00.000Z",
                    updatedAt: "2024-02-03T10:00:00.000Z",
                    active: true,
                },
                {
                    id: "c1",
                    name: "Snow",
                    hex: "#FFFFFF",
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
                id: "c3",
                name: "Charcoal",
                hex: "#333333",
                created_at: "2024-03-03T10:00:00.000Z",
                updated_at: "2024-03-04T10:00:00.000Z",
                active: true,
            },
            {
                id: "c2",
                name: "Ocean",
                hex: "#005577",
                created_at: "2024-03-02T10:00:00.000Z",
                updated_at: "2024-03-02T11:00:00.000Z",
                active: true,
            },
            {
                id: "c1",
                name: "Ivory",
                hex: "#FFFFF0",
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
        expect(body.colors).toEqual([
            {
                id: "c3",
                name: "Charcoal",
                hex: "#333333",
                createdAt: "2024-03-03T10:00:00.000Z",
                updatedAt: "2024-03-04T10:00:00.000Z",
                active: true,
            },
            {
                id: "c2",
                name: "Ocean",
                hex: "#005577",
                createdAt: "2024-03-02T10:00:00.000Z",
                updatedAt: "2024-03-02T11:00:00.000Z",
                active: true,
            },
        ]);
        expect(typeof body.nextCursor).toBe("string");
        const decoded = utils.decodeCursor(body.nextCursor);
        expect(decoded.createdAt).toBe("2024-03-02T10:00:00.000Z");
        expect(decoded.id).toBe("c2");
    });

    it("applies search query q", async () => {
        setSession("admin");

        const release = jest.fn();
        const rows = [
            {
                id: "c9",
                name: "Blueberry",
                hex: "#2233FF",
                created_at: "2024-05-01T10:00:00.000Z",
                updated_at: "2024-05-02T10:00:00.000Z",
                active: true,
            },
        ];
        const query = jest.fn().mockResolvedValue({ rows });
        (pool.connect as jest.Mock).mockResolvedValue({ query, release });

        const { GET } = await import("./route");

        const res = await GET(makeReq({ q: "blue", limit: 10 }));
        expect(res.status).toBe(200);
        await res.json();

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const [_sql, params] = query.mock.calls[0] as [string, unknown[]];
        // Last param is limit+1
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
            error: "Failed to fetch colors",
        });
    });
});
