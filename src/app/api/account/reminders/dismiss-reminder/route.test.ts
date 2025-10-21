/** @jest-environment node */

import { pool } from "@/lib/database/db";
import { POST } from "./route";
import { NextRequest } from "next/server";

jest.mock("@/lib/database/db", () => ({
    pool: { connect: jest.fn() },
}));

function makePost(
    headers?: Record<string, string>,
    body?: unknown
): NextRequest {
    const req = new Request(
        "http://localhost/api/account/reminders/dismiss-reminder",
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

describe("POST /api/account/reminders/dismiss-reminder", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it("returns 401 when x-user-id header is missing", async () => {
        const res = await POST(makePost());
        expect(res.status).toBe(401);
        await expect(res.json()).resolves.toEqual({
            error: "Not authenticated",
        });
        expect(pool.connect).not.toHaveBeenCalled();
    });

    it("returns 400 when reminderId is missing", async () => {
        const res = await POST(makePost({ "x-user-id": "u1" }, {}));
        expect(res.status).toBe(400);
        await expect(res.json()).resolves.toEqual({
            error: "reminderId is required",
        });
        expect(pool.connect).not.toHaveBeenCalled();
    });

    it("returns 404 when reminder not found or not owned by user", async () => {
        const release = jest.fn();
        const query = jest.fn().mockResolvedValue({ rowCount: 0 });
        (pool.connect as jest.Mock).mockResolvedValue({ query, release });

        const res = await POST(
            makePost({ "x-user-id": "u1" }, { reminderId: "r1" })
        );

        expect(pool.connect).toHaveBeenCalled();
        expect(query).toHaveBeenCalledTimes(1);
        expect(release).toHaveBeenCalled();
        expect(res.status).toBe(404);
        await expect(res.json()).resolves.toEqual({
            error: "Reminder not found or not owned by user",
        });
    });

    it("returns 200 on successful dismiss", async () => {
        const release = jest.fn();
        const query = jest.fn().mockResolvedValue({ rowCount: 1 });
        (pool.connect as jest.Mock).mockResolvedValue({ query, release });

        const res = await POST(
            makePost({ "x-user-id": "u1" }, { reminderId: "r1" })
        );

        expect(pool.connect).toHaveBeenCalled();
        expect(query).toHaveBeenCalledWith(expect.any(String), ["r1", "u1"]);
        expect(release).toHaveBeenCalled();
        expect(res.status).toBe(200);
        await expect(res.json()).resolves.toEqual({
            success: true,
            message: "Reminder dismissed successfully.",
        });
    });

    it("returns 500 on server error", async () => {
        (pool.connect as jest.Mock).mockRejectedValue(new Error("db down"));

        const res = await POST(
            makePost({ "x-user-id": "u1" }, { reminderId: "r1" })
        );

        expect(res.status).toBe(500);
        await expect(res.json()).resolves.toEqual({
            error: "Internal server error",
        });
    });
});
