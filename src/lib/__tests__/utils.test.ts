import { safeRedirect } from "../utils";

describe("safeRedirect", () => {
    it("keeps paths on this site", () => {
        expect(safeRedirect("/configure/upload")).toBe("/configure/upload");
        expect(safeRedirect("/gallery-images?sort=popularity_desc")).toBe(
            "/gallery-images?sort=popularity_desc"
        );
    });

    it("falls back for missing values", () => {
        expect(safeRedirect(null)).toBe("/");
        expect(safeRedirect(undefined)).toBe("/");
        expect(safeRedirect("")).toBe("/");
    });

    it("refuses absolute and protocol-relative URLs", () => {
        expect(safeRedirect("https://evil.example")).toBe("/");
        expect(safeRedirect("//evil.example/path")).toBe("/");
        expect(safeRedirect("javascript:alert(1)")).toBe("/");
    });

    it("uses the given fallback", () => {
        expect(safeRedirect("https://evil.example", "/account")).toBe("/account");
    });
});
