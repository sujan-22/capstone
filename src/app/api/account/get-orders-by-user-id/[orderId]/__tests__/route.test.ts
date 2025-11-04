/** @jest-environment node */
/* eslint-disable @typescript-eslint/no-explicit-any */

// 1) Mock first — before importing the route
jest.mock("@/hooks/use-session", () => ({
    getServerSideSession: jest.fn(),
}));

jest.mock("@/lib/database/db", () => ({
    pool: { connect: jest.fn() },
}));

// 2) Now import modules that depend on the mocks
import { makeReq } from "@/lib/test/api";
import type { PoolClient } from "pg";

// Pull the mocked fns so we can set return values per test
import { getServerSideSession } from "@/hooks/use-session";
const mockedGetSession = getServerSideSession as jest.Mock;

import { pool } from "@/lib/database/db";
const mockedPoolConnect = pool.connect as unknown as jest.Mock;

// Import the route AFTER mocks
import { GET } from "../route";

// Helper for route params
const withParams = (orderId?: string) =>
    ({ params: Promise.resolve(orderId ? { orderId } : ({} as any)) } as any);

describe("GET /api/account/get-orders-by-user-id/[orderId]", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it("returns 401 when user session is missing", async () => {
        mockedGetSession.mockResolvedValue({ user: null }); // <- drives 401
        const res = await GET(makeReq(), withParams("o1"));
        expect(res.status).toBe(401);
        await expect(res.json()).resolves.toEqual({
            error: "Not authenticated",
        });
        expect(pool.connect).not.toHaveBeenCalled();
    });

    it("returns 401 when order id param is missing", async () => {
        mockedGetSession.mockResolvedValue({
            user: { id: "user-123", role: "user" },
        });
        const res = await GET(
            makeReq({ "x-user-id": "user-123" }),
            withParams()
        );
        expect(res.status).toBe(401);
        await expect(res.json()).resolves.toEqual({
            error: "Order id not found",
        });
        expect(pool.connect).not.toHaveBeenCalled();
    });

    it("returns 404 when order not found", async () => {
        mockedGetSession.mockResolvedValue({
            user: { id: "user-123", role: "user" },
        });

        const mockRelease = jest.fn();
        const mockQuery = jest.fn().mockResolvedValue({ rows: [] });

        mockedPoolConnect.mockResolvedValue({
            query: mockQuery,
            release: mockRelease,
        } as unknown as PoolClient);

        const res = await GET(
            makeReq({ "x-user-id": "user-123" }),
            withParams("o-missing")
        );

        expect(pool.connect).toHaveBeenCalled();
        expect(mockQuery).toHaveBeenCalledTimes(1);
        expect(mockRelease).toHaveBeenCalled();
        expect(res.status).toBe(404);
        await expect(res.json()).resolves.toEqual({ error: "Order not found" });
    });

    it("returns 403 when order is not paid", async () => {
        mockedGetSession.mockResolvedValue({
            user: { id: "user-123", role: "user" },
        });

        const mockRelease = jest.fn();
        const rows = [
            {
                order_id: "o1",
                user_id: "user-123",
                order_number: "ORD-0001",
                case_design_id: "d1",
                sub_total: "50.5",
                tax: "6.57",
                total_amount: "57.07",
                order_status: "processing",
                tracking_number: null,
                billing_address_id: null,
                shipping_address_id: null,
                order_createdat: "2024-01-01T12:00:00.000Z",
                order_updatedat: "2024-01-01T13:00:00.000Z",
                is_paid: false,

                design_id: "d1",
                imgSrc: "/img1.jpg",
                cropped_image_url: "/crop1.jpg",
                caseName: "Nebula",
                hasRequestedToSharePublicly: false,
                isSharedPublicly: false,
                modelName: "iPhone 15 Pro",
                color: "Black",
                colorHex: "#000000",
                material: "Polycarbonate",
                finish: "Matte",
                price: "59.99",

                billing_id: null,
                billing_name: null,
                billing_street: null,
                billing_city: null,
                billing_postal_code: null,
                billing_country: null,
                billing_state: null,
                billing_phone_number: null,
                shipping_id: null,
                shipping_name: null,
                shipping_street: null,
                shipping_city: null,
                shipping_postal_code: null,
                shipping_country: null,
                shipping_state: null,
                shipping_phone_number: null,
            },
        ];

        const mockQuery = jest.fn().mockResolvedValue({ rows });

        mockedPoolConnect.mockResolvedValue({
            query: mockQuery,
            release: mockRelease,
        } as unknown as PoolClient);

        const res = await GET(
            makeReq({ "x-user-id": "user-123" }),
            withParams("o1")
        );

        expect(res.status).toBe(403);
        await expect(res.json()).resolves.toEqual({
            success: false,
            error: "Order not paid",
            reason: "The payment for this order has not been completed.",
        });
    });

    it("returns 200 with normalized order when paid", async () => {
        mockedGetSession.mockResolvedValue({
            user: { id: "user-123", role: "user" },
        });

        const mockRelease = jest.fn();
        const rows = [
            {
                order_id: "o1",
                user_id: "user-123",
                order_number: "ORD-0001",
                case_design_id: "d1",
                sub_total: "50.5",
                tax: "6.57",
                total_amount: "57.07",
                order_status: "paid",
                tracking_number: "TRACK123",
                billing_address_id: "b1",
                shipping_address_id: "s1",
                order_createdat: "2024-01-01T12:00:00.000Z",
                order_updatedat: "2024-01-02T13:00:00.000Z",
                is_paid: true,

                design_id: "d1",
                imgSrc: "/img1.jpg",
                cropped_image_url: "/crop1.jpg",
                caseName: "Nebula",
                hasRequestedToSharePublicly: true,
                isSharedPublicly: false,
                modelName: "iPhone 15 Pro",
                color: "Black",
                colorHex: "#000000",
                material: "Polycarbonate",
                finish: "Matte",
                price: "59.99",

                billing_id: "b1",
                billing_name: "John Doe",
                billing_street: "1 Main St",
                billing_city: "Hamilton",
                billing_postal_code: "L8P 1A1",
                billing_country: "CA",
                billing_state: "ON",
                billing_phone_number: "111-222-3333",

                shipping_id: "s1",
                shipping_name: "John Doe",
                shipping_street: "1 Main St",
                shipping_city: "Hamilton",
                shipping_postal_code: "L8P 1A1",
                shipping_country: "CA",
                shipping_state: "ON",
                shipping_phone_number: "111-222-3333",
            },
        ];

        const mockQuery = jest.fn().mockResolvedValue({ rows });

        mockedPoolConnect.mockResolvedValue({
            query: mockQuery,
            release: mockRelease,
        } as unknown as PoolClient);

        const res = await GET(
            makeReq({ "x-user-id": "user-123" }),
            withParams("o1")
        );

        expect(pool.connect).toHaveBeenCalled();
        expect(mockQuery).toHaveBeenCalledTimes(1);
        expect(mockRelease).toHaveBeenCalled();
        expect(res.status).toBe(200);

        await expect(res.json()).resolves.toEqual({
            order: {
                id: "o1",
                userId: "user-123",
                orderNumber: "ORD-0001",
                subtotal: 50.5,
                tax: 6.57,
                totalAmount: 57.07,
                orderStatus: "paid",
                trackingNumber: "TRACK123",
                billingAddress: {
                    id: "b1",
                    name: "John Doe",
                    street: "1 Main St",
                    city: "Hamilton",
                    postal_code: "L8P 1A1",
                    country: "CA",
                    state: "ON",
                    phone_number: "111-222-3333",
                },
                shippingAddress: {
                    id: "s1",
                    name: "John Doe",
                    street: "1 Main St",
                    city: "Hamilton",
                    postal_code: "L8P 1A1",
                    country: "CA",
                    state: "ON",
                    phone_number: "111-222-3333",
                },
                createdAt: "2024-01-01T12:00:00.000Z",
                updatedAt: "2024-01-02T13:00:00.000Z",
                design: {
                    id: "d1",
                    imgSrc: "/img1.jpg",
                    croppedImgUrl: "/crop1.jpg",
                    caseName: "Nebula",
                    modelName: "iPhone 15 Pro",
                    color: "Black",
                    material: "Polycarbonate",
                    finish: "Matte",
                    price: 59.99,
                    colorHex: "#000000",
                    hasRequestedToSharePublicly: true,
                    isSharedPublicly: false,
                },
            },
        });
    });

    it("returns 500 on DB error", async () => {
        mockedGetSession.mockResolvedValue({
            user: { id: "user-123", role: "user" },
        });
        mockedPoolConnect.mockRejectedValue(new Error("db down"));

        const res = await GET(
            makeReq({ "x-user-id": "user-123" }),
            withParams("o1")
        );
        expect(res.status).toBe(500);
        await expect(res.json()).resolves.toEqual({
            error: "Internal server error",
        });
    });
});
