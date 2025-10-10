/** @jest-environment node */

import { makeReq } from "@/lib/test/api";
import { GET } from "../route";
import { pool } from "@/lib/database/db";

// Mock DB pool
jest.mock("@/lib/database/db", () => ({
    pool: { connect: jest.fn() },
}));

// Mock session (route awaits it even though it only logs)
const getServerSideSessionMock = jest
    .fn()
    .mockResolvedValue({ user: { id: "user-123" } });
jest.mock("@/hooks/use-session", () => ({
    getServerSideSession: () => getServerSideSessionMock(),
}));

describe("GET /api/account/get-orders-by-user-id", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it("returns 401 when x-user-id header is missing", async () => {
        const res = await GET(makeReq());
        expect(res.status).toBe(401);
        await expect(res.json()).resolves.toEqual({
            error: "Not authenticated",
        });
        expect(pool.connect).not.toHaveBeenCalled();
    });

    it("returns orders with embedded design for authenticated user", async () => {
        const mockRelease = jest.fn();
        const rows = [
            {
                // order fields
                order_id: "o1",
                user_id: "user-123",
                order_number: "ORD-0001",
                case_design_id: "d1",
                sub_total: "50.50",
                tax: "6.57",
                total_amount: "57.07",
                order_status: "paid",
                tracking_number: "TRACK123",
                billing_address_id: "b1",
                shipping_address_id: "s1",
                order_createdat: "2024-01-01T12:00:00.000Z",
                order_updatedat: "2024-01-02T13:00:00.000Z",

                // design block
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
                isFavorited: true,
                totalFavorites: 3,

                // billing
                billing_id: "b1",
                billing_name: "John Doe",
                billing_street: "1 Main St",
                billing_city: "Hamilton",
                billing_postal_code: "L8P 1A1",
                billing_country: "CA",
                billing_state: "ON",
                billing_phone_number: "111-222-3333",

                // shipping
                shipping_id: "s1",
                shipping_name: "John Doe",
                shipping_street: "1 Main St",
                shipping_city: "Hamilton",
                shipping_postal_code: "L8P 1A1",
                shipping_country: "CA",
                shipping_state: "ON",
                shipping_phone_number: "111-222-3333",
            },
            {
                // minimal second row, some nullables
                order_id: "o2",
                user_id: "user-123",
                order_number: "ORD-0002",
                case_design_id: "d2",
                sub_total: 40,
                tax: 5,
                total_amount: 45,
                order_status: "paid",
                tracking_number: null,
                billing_address_id: null,
                shipping_address_id: null,
                order_createdat: "2024-01-03T10:00:00.000Z",
                order_updatedat: null,

                design_id: "d2",
                imgSrc: "/img2.jpg",
                cropped_image_url: "/crop2.jpg",
                caseName: "Aurora",
                hasRequestedToSharePublicly: false,
                isSharedPublicly: true,
                modelName: "Pixel 8",
                color: "White",
                colorHex: "#ffffff",
                material: "TPU",
                finish: "Glossy",
                price: 42,
                isFavorited: false,
                totalFavorites: 0,

                // billing/shipping nulls are fine
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

        (pool.connect as jest.Mock).mockResolvedValue({
            query: mockQuery,
            release: mockRelease,
        });

        const res = await GET(makeReq({ "x-user-id": "user-123" }));

        expect(getServerSideSessionMock).toHaveBeenCalled();
        expect(pool.connect).toHaveBeenCalled();
        expect(mockQuery).toHaveBeenCalledTimes(1);
        expect(mockRelease).toHaveBeenCalled();

        expect(res.status).toBe(200);
        await expect(res.json()).resolves.toEqual({
            orders: [
                {
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
                        isFavorited: true,
                        totalFavorites: 3,
                        colorHex: "#000000",
                        hasRequestedToSharePublicly: true,
                        isSharedPublicly: false,
                    },
                },
                {
                    id: "o2",
                    userId: "user-123",
                    orderNumber: "ORD-0002",
                    subtotal: 40,
                    tax: 5,
                    totalAmount: 45,
                    orderStatus: "paid",
                    trackingNumber: null,
                    billingAddress: null,
                    shippingAddress: null,
                    createdAt: "2024-01-03T10:00:00.000Z",
                    updatedAt: "",
                    design: {
                        id: "d2",
                        imgSrc: "/img2.jpg",
                        croppedImgUrl: "/crop2.jpg",
                        caseName: "Aurora",
                        modelName: "Pixel 8",
                        color: "White",
                        material: "TPU",
                        finish: "Glossy",
                        price: 42,
                        isFavorited: false,
                        totalFavorites: 0,
                        colorHex: "#ffffff",
                        hasRequestedToSharePublicly: false,
                        isSharedPublicly: true,
                    },
                },
            ],
        });
    });

    it("returns empty list when no orders", async () => {
        const mockRelease = jest.fn();
        const mockQuery = jest.fn().mockResolvedValue({ rows: [] });

        (pool.connect as jest.Mock).mockResolvedValue({
            query: mockQuery,
            release: mockRelease,
        });

        const res = await GET(makeReq({ "x-user-id": "user-123" }));

        expect(res.status).toBe(200);
        await expect(res.json()).resolves.toEqual({ orders: [] });
    });

    it("returns 500 on server error", async () => {
        (pool.connect as jest.Mock).mockRejectedValue(new Error("db down"));

        const res = await GET(makeReq({ "x-user-id": "user-123" }));
        expect(res.status).toBe(500);
        await expect(res.json()).resolves.toEqual({
            error: "Internal server error",
        });
    });
});
