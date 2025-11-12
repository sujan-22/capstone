/**
 * @jest-environment node
 */

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

describe("GET /api/account/reminders/get-reminders", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it("returns 401 when not authenticated", async () => {
        setSession(undefined);

        // Import AFTER mocks so better-auth never loads
        const { GET } = await import("./route");

        const res = await GET();
        expect(res.status).toBe(401);
        await expect(res.json()).resolves.toEqual({
            error: "Not authenticated",
        });
        expect(pool.connect).not.toHaveBeenCalled();
    });

    it("returns reminders for authenticated user", async () => {
        setSession("u1");

        const release = jest.fn();
        const rows = [
            {
                reminder_id: "r1",
                user_id: "u1",
                case_design_id: "cd1",
                status: "pending",
                reminder_sent_count: 2,
                last_sent_at: "2025-01-01T10:00:00.000Z",
                dismissed_at: null,
                created_at: "2025-01-01T09:00:00.000Z",
                updated_at: "2025-01-02T09:00:00.000Z",
                case_name: "Galaxy Case",
                imgsrc: "/img1.jpg",
                cropped_image_url: "/crop1.jpg",
                modelname: "iPhone 15 Pro",
                color: "Black",
                material: "Plastic",
                finish: "Matte",
            },
        ];
        const query = jest.fn().mockResolvedValue({ rows });
        (pool.connect as jest.Mock).mockResolvedValue({ query, release });

        const { GET } = await import("./route");

        const res = await GET();

        expect(pool.connect).toHaveBeenCalled();
        expect(query).toHaveBeenCalledWith(expect.any(String), ["u1"]);
        expect(release).toHaveBeenCalled();
        expect(res.status).toBe(200);

        await expect(res.json()).resolves.toEqual({
            reminders: [
                {
                    id: "r1",
                    userId: "u1",
                    caseDesignId: "cd1",
                    status: "pending",
                    croppedImgUrl: "/crop1.jpg",
                    reminderSentCount: 2,
                    lastSentAt: "2025-01-01T10:00:00.000Z",
                    dismissedAt: null,
                    createdAt: "2025-01-01T09:00:00.000Z",
                    updatedAt: "2025-01-02T09:00:00.000Z",
                    caseName: "Galaxy Case",
                    imgSrc: "/img1.jpg",
                    modelName: "iPhone 15 Pro",
                    color: "Black",
                    material: "Plastic",
                    finish: "Matte",
                },
            ],
        });
    });

    it("returns empty array when no reminders", async () => {
        setSession("u1");

        const release = jest.fn();
        const query = jest.fn().mockResolvedValue({ rows: [] });
        (pool.connect as jest.Mock).mockResolvedValue({ query, release });

        const { GET } = await import("./route");

        const res = await GET();
        expect(res.status).toBe(200);
        await expect(res.json()).resolves.toEqual({ reminders: [] });
    });

    it("returns 500 on server error", async () => {
        setSession("u1");
        (pool.connect as jest.Mock).mockRejectedValue(new Error("db down"));

        const { GET } = await import("./route");

        const res = await GET();
        expect(res.status).toBe(500);
        await expect(res.json()).resolves.toEqual({
            error: "Internal server error",
        });
    });
});
