/** @jest-environment node */

import { NextRequest } from "next/server";
import { pool } from "@/lib/database/db";

jest.mock("@/lib/database/db", () => ({
    pool: { connect: jest.fn() },
}));

// ⬇️ Mock the session module to avoid loading better-auth/ESM
jest.mock("@/hooks/use-session", () => ({
    getServerSideSession: jest.fn(),
}));
const { getServerSideSession } = jest.requireMock("@/hooks/use-session") as {
    getServerSideSession: jest.Mock<Promise<{ user: { id: string } | null }>>;
};

function setSession(userId?: string) {
    getServerSideSession.mockResolvedValue(
        userId ? { user: { id: userId } } : { user: null }
    );
}

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
        // missing both
        setSession(undefined);
        const { POST } = await import("./route");
        const r1 = await POST(makePost({}));
        expect(r1.status).toBe(400);
        await expect(r1.json()).resolves.toEqual({
            error: "Missing userId or caseDesignId",
        });

        // missing caseDesignId
        setSession("u1");
        const r2 = await POST(makePost({ userId: "u1" })); // body.userId is ignored by route
        expect(r2.status).toBe(400);
        await expect(r2.json()).resolves.toEqual({
            error: "Missing userId or caseDesignId",
        });

        // missing userId
        setSession(undefined);
        const r3 = await POST(makePost({ caseDesignId: "cd1" }));
        expect(r3.status).toBe(400);
        await expect(r3.json()).resolves.toEqual({
            error: "Missing userId or caseDesignId",
        });

        expect(pool.connect).not.toHaveBeenCalled();
    });

    it("returns 404 when case design not found", async () => {
        setSession("u1");

        const release = jest.fn();
        const query = jest.fn().mockResolvedValueOnce({ rows: [] });

        (pool.connect as jest.Mock).mockResolvedValue({ query, release });

        const { POST } = await import("./route");
        const res = await POST(makePost({ caseDesignId: "cd-missing" }));

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
        setSession("u1");

        const release = jest.fn();
        const query = jest.fn().mockResolvedValueOnce({
            rows: [{ favorited_by_user_ids: ["u1", "u2"], total_favorites: 2 }],
        });

        (pool.connect as jest.Mock).mockResolvedValue({ query, release });

        const { POST } = await import("./route");
        const res = await POST(makePost({ caseDesignId: "cd1" }));

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
        setSession("u1");

        const release = jest.fn();
        const query = jest.fn().mockResolvedValueOnce({
            rows: [{ favorited_by_user_ids: ["u2", "u3"], total_favorites: 2 }],
        });

        (pool.connect as jest.Mock).mockResolvedValue({ query, release });

        const { POST } = await import("./route");
        const res = await POST(makePost({ caseDesignId: "cd1" }));

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
        setSession("u1");

        const release = jest.fn();
        const query = jest
            .fn()
            .mockRejectedValueOnce(new Error("update failed"));

        (pool.connect as jest.Mock).mockResolvedValue({ query, release });

        const { POST } = await import("./route");
        const res = await POST(makePost({ caseDesignId: "cd1" }));

        expect(query).toHaveBeenCalledTimes(1);
        expect(res.status).toBe(500);
        await expect(res.json()).resolves.toEqual({
            error: "Failed to update favorite",
        });
        expect(release).toHaveBeenCalled();
    });
});
