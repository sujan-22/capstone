/** @jest-environment node */

import { NextRequest } from "next/server";
import { POST } from "./route";
import { pool } from "@/lib/database/db";

jest.mock("@/lib/database/db", () => ({
    pool: { connect: jest.fn() },
}));

function makePost(body?: unknown): NextRequest {
    const req = new Request("http://localhost/api/favorite", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: body === undefined ? undefined : JSON.stringify(body),
    });
    return req as unknown as NextRequest;
}

describe("POST /api/favorite", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it("returns 400 when userId or caseDesignId is missing", async () => {
        // Missing both
        const r1 = await POST(makePost({}));
        expect(r1.status).toBe(400);
        await expect(r1.json()).resolves.toEqual({
            error: "Missing userId or caseDesignId",
        });

        // Missing caseDesignId
        const r2 = await POST(makePost({ userId: "u1" }));
        expect(r2.status).toBe(400);
        await expect(r2.json()).resolves.toEqual({
            error: "Missing userId or caseDesignId",
        });

        // Missing userId
        const r3 = await POST(makePost({ caseDesignId: "cd1" }));
        expect(r3.status).toBe(400);
        await expect(r3.json()).resolves.toEqual({
            error: "Missing userId or caseDesignId",
        });

        expect(pool.connect).not.toHaveBeenCalled();
    });

    it("returns 404 when case design not found", async () => {
        const release = jest.fn();
        const query = jest.fn().mockResolvedValueOnce({ rows: [] }); // no rows returned

        (pool.connect as jest.Mock).mockResolvedValue({
            query,
            release,
        });

        const res = await POST(
            makePost({ userId: "u1", caseDesignId: "cd-missing" })
        );

        // Ensure correct SQL shape and parameters
        expect(query).toHaveBeenCalledTimes(1);
        const [sql, params] = query.mock.calls[0];
        expect(sql).toMatch(/UPDATE\s+case_design/i);
        expect(params).toEqual(["cd-missing", "u1"]);

        expect(res.status).toBe(404);
        await expect(res.json()).resolves.toEqual({
            error: "Case design not found",
        });
        expect(release).toHaveBeenCalled();
    });

    it("toggles to 'added' when userId is present in returned array", async () => {
        const release = jest.fn();

        const query = jest.fn().mockResolvedValueOnce({
            rows: [
                {
                    favorited_by_user_ids: ["u1", "u2"], // includes calling user
                    total_favorites: 2,
                },
            ],
        });

        (pool.connect as jest.Mock).mockResolvedValue({
            query,
            release,
        });

        const res = await POST(makePost({ userId: "u1", caseDesignId: "cd1" }));

        expect(query).toHaveBeenCalledTimes(1);
        const [sql, params] = query.mock.calls[0];
        expect(sql).toMatch(/UPDATE\s+case_design/i);
        expect(params).toEqual(["cd1", "u1"]);

        expect(res.status).toBe(200);
        await expect(res.json()).resolves.toEqual({
            success: true,
            action: "added",
            totalFavorites: 2,
        });
        expect(release).toHaveBeenCalled();
    });

    it("toggles to 'removed' when userId is absent in returned array", async () => {
        const release = jest.fn();

        const query = jest.fn().mockResolvedValueOnce({
            rows: [
                {
                    favorited_by_user_ids: ["u2", "u3"], // does NOT include calling user
                    total_favorites: 2,
                },
            ],
        });

        (pool.connect as jest.Mock).mockResolvedValue({
            query,
            release,
        });

        const res = await POST(makePost({ userId: "u1", caseDesignId: "cd1" }));

        expect(query).toHaveBeenCalledTimes(1);
        const [sql, params] = query.mock.calls[0];
        expect(sql).toMatch(/UPDATE\s+case_design/i);
        expect(params).toEqual(["cd1", "u1"]);

        expect(res.status).toBe(200);
        await expect(res.json()).resolves.toEqual({
            success: true,
            action: "removed",
            totalFavorites: 2,
        });
        expect(release).toHaveBeenCalled();
    });

    it("returns 500 when an error occurs during update", async () => {
        const release = jest.fn();
        const query = jest
            .fn()
            .mockRejectedValueOnce(new Error("update failed"));

        (pool.connect as jest.Mock).mockResolvedValue({
            query,
            release,
        });

        const res = await POST(makePost({ userId: "u1", caseDesignId: "cd1" }));

        expect(query).toHaveBeenCalledTimes(1);
        expect(res.status).toBe(500);
        await expect(res.json()).resolves.toEqual({
            error: "Failed to update favorite",
        });
        expect(release).toHaveBeenCalled();
    });
});
