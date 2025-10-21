/** @jest-environment node */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextRequest } from "next/server";

// We'll set up the pg mock *before* importing the route so the pool is created with our mock.
let mockQuery: jest.Mock<any, any>;
jest.mock("pg", () => {
    return {
        Pool: jest.fn().mockImplementation(() => ({
            query: (...args: any[]) => mockQuery(...args),
        })),
    };
});

// Import after mocks so the route uses our mocked Pool
import { GET } from "./route";

function makeGet(username?: string | null): NextRequest {
    const u =
        username === undefined
            ? "http://localhost/api/check-username"
            : `http://localhost/api/check-username?username=${encodeURIComponent(
                  username as string
              )}`;

    // Next's handler receives a NextRequest, but constructing a native Request works for tests.
    return new Request(u, { method: "GET" }) as unknown as NextRequest;
}

describe("GET /api/check-username", () => {
    beforeEach(() => {
        mockQuery = jest.fn();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("returns {available: 2} when username is invalid or missing", async () => {
        // missing param
        const res1 = await GET(makeGet());
        expect(res1.status).toBe(200);
        await expect(res1.json()).resolves.toEqual({ available: 2 });
        expect(mockQuery).not.toHaveBeenCalled();

        // clearly invalid param (depends on your zod schema, using too-short as typical)
        const res2 = await GET(makeGet("a"));
        expect(res2.status).toBe(200);
        await expect(res2.json()).resolves.toEqual({ available: 2 });
        expect(mockQuery).not.toHaveBeenCalled();
    });

    it("returns {available: 1} when username does not exist", async () => {
        mockQuery.mockResolvedValueOnce({ rowCount: 0 });

        const res = await GET(makeGet("new_user"));
        expect(mockQuery).toHaveBeenCalledTimes(1);
        // Ensure we queried with a parameterized statement and the right value
        const [sql, params] = mockQuery.mock.calls[0];
        expect(sql).toMatch(
            /SELECT\s+1\s+FROM\s+"user"\s+WHERE\s+username\s*=\s*\$1/i
        );
        expect(params).toEqual(["new_user"]);

        expect(res.status).toBe(200);
        await expect(res.json()).resolves.toEqual({ available: 1 });
    });

    it("returns {available: 0} when username already exists", async () => {
        mockQuery.mockResolvedValueOnce({ rowCount: 1 });

        const res = await GET(makeGet("taken_user"));
        expect(mockQuery).toHaveBeenCalledTimes(1);
        expect(res.status).toBe(200);
        await expect(res.json()).resolves.toEqual({ available: 0 });
    });

    it("returns 500 with {available: 3} when a database error occurs", async () => {
        mockQuery.mockRejectedValueOnce(new Error("db down"));

        const res = await GET(makeGet("anyuser"));
        expect(mockQuery).toHaveBeenCalledTimes(1);

        expect(res.status).toBe(500);
        await expect(res.json()).resolves.toEqual({
            available: 3,
            error: expect.stringMatching(/Database error/i),
        });
    });
});
