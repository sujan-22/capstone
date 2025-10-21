/** @jest-environment node */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextRequest } from "next/server";
import { POST } from "./route";
import { pool } from "@/lib/database/db";

jest.mock("@/lib/database/db", () => ({
    pool: { connect: jest.fn() },
}));

function makePost(
    headers?: Record<string, string>,
    body?: unknown
): NextRequest {
    const req = new Request("http://localhost/api/buy-now/d1", {
        method: "POST",
        headers: {
            "content-type": "application/json",
            ...(headers || {}),
        },
        body: body === undefined ? undefined : JSON.stringify(body),
    });

    return req as unknown as NextRequest;
}

describe("POST /api/buy-now/[designId]", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it("returns 400 when designId or userId is missing", async () => {
        const res1 = await POST(makePost({ "x-user-id": "u1" }), {
            params: Promise.resolve({ designId: "" as any }),
        });
        expect(res1.status).toBe(400);
        await expect(res1.json()).resolves.toEqual({
            error: "Missing credentials",
        });

        const res2 = await POST(makePost(), {
            params: Promise.resolve({ designId: "d1" }),
        });
        expect(res2.status).toBe(400);
        await expect(res2.json()).resolves.toEqual({
            error: "Missing credentials",
        });
        expect(pool.connect).not.toHaveBeenCalled();
    });

    it("returns 404 when design not found", async () => {
        const release = jest.fn();
        const query = jest
            .fn()
            .mockResolvedValueOnce({ rowCount: 0 }) // SELECT returns no rows
            // these won't be called, but keep placeholders to avoid undefined errors if called
            .mockResolvedValueOnce({ rows: [] });

        const begin = jest.fn().mockResolvedValue(undefined);
        const commit = jest.fn().mockResolvedValue(undefined);
        const rollback = jest.fn().mockResolvedValue(undefined);

        (pool.connect as jest.Mock).mockResolvedValue({
            query: (sql: string, params?: any[]) => {
                if (/^BEGIN/i.test(sql)) return begin();
                if (/^COMMIT/i.test(sql)) return commit();
                if (/^ROLLBACK/i.test(sql)) return rollback();
                return query(sql, params);
            },
            release,
        });

        const res = await POST(makePost({ "x-user-id": "user-123" }), {
            params: Promise.resolve({ designId: "d-missing" }),
        });

        expect(begin).toHaveBeenCalled();
        expect(query).toHaveBeenCalledWith(expect.stringMatching(/SELECT/i), [
            "d-missing",
        ]);
        expect(rollback).toHaveBeenCalled();
        expect(commit).not.toHaveBeenCalled();
        expect(release).toHaveBeenCalled();

        expect(res.status).toBe(404);
        await expect(res.json()).resolves.toEqual({
            error: "Design not found",
        });
    });

    it("duplicates a design and returns newDesignId on success", async () => {
        const release = jest.fn();

        const begin = jest.fn().mockResolvedValue(undefined);
        const commit = jest.fn().mockResolvedValue(undefined);
        const rollback = jest.fn().mockResolvedValue(undefined);

        const selectRow = {
            phone_model_id: "pm1",
            case_material_id: "mat1",
            case_color_id: "col1",
            case_finish_id: "fin1",
            width: 100,
            height: 200,
            name: "Cool Case",
            image: "/img.jpg",
            gallery_image_id: "g1",
        };

        const query = jest
            .fn()
            .mockResolvedValueOnce({ rowCount: 1, rows: [selectRow] }) // SELECT old design
            .mockResolvedValueOnce({ rows: [{ id: "new-design-123" }] }); // INSERT returning id

        (pool.connect as jest.Mock).mockResolvedValue({
            query: (sql: string, params?: any[]) => {
                if (/^BEGIN/i.test(sql)) return begin();
                if (/^COMMIT/i.test(sql)) return commit();
                if (/^ROLLBACK/i.test(sql)) return rollback();
                return query(sql, params);
            },
            release,
        });

        const res = await POST(makePost({ "x-user-id": "user-123" }), {
            params: Promise.resolve({ designId: "d1" }),
        });

        expect(begin).toHaveBeenCalled();
        expect(query).toHaveBeenNthCalledWith(
            1,
            expect.stringMatching(/SELECT[\s\S]*FROM\s+case_design/i),
            ["d1"]
        );
        expect(query).toHaveBeenNthCalledWith(
            2,
            expect.stringMatching(
                /INSERT\s+INTO\s+case_design[\s\S]*RETURNING\s+id/i
            ),
            [
                "user-123",
                "pm1",
                "mat1",
                "col1",
                "fin1",
                100,
                200,
                "Cool Case",
                "/img.jpg",
                "g1",
            ]
        );
        expect(commit).toHaveBeenCalled();
        expect(rollback).not.toHaveBeenCalled();
        expect(release).toHaveBeenCalled();

        expect(res.status).toBe(200);
        await expect(res.json()).resolves.toEqual({
            success: true,
            message: "Design duplicated successfully",
            newDesignId: "new-design-123",
        });
    });

    it("returns 500 and rolls back when an error occurs mid-transaction", async () => {
        const release = jest.fn();
        const begin = jest.fn().mockResolvedValue(undefined);
        const commit = jest.fn().mockResolvedValue(undefined);
        const rollback = jest.fn().mockResolvedValue(undefined);

        const query = jest
            .fn()
            .mockResolvedValueOnce({
                rowCount: 1,
                rows: [
                    {
                        phone_model_id: "pm1",
                        case_material_id: "mat1",
                        case_color_id: "col1",
                        case_finish_id: "fin1",
                        width: 100,
                        height: 200,
                        name: "Cool Case",
                        image: "/img.jpg",
                        gallery_image_id: "g1",
                    },
                ],
            })
            .mockRejectedValueOnce(new Error("insert failed"));

        (pool.connect as jest.Mock).mockResolvedValue({
            query: (sql: string, params?: any[]) => {
                if (/^BEGIN/i.test(sql)) return begin();
                if (/^COMMIT/i.test(sql)) return commit();
                if (/^ROLLBACK/i.test(sql)) return rollback();
                return query(sql, params);
            },
            release,
        });

        const res = await POST(makePost({ "x-user-id": "user-123" }), {
            params: Promise.resolve({ designId: "d1" }),
        });

        expect(begin).toHaveBeenCalled();
        expect(rollback).toHaveBeenCalled();
        expect(commit).not.toHaveBeenCalled();
        expect(release).toHaveBeenCalled();

        expect(res.status).toBe(500);
        await expect(res.json()).resolves.toEqual({
            error: "Failed to duplicate design",
        });
    });
});
