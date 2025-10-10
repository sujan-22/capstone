import { renderHook, act } from "@testing-library/react";
import { useDebounce } from "../use-debounce";

describe("useDebounce", () => {
    beforeEach(() => {
        jest.useFakeTimers(); // mock the timer system
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

        // change the value before the delay
        value = "updated";
        rerender();

        // still old value before timeout
        expect(result.current).toBe("initial");

        // fast-forward 499ms → still old
        act(() => {
            jest.advanceTimersByTime(499);
        });
        expect(result.current).toBe("initial");

        // fast-forward 1ms more → update happens
        act(() => {
            jest.advanceTimersByTime(1);
        });
        expect(result.current).toBe("updated");
    });

    it("should clear previous timeout when value changes quickly", () => {
        let value = "first";
        const { result, rerender } = renderHook(() => useDebounce(value, 300));

        // simulate rapid changes
        act(() => {
            value = "second";
            rerender();
            jest.advanceTimersByTime(150);
            value = "third";
            rerender();
            jest.advanceTimersByTime(150);
        });

        // Not enough time has passed for debounce to settle
        expect(result.current).toBe("first");

        // Now let the timer complete
        act(() => {
            jest.advanceTimersByTime(300);
        });

        expect(result.current).toBe("third");
    });
});
