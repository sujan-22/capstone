import { renderHook } from "@testing-library/react";
import { usePasswordStrength } from "../use-password-strength";

describe("usePasswordStrength", () => {
    it('returns "Too weak" for empty password', () => {
        const { result } = renderHook(() => usePasswordStrength(""));
        expect(result.current.score).toBe(0);
        expect(result.current.label).toBe("Too weak");
        expect(result.current.checks.length).toBe(false);
    });

    it("detects weak password missing special characters", () => {
        const { result } = renderHook(() => usePasswordStrength("abcdEF12"));
        expect(result.current.label).toBe("Good");
        expect(result.current.checks.special).toBe(false);
        expect(result.current.suggestions).toContain(
            "Add a special character (e.g. !@#$%)."
        );
    });

    it("detects strong password with all requirements", () => {
        const { result } = renderHook(() => usePasswordStrength("Abcd1234!"));
        expect(result.current.score).toBe(4);
        expect(result.current.label).toBe("Strong");
        expect(result.current.percent).toBe(100);
        expect(result.current.suggestions.length).toBe(0);
    });

    it("requires minimum length before improving score", () => {
        const { result } = renderHook(() => usePasswordStrength("Ab1!"));
        expect(result.current.label).toBe("Too weak");
        expect(result.current.suggestions).toContain(
            "Use at least 8 characters."
        );
    });
});
