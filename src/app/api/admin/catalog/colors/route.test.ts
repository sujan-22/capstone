/**
 * @jest-environment node
 */

import { pool } from "@/lib/database/db";

jest.mock("@/lib/database/db", () => ({
    pool: { connect: jest.fn() },
}));

jest.mock("../../../../../../auth", () => ({
    auth: { api: { getSession: jest.fn() } },
}));

jest.mock("@/schema/catalog", () => ({
    updateColorSchema: {
        parse: jest.fn((body) => {
            if (
                !body ||
                typeof body.name !== "string" ||
                typeof body.hex !== "string"
            ) {
                throw new Error("invalid");
            }
            return { name: body.name, hex: body.hex };
        }),
    },
    normalizeHex: jest.fn((hex: string) => {
        const h = hex.startsWith("#") ? hex : `#${hex}`;
        return h.toUpperCase();
    }),
}));

const { updateColorSchema } = jest.requireMock("@/schema/catalog") as {
    updateColorSchema: { parse: jest.Mock };
};

const { auth } = jest.requireMock("../../../../../../auth") as {
    auth: { api: { getSession: jest.Mock } };
};

function setSession(role?: "admin" | "user") {
    if (!role) auth.api.getSession.mockResolvedValue(null);
    else auth.api.getSession.mockResolvedValue({ user: { id: "u1", role } });
}

function makePost(body?: unknown) {
    return new Request("http://localhost/api/admin/catalog/color", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: body === undefined ? undefined : JSON.stringify(body),
    }) as Request;
}

describe("POST /admin/catalog/color", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it("returns 401 when not authenticated", async () => {
        setSession(undefined);
        const { POST } = await import("./route");
        const res = await POST(makePost({ name: "Blue", hex: "#112233" }));
        expect(res.status).toBe(401);
        await expect(res.json()).resolves.toEqual({ error: "Unauthorized" });
        expect(pool.connect).not.toHaveBeenCalled();
    });

    it("returns 403 when authenticated but not admin", async () => {
        setSession("user");
        const { POST } = await import("./route");
        const res = await POST(makePost({ name: "Blue", hex: "#112233" }));
        expect(res.status).toBe(403);
        await expect(res.json()).resolves.toEqual({ error: "Forbidden" });
        expect(pool.connect).not.toHaveBeenCalled();
    });

    it("returns 400 when input is invalid", async () => {
        setSession("admin");

        updateColorSchema.parse.mockImplementationOnce(() => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const err: any = new Error("invalid");
            err.errors = [
                {
                    code: "custom",
                    path: ["hex"],
                    message: "Color must be from the approved swatches",
                },
            ];
            throw err;
        });

        const { POST } = await import("./route");
        const res = await POST(makePost({ name: "", hex: "not-a-hex" }));

        expect(res.status).toBe(400);
        const body = await res.json();
        expect(body.error).toBe("Invalid input");
        expect(pool.connect).not.toHaveBeenCalled();
    });

    it("creates color and returns 201", async () => {
        setSession("admin");

        const release = jest.fn();
        const query = jest.fn().mockResolvedValue({
            rows: [
                {
                    id: "c1",
                    name: "Blue",
                    hex: "#112233",
                    active: true,
                    created_at: "2025-01-01T10:00:00.000Z",
                    updated_at: "2025-01-01T10:00:00.000Z",
                },
            ],
        });
        (pool.connect as jest.Mock).mockResolvedValue({ query, release });

        const { POST } = await import("./route");
        const res = await POST(makePost({ name: "Blue", hex: "#112233" }));

        expect(pool.connect).toHaveBeenCalled();
        expect(query).toHaveBeenCalledWith(
            expect.stringContaining("INSERT INTO case_color"),
            ["Blue", "#112233"]
        );
        expect(release).toHaveBeenCalled();

        expect(res.status).toBe(201);
        await expect(res.json()).resolves.toEqual({
            id: "c1",
            name: "Blue",
            hex: "#112233".toUpperCase(),
            active: true,
            createdAt: "2025-01-01T10:00:00.000Z",
            updatedAt: "2025-01-01T10:00:00.000Z",
        });
    });

    it("returns 409 on unique violation for hex", async () => {
        setSession("admin");

        const release = jest.fn();
        const err = Object.assign(new Error("duplicate key"), {
            code: "23505",
            detail: "Key (hex)=(#112233) already exists.",
        });
        const query = jest.fn().mockRejectedValue(err);
        (pool.connect as jest.Mock).mockResolvedValue({ query, release });

        const { POST } = await import("./route");
        const res = await POST(makePost({ name: "Blue", hex: "#112233" }));

        expect(res.status).toBe(409);
        await expect(res.json()).resolves.toEqual({
            error: "Conflict",
            message: "A color with this hex already exists.",
        });
    });

    it("returns 409 on unique violation for name", async () => {
        setSession("admin");

        const release = jest.fn();
        const err = Object.assign(new Error("duplicate key"), {
            code: "23505",
            detail: "Key (name)=(Blue) already exists.",
        });
        const query = jest.fn().mockRejectedValue(err);
        (pool.connect as jest.Mock).mockResolvedValue({ query, release });

        const { POST } = await import("./route");
        const res = await POST(makePost({ name: "Blue", hex: "#445566" }));

        expect(res.status).toBe(409);
        await expect(res.json()).resolves.toEqual({
            error: "Conflict",
            message: "A color with this name already exists.",
        });
    });

    it("returns 400 on NOT NULL / CHECK violations", async () => {
        setSession("admin");

        const release = jest.fn();
        const err = Object.assign(new Error("bad row"), { code: "23502" }); // or 23514
        const query = jest.fn().mockRejectedValue(err);
        (pool.connect as jest.Mock).mockResolvedValue({ query, release });

        const { POST } = await import("./route");
        const res = await POST(makePost({ name: "Blue", hex: "#112233" }));

        expect(res.status).toBe(400);
        await expect(res.json()).resolves.toEqual({
            error: "Invalid input",
            message: "Database constraint violated.",
        });
    });

    it("returns 500 on DB connect error", async () => {
        setSession("admin");
        (pool.connect as jest.Mock).mockRejectedValue(new Error("db down"));

        const { POST } = await import("./route");
        const res = await POST(makePost({ name: "Blue", hex: "#112233" }));

        expect(res.status).toBe(500);
        await expect(res.json()).resolves.toEqual({
            error: "Failed to create color",
        });
    });

    it("returns 500 on unexpected query error", async () => {
        setSession("admin");

        const release = jest.fn();
        const query = jest.fn().mockRejectedValue(new Error("weird"));
        (pool.connect as jest.Mock).mockResolvedValue({ query, release });

        const { POST } = await import("./route");
        const res = await POST(makePost({ name: "Blue", hex: "#112233" }));

        expect(res.status).toBe(500);
        await expect(res.json()).resolves.toEqual({
            error: "Failed to create color",
        });
    });
});
