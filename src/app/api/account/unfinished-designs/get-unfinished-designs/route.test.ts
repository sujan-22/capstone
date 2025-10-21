/** @jest-environment node */

import { pool } from "@/lib/database/db";
import { GET } from "./route";
import type { NextRequest } from "next/server";

jest.mock("@/lib/database/db", () => ({
    pool: { connect: jest.fn() },
}));

function makeGet(headers?: Record<string, string>): NextRequest {
    const req = new Request(
        "http://localhost/api/account/get-unfinished-design",
        {
            method: "GET",
            headers: { ...(headers || {}) },
        }
    );
    return req as unknown as NextRequest;
}

describe("GET /api/account/get-unfinished-design", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it("returns 401 when x-user-id header is missing", async () => {
        const res = await GET(makeGet());
        expect(res.status).toBe(401);
        await expect(res.json()).resolves.toEqual({
            error: "Not authenticated",
        });
        expect(pool.connect).not.toHaveBeenCalled();
    });

    it("returns mapped unfinished designs for authenticated user", async () => {
        const release = jest.fn();
        const rows = [
            {
                id: "d1",
                imgsrc: "/img1.jpg",
                cropped_image_url: "/crop1.jpg",
                case_name: "Nebula",
                modelname: "iPhone 15 Pro",
                color: "Black",
                material: "Polycarbonate",
                finish: "Matte",
                created_at: "2024-02-01T10:00:00.000Z",
                updated_at: "2024-02-02T11:00:00.000Z",
                reminder_id: "r1",
                reminder_status: "dismissed",
                reminder_sent_count: "3",
                last_sent_at: "2024-02-02T09:00:00.000Z",
                dismissed_at: "2024-02-02T12:00:00.000Z",
            },
            {
                id: "d2",
                imgsrc: "/img2.jpg",
                cropped_image_url: null,
                case_name: "Aurora",
                modelname: "Pixel 8",
                color: "White",
                material: "TPU",
                finish: "Glossy",
                created_at: "2024-03-05T08:30:00.000Z",
                updated_at: null,
                reminder_id: "r2",
                reminder_status: "pending",
                reminder_sent_count: 0,
                last_sent_at: null,
                dismissed_at: null,
            },
        ];

        const query = jest.fn().mockResolvedValue({ rows });
        (pool.connect as jest.Mock).mockResolvedValue({ query, release });

        const res = await GET(makeGet({ "x-user-id": "user-123" }));

        expect(pool.connect).toHaveBeenCalled();
        expect(query).toHaveBeenCalledTimes(1);
        expect(release).toHaveBeenCalled();

        expect(res.status).toBe(200);
        await expect(res.json()).resolves.toEqual({
            unfinishedDesigns: [
                {
                    id: "d1",
                    imgSrc: "/img1.jpg",
                    croppedImgUrl: "/crop1.jpg",
                    caseName: "Nebula",
                    modelName: "iPhone 15 Pro",
                    color: "Black",
                    material: "Polycarbonate",
                    finish: "Matte",
                    createdAt: "2024-02-01T10:00:00.000Z",
                    updatedAt: "2024-02-02T11:00:00.000Z",
                    reminderCount: 3,
                    lastReminderSentAt: "2024-02-02T09:00:00.000Z",
                    hasDismissed: true,
                },
                {
                    id: "d2",
                    imgSrc: "/img2.jpg",
                    croppedImgUrl: null,
                    caseName: "Aurora",
                    modelName: "Pixel 8",
                    color: "White",
                    material: "TPU",
                    finish: "Glossy",
                    createdAt: "2024-03-05T08:30:00.000Z",
                    updatedAt: "",
                    reminderCount: 0,
                    lastReminderSentAt: null,
                    hasDismissed: false,
                },
            ],
        });
    });

    it("returns empty list when no unfinished designs", async () => {
        const release = jest.fn();
        const query = jest.fn().mockResolvedValue({ rows: [] });
        (pool.connect as jest.Mock).mockResolvedValue({ query, release });

        const res = await GET(makeGet({ "x-user-id": "user-123" }));
        expect(res.status).toBe(200);
        await expect(res.json()).resolves.toEqual({ unfinishedDesigns: [] });
        expect(release).toHaveBeenCalled();
    });

    it("returns 500 when db connect fails", async () => {
        (pool.connect as jest.Mock).mockRejectedValue(new Error("db down"));
        const res = await GET(makeGet({ "x-user-id": "user-123" }));
        expect(res.status).toBe(500);
        await expect(res.json()).resolves.toEqual({
            error: "Internal server error",
        });
    });
});
