/**
 * @jest-environment node
 */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { pool } from "@/lib/database/db";

jest.mock("@/lib/database/db", () => ({
    pool: { connect: jest.fn() },
}));

jest.mock("@/hooks/use-session", () => ({
    getServerSideSession: jest.fn(),
}));

const { getServerSideSession } = jest.requireMock("@/hooks/use-session") as {
    getServerSideSession: jest.Mock;
};

function setSession(userId?: string) {
    getServerSideSession.mockResolvedValue({
        user: userId ? { id: userId } : null,
    });
}

// Build a fetch-like Request without importing NextRequest
function makePost(headers?: Record<string, string>, body?: unknown): any {
    return new Request(
        "http://localhost/api/account/unfinished-designs/delete-design",
        {
            method: "POST",
            headers: {
                "content-type": "application/json",
                ...(headers || {}),
            },
            body: body === undefined ? undefined : JSON.stringify(body),
        }
    ) as any;
}

describe("POST /api/account/unfinished-designs/delete-design", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it("returns 401 when not authenticated", async () => {
        setSession(undefined);
        const { POST } = await import("./route");

        const res = await POST(makePost());
        expect(res.status).toBe(401);
        await expect(res.json()).resolves.toEqual({
            success: false,
            error: "Not authenticated",
        });
        expect(pool.connect).not.toHaveBeenCalled();
    });

    it("returns 400 when designId is missing", async () => {
        setSession("u1");
        const { POST } = await import("./route");

        const res = await POST(makePost({ "x-any": "ignored" }, {}));
        expect(res.status).toBe(400);
        await expect(res.json()).resolves.toEqual({
            success: false,
            error: "designId is required",
        });
        expect(pool.connect).not.toHaveBeenCalled();
    });

    it("returns 404 when design not found or not owned by user (rolls back)", async () => {
        setSession("u1");

        const release = jest.fn();
        const query = jest
            .fn()
            .mockResolvedValueOnce({}) // BEGIN
            .mockResolvedValueOnce({ rowCount: 0 }) // DELETE affected 0 rows
            .mockResolvedValueOnce({}); // ROLLBACK

        (pool.connect as jest.Mock).mockResolvedValue({ query, release });

        const { POST } = await import("./route");

        const res = await POST(makePost({}, { designId: "d1" }));

        expect(pool.connect).toHaveBeenCalled();
        expect(query).toHaveBeenNthCalledWith(1, "BEGIN");
        expect(query).toHaveBeenNthCalledWith(
            2,
            `DELETE FROM case_design WHERE id = $1 AND user_id = $2`,
            ["d1", "u1"]
        );
        expect(query).toHaveBeenNthCalledWith(3, "ROLLBACK");
        expect(release).toHaveBeenCalled();

        expect(res.status).toBe(404);
        await expect(res.json()).resolves.toEqual({
            success: false,
            error: "Design not found or not owned by user",
        });
    });

    it("returns 200 on successful delete (commits transaction)", async () => {
        setSession("u1");

        const release = jest.fn();
        const query = jest
            .fn()
            .mockResolvedValueOnce({}) // BEGIN
            .mockResolvedValueOnce({ rowCount: 1 }) // DELETE affected 1 row
            .mockResolvedValueOnce({}); // COMMIT

        (pool.connect as jest.Mock).mockResolvedValue({ query, release });

        const { POST } = await import("./route");

        const res = await POST(makePost({}, { designId: "d1" }));

        expect(pool.connect).toHaveBeenCalled();
        expect(query).toHaveBeenNthCalledWith(1, "BEGIN");
        expect(query).toHaveBeenNthCalledWith(
            2,
            `DELETE FROM case_design WHERE id = $1 AND user_id = $2`,
            ["d1", "u1"]
        );
        expect(query).toHaveBeenNthCalledWith(3, "COMMIT");
        expect(release).toHaveBeenCalled();

        expect(res.status).toBe(200);
        await expect(res.json()).resolves.toEqual({
            success: true,
            message: "Design deleted successfully.",
        });
    });

    it("returns 500 and rolls back if DELETE throws", async () => {
        setSession("u1");

        const release = jest.fn();
        const query = jest
            .fn()
            .mockResolvedValueOnce({}) // BEGIN
            .mockRejectedValueOnce(new Error("boom")) // DELETE throws
            .mockResolvedValueOnce({}); // ROLLBACK in catch

        (pool.connect as jest.Mock).mockResolvedValue({ query, release });

        const { POST } = await import("./route");

        const res = await POST(makePost({}, { designId: "d1" }));

        expect(pool.connect).toHaveBeenCalled();
        expect(query).toHaveBeenNthCalledWith(1, "BEGIN");
        expect(query).toHaveBeenNthCalledWith(
            2,
            `DELETE FROM case_design WHERE id = $1 AND user_id = $2`,
            ["d1", "u1"]
        );
        expect(query).toHaveBeenNthCalledWith(3, "ROLLBACK");
        expect(release).toHaveBeenCalled();

        expect(res.status).toBe(500);
        await expect(res.json()).resolves.toEqual({
            success: false,
            error: "Internal server error",
        });
    });

    it("returns 500 if acquiring DB client fails", async () => {
        setSession("u1");
        (pool.connect as jest.Mock).mockRejectedValue(new Error("db down"));

        const { POST } = await import("./route");

        const res = await POST(makePost({}, { designId: "d1" }));
        expect(res.status).toBe(500);
        await expect(res.json()).resolves.toEqual({
            success: false,
            error: "Internal server error",
        });
    });
});
