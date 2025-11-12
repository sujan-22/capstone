/**
 * @jest-environment node
 */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { pool } from "@/lib/database/db";

jest.mock("@/lib/database/db", () => ({
    pool: { connect: jest.fn() },
}));

// Mock auth BEFORE importing the route to avoid better-auth loading
jest.mock("../../../../../../auth", () => ({
    auth: { api: { getSession: jest.fn() } },
}));

// Mock catalog schema (permissive by default; we’ll force rejection in one test)
jest.mock("@/schema/catalog", () => ({
    updateFinishSchema: {
        parse: jest.fn((body: any) => {
            if (
                !body ||
                typeof body.name !== "string" ||
                typeof body.description !== "string" ||
                typeof body.price !== "number"
            ) {
                throw new Error("invalid");
            }
            return {
                name: body.name,
                description: body.description,
                price: body.price,
            };
        }),
    },
}));

const { auth } = jest.requireMock("../../../../../../auth") as {
    auth: { api: { getSession: jest.Mock } };
};

const { updateFinishSchema } = jest.requireMock("@/schema/catalog") as {
    updateFinishSchema: { parse: jest.Mock };
};

function setSession(role?: "admin" | "user") {
    if (!role) auth.api.getSession.mockResolvedValue(null);
    else auth.api.getSession.mockResolvedValue({ user: { id: "u1", role } });
}

function makePost(body?: unknown) {
    return new Request("http://localhost/api/admin/catalog/finishes", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: body === undefined ? undefined : JSON.stringify(body),
    }) as Request;
}

describe("POST /admin/catalog/finishes", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it("returns 401 when not authenticated", async () => {
        setSession(undefined);
        const { POST } = await import("./route");
        const res = await POST(
            makePost({ name: "Matte", description: "Non-glossy", price: 5 })
        );
        expect(res.status).toBe(401);
        await expect(res.json()).resolves.toEqual({ error: "Unauthorized" });
        expect(pool.connect).not.toHaveBeenCalled();
    });

    it("returns 403 when authenticated but not admin", async () => {
        setSession("user");
        const { POST } = await import("./route");
        const res = await POST(
            makePost({ name: "Matte", description: "Non-glossy", price: 5 })
        );
        expect(res.status).toBe(403);
        await expect(res.json()).resolves.toEqual({ error: "Forbidden" });
        expect(pool.connect).not.toHaveBeenCalled();
    });

    it("returns 400 when input is invalid", async () => {
        setSession("admin");

        // Force schema to reject this payload for this test only
        updateFinishSchema.parse.mockImplementationOnce(() => {
            const err: any = new Error("invalid");
            err.errors = [
                {
                    code: "custom",
                    path: ["price"],
                    message: "Price must be ≥ 0",
                },
            ];
            throw err;
        });

        const { POST } = await import("./route");
        const res = await POST(
            makePost({ name: "", description: 123, price: -1 } as any)
        );
        expect(res.status).toBe(400);
        const body = await res.json();
        expect(body.error).toBe("Invalid input");
        expect(pool.connect).not.toHaveBeenCalled();
    });

    it("creates finish and returns 201", async () => {
        setSession("admin");

        const release = jest.fn();
        const query = jest.fn().mockResolvedValue({
            rows: [
                {
                    id: "f1",
                    name: "Matte",
                    description: "Non-glossy finish",
                    price: 7.5,
                    active: true,
                    created_at: "2025-01-01T10:00:00.000Z",
                    updated_at: "2025-01-01T10:00:00.000Z",
                },
            ],
        });
        (pool.connect as jest.Mock).mockResolvedValue({ query, release });

        const { POST } = await import("./route");
        const res = await POST(
            makePost({
                name: "Matte",
                description: "Non-glossy finish",
                price: 7.5,
            })
        );

        expect(pool.connect).toHaveBeenCalled();
        expect(query).toHaveBeenCalledWith(
            expect.stringContaining("INSERT INTO case_finish"),
            ["Matte", "Non-glossy finish", 7.5]
        );
        expect(release).toHaveBeenCalled();

        expect(res.status).toBe(201);
        await expect(res.json()).resolves.toEqual({
            id: "f1",
            name: "Matte",
            description: "Non-glossy finish",
            price: 7.5,
            active: true,
            createdAt: "2025-01-01T10:00:00.000Z",
            updatedAt: "2025-01-01T10:00:00.000Z",
        });
    });

    it("returns 409 on unique violation (name)", async () => {
        setSession("admin");

        const release = jest.fn();
        const err = Object.assign(new Error("duplicate key"), {
            code: "23505",
        });
        const query = jest.fn().mockRejectedValue(err);
        (pool.connect as jest.Mock).mockResolvedValue({ query, release });

        const { POST } = await import("./route");
        const res = await POST(
            makePost({ name: "Matte", description: "Non-glossy", price: 5 })
        );

        expect(res.status).toBe(409);
        await expect(res.json()).resolves.toEqual({
            error: "Conflict",
            message: "A finish with this name already exists.",
        });
    });

    it("returns 400 on NOT NULL / CHECK violations", async () => {
        setSession("admin");

        const release = jest.fn();
        const err = Object.assign(new Error("bad row"), { code: "23502" }); // or 23514
        const query = jest.fn().mockRejectedValue(err);
        (pool.connect as jest.Mock).mockResolvedValue({ query, release });

        const { POST } = await import("./route");
        const res = await POST(
            makePost({ name: "Matte", description: "Non-glossy", price: 5 })
        );

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
        const res = await POST(
            makePost({ name: "Matte", description: "Non-glossy", price: 5 })
        );

        expect(res.status).toBe(500);
        await expect(res.json()).resolves.toEqual({
            error: "Failed to create finish",
        });
    });

    it("returns 500 on unexpected query error", async () => {
        setSession("admin");

        const release = jest.fn();
        const query = jest.fn().mockRejectedValue(new Error("weird"));
        (pool.connect as jest.Mock).mockResolvedValue({ query, release });

        const { POST } = await import("./route");
        const res = await POST(
            makePost({ name: "Matte", description: "Non-glossy", price: 5 })
        );

        expect(res.status).toBe(500);
        await expect(res.json()).resolves.toEqual({
            error: "Failed to create finish",
        });
    });
});
