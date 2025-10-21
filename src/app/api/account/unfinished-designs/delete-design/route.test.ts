/** @jest-environment node */

import { pool } from "@/lib/database/db";
import { POST } from "./route";
import type { NextRequest } from "next/server";

jest.mock("@/lib/database/db", () => ({
    pool: { connect: jest.fn() },
}));

function makePost(
    headers?: Record<string, string>,
    body?: unknown
): NextRequest {
    const req = new Request(
        "http://localhost/api/account/unfinished-designs/delete-design",
        {
            method: "POST",
            headers: {
                "content-type": "application/json",
                ...(headers || {}),
            },
            body: body === undefined ? undefined : JSON.stringify(body),
        }
    );
    return req as unknown as NextRequest;
}

describe("POST /api/account/unfinished-designs/delete-design", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it("returns 401 when x-user-id header is missing", async () => {
        const res = await POST(makePost());
        expect(res.status).toBe(401);
        await expect(res.json()).resolves.toEqual({
            success: false,
            error: "Not authenticated",
        });
        expect(pool.connect).not.toHaveBeenCalled();
    });

    it("returns 400 when designId is missing", async () => {
        const res = await POST(makePost({ "x-user-id": "u1" }, {}));
        expect(res.status).toBe(400);
        await expect(res.json()).resolves.toEqual({
            success: false,
            error: "designId is required",
        });
        expect(pool.connect).not.toHaveBeenCalled();
    });

    it("returns 404 when design not found or not owned by user (and rolls back)", async () => {
        const release = jest.fn();
        const query = jest
            .fn()
            .mockResolvedValueOnce({}) // BEGIN
            .mockResolvedValueOnce({ rowCount: 0 }) // DELETE affected 0
            .mockResolvedValueOnce({}); // ROLLBACK

        (pool.connect as jest.Mock).mockResolvedValue({ query, release });

        const res = await POST(
            makePost({ "x-user-id": "u1" }, { designId: "d1" })
        );

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
        const release = jest.fn();
        const query = jest
            .fn()
            .mockResolvedValueOnce({}) // BEGIN
            .mockResolvedValueOnce({ rowCount: 1 }) // DELETE affected 1
            .mockResolvedValueOnce({}); // COMMIT

        (pool.connect as jest.Mock).mockResolvedValue({ query, release });

        const res = await POST(
            makePost({ "x-user-id": "u1" }, { designId: "d1" })
        );

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

    it("returns 500 and rolls back if an error occurs during DELETE", async () => {
        const release = jest.fn();
        const query = jest
            .fn()
            .mockResolvedValueOnce({}) // BEGIN
            .mockRejectedValueOnce(new Error("boom")) // DELETE throws
            .mockResolvedValueOnce({}); // ROLLBACK from catch

        (pool.connect as jest.Mock).mockResolvedValue({ query, release });

        const res = await POST(
            makePost({ "x-user-id": "u1" }, { designId: "d1" })
        );

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

    it("returns 500 if acquiring a DB client fails", async () => {
        (pool.connect as jest.Mock).mockRejectedValue(new Error("db down"));

        const res = await POST(
            makePost({ "x-user-id": "u1" }, { designId: "d1" })
        );

        expect(res.status).toBe(500);
        await expect(res.json()).resolves.toEqual({
            success: false,
            error: "Internal server error",
        });
    });
});
