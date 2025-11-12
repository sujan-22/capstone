/** @jest-environment node */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextRequest } from "next/server";
import { pool } from "@/lib/database/db";

// ---- Mocks (must run before importing the route) ----
jest.mock("@/lib/database/db", () => ({
    pool: { connect: jest.fn() },
}));

// Mock session to avoid loading better-auth/ESM
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

// sharp(buffer).metadata() -> Promise<{width, height}>
const mockMetadata = jest.fn();
jest.mock("sharp", () =>
    jest.fn().mockImplementation(() => ({
        metadata: (...args: any[]) => mockMetadata(...args),
    }))
);

function makePost(
    headers?: Record<string, string>,
    body?: unknown
): NextRequest {
    const req = new Request("http://localhost/api/gallery/use-image", {
        method: "POST",
        headers: { "content-type": "application/json", ...(headers || {}) },
        body: body === undefined ? undefined : JSON.stringify(body),
    });
    return req as unknown as NextRequest;
}

describe("POST /api/gallery/use-image", () => {
    let mockQuery: jest.Mock;
    let mockRelease: jest.Mock;
    let mockConnect: jest.Mock;

    beforeEach(() => {
        mockQuery = jest.fn();
        mockRelease = jest.fn();
        mockConnect = jest
            .fn()
            .mockResolvedValue({ query: mockQuery, release: mockRelease });
        (pool.connect as unknown as jest.Mock) = mockConnect;

        // default fetch mock
        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            arrayBuffer: async () => new ArrayBuffer(16),
        });

        mockMetadata.mockReset();
        mockMetadata.mockResolvedValue({ width: 800, height: 600 });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("401 when session has no user", async () => {
        setSession(undefined);
        const { POST } = await import("./route");

        const res = await POST(makePost({}, { gallery_image_id: "g1" }));
        expect(res.status).toBe(401);
        await expect(res.json()).resolves.toEqual({ error: "Unauthorized" });
        expect(mockConnect).not.toHaveBeenCalled();
    });

    it("400 when JSON body is invalid/missing", async () => {
        setSession("u1");
        const { POST } = await import("./route");

        const req = new Request("http://localhost/api/gallery/use-image", {
            method: "POST",
            headers: {
                /* no content-type/body on purpose */
            },
        }) as unknown as NextRequest;

        const res = await POST(req);
        expect(res.status).toBe(400);
        await expect(res.json()).resolves.toEqual({
            error: "Invalid or missing JSON body.",
        });
        expect(mockConnect).not.toHaveBeenCalled();
    });

    it("400 when gallery_image_id is missing", async () => {
        setSession("u1");
        const { POST } = await import("./route");

        const res = await POST(makePost({}, { imageUrl: "/x.jpg" }));
        expect(res.status).toBe(400);
        await expect(res.json()).resolves.toEqual({
            error: "Missing gallery_image_id in request body.",
        });
        expect(mockConnect).not.toHaveBeenCalled();
    });

    it("uses default dimensions when imageUrl absent or unreadable", async () => {
        setSession("u1");
        const { POST } = await import("./route");

        mockQuery
            .mockResolvedValueOnce(undefined) // BEGIN
            .mockResolvedValueOnce({
                rowCount: 1,
                rows: [{ id: "pm1", model_name: "Phone X" }],
            })
            .mockResolvedValueOnce({
                rowCount: 1,
                rows: [{ id: "mat1", name: "Matte" }],
            })
            .mockResolvedValueOnce({
                rowCount: 1,
                rows: [{ id: "col1", name: "Black" }],
            })
            .mockResolvedValueOnce({
                rowCount: 1,
                rows: [{ id: "fin1", name: "Soft" }],
            })
            .mockResolvedValueOnce({ rows: [{ id: "new-design-1" }] }) // INSERT
            .mockResolvedValueOnce(undefined); // COMMIT

        const res = await POST(makePost({}, { gallery_image_id: "g1" }));

        expect(res.status).toBe(200);
        await expect(res.json()).resolves.toEqual({ id: "new-design-1" });

        const insertCall = mockQuery.mock.calls.find((c) =>
            /INSERT\s+INTO\s+case_design/i.test(String(c[0]))
        );
        const insertParams = insertCall![1] as any[];
        expect(insertParams[7]).toBe(500); // width default
        expect(insertParams[8]).toBe(500); // height default
        expect(mockRelease).toHaveBeenCalled();
    });

    it("reads imageUrl and uses sharp metadata dimensions", async () => {
        setSession("u1");
        const { POST } = await import("./route");

        mockQuery
            .mockResolvedValueOnce(undefined)
            .mockResolvedValueOnce({
                rowCount: 1,
                rows: [{ id: "pm1", model_name: "Phone X" }],
            })
            .mockResolvedValueOnce({
                rowCount: 1,
                rows: [{ id: "mat1", name: "Matte" }],
            })
            .mockResolvedValueOnce({
                rowCount: 1,
                rows: [{ id: "col1", name: "Black" }],
            })
            .mockResolvedValueOnce({
                rowCount: 1,
                rows: [{ id: "fin1", name: "Soft" }],
            })
            .mockResolvedValueOnce({ rows: [{ id: "new-design-2" }] })
            .mockResolvedValueOnce(undefined);

        const res = await POST(
            makePost(
                {},
                { gallery_image_id: "g1", imageUrl: "https://cdn/img.jpg" }
            )
        );

        expect(res.status).toBe(200);
        await expect(res.json()).resolves.toEqual({ id: "new-design-2" });

        const insertCall = mockQuery.mock.calls.find((c) =>
            /INSERT\s+INTO\s+case_design/i.test(String(c[0]))
        );
        const insertParams = insertCall![1] as any[];
        expect(insertParams[7]).toBe(800);
        expect(insertParams[8]).toBe(600);
        expect(mockRelease).toHaveBeenCalled();
    });

    it("rolls back if any reference table is empty", async () => {
        setSession("u1");
        const { POST } = await import("./route");

        mockQuery
            .mockResolvedValueOnce(undefined) // BEGIN
            .mockResolvedValueOnce({ rowCount: 0, rows: [] }) // phone_model empty
            .mockResolvedValueOnce(undefined); // ROLLBACK

        const res = await POST(makePost({}, { gallery_image_id: "g1" }));

        expect(res.status).toBe(500);
        await expect(res.json()).resolves.toEqual({
            error: "One or more reference tables are empty. Need at least one phone_model, case_material, case_color, and case_finish.",
        });

        const queries = mockQuery.mock.calls.map((c) => String(c[0]));
        expect(queries.some((q) => /^ROLLBACK/i.test(q))).toBe(true);
        expect(mockRelease).toHaveBeenCalled();
    });

    it("500 + rollback when insert fails mid-transaction", async () => {
        setSession("u1");
        const { POST } = await import("./route");

        mockQuery
            .mockResolvedValueOnce(undefined) // BEGIN
            .mockResolvedValueOnce({
                rowCount: 1,
                rows: [{ id: "pm1", model_name: "Phone X" }],
            })
            .mockResolvedValueOnce({
                rowCount: 1,
                rows: [{ id: "mat1", name: "Matte" }],
            })
            .mockResolvedValueOnce({
                rowCount: 1,
                rows: [{ id: "col1", name: "Black" }],
            })
            .mockResolvedValueOnce({
                rowCount: 1,
                rows: [{ id: "fin1", name: "Soft" }],
            })
            .mockRejectedValueOnce(new Error("insert failed")) // INSERT throws
            .mockResolvedValueOnce(undefined); // ROLLBACK

        const res = await POST(
            makePost({}, { gallery_image_id: "g1", imageUrl: "http://img" })
        );

        expect(res.status).toBe(500);
        const json = await res.json();
        expect(json.error).toBe("DB operation failed");
        expect(String(json.details)).toMatch(/insert failed/);

        const queries = mockQuery.mock.calls.map((c) => String(c[0]));
        expect(queries.some((q) => /^ROLLBACK/i.test(q))).toBe(true);
        expect(mockRelease).toHaveBeenCalled();
    });

    it("gracefully handles fetch/sharp failures and still inserts with defaults", async () => {
        setSession("u1");
        const { POST } = await import("./route");

        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: false,
            status: 404,
            statusText: "Not Found",
        });
        mockMetadata.mockRejectedValueOnce(new Error("sharp failed"));

        mockQuery
            .mockResolvedValueOnce(undefined)
            .mockResolvedValueOnce({
                rowCount: 1,
                rows: [{ id: "pm1", model_name: "Phone X" }],
            })
            .mockResolvedValueOnce({
                rowCount: 1,
                rows: [{ id: "mat1", name: "Matte" }],
            })
            .mockResolvedValueOnce({
                rowCount: 1,
                rows: [{ id: "col1", name: "Black" }],
            })
            .mockResolvedValueOnce({
                rowCount: 1,
                rows: [{ id: "fin1", name: "Soft" }],
            })
            .mockResolvedValueOnce({ rows: [{ id: "new-design-3" }] })
            .mockResolvedValueOnce(undefined);

        const res = await POST(
            makePost(
                {},
                { gallery_image_id: "g1", imageUrl: "https://bad/url.jpg" }
            )
        );

        expect(res.status).toBe(200);
        await expect(res.json()).resolves.toEqual({ id: "new-design-3" });

        const insertCall = mockQuery.mock.calls.find((c) =>
            /INSERT\s+INTO\s+case_design/i.test(String(c[0]))
        );
        const insertParams = insertCall![1] as any[];
        expect(insertParams[7]).toBe(500);
        expect(insertParams[8]).toBe(500);
        expect(mockRelease).toHaveBeenCalled();
    });

    it("500 when an unexpected outer error occurs", async () => {
        setSession("u1");
        const { POST } = await import("./route");

        const badReq = {
            json: () => {
                throw new Error("boom");
            },
            headers: new Headers(),
        } as unknown as NextRequest;

        const res = await POST(badReq);
        expect(res.status).toBe(500);
        const j = await res.json();
        expect(j.error).toBe("Failed to upload file.");
        expect(String(j.details)).toMatch(/boom/);
    });
});
