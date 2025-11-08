import { renderHook, act } from "@testing-library/react";
import { useDebounce } from "../use-debounce";

describe("useDebounce", () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it("should return the initial value immediately", () => {
        const { result } = renderHook(() => useDebounce("hello", 500));
        expect(result.current).toBe("hello");
    });

    it("should update the value only after the delay", () => {
        let value = "initial";
        const { result, rerender } = renderHook(() => useDebounce(value, 500));

        value = "updated";
        rerender();

        expect(result.current).toBe("initial");

        act(() => {
            jest.advanceTimersByTime(499);
        });
        expect(result.current).toBe("initial");

        act(() => {
            jest.advanceTimersByTime(1);
        });
        expect(result.current).toBe("updated");
    });

    it("should clear previous timeout when value changes quickly", () => {
        let value = "first";
        const { result, rerender } = renderHook(() => useDebounce(value, 300));

        act(() => {
            value = "second";
            rerender();
            jest.advanceTimersByTime(150);
            value = "third";
            rerender();
            jest.advanceTimersByTime(150);
        });

        expect(result.current).toBe("first");

        act(() => {
            jest.advanceTimersByTime(300);
        });

        expect(result.current).toBe("third");
    });
});
