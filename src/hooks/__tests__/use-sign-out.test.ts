/* eslint-disable @typescript-eslint/no-explicit-any */
import { renderHook, act } from "@testing-library/react";
import { useSignOut } from "../use-sign-out";

const replace = jest.fn();
const refresh = jest.fn();
jest.mock("next/navigation", () => ({
    useRouter: () => ({ replace, refresh }),
}));

const toast = jest.fn();
jest.mock("../../hooks/use-toast", () => ({
    useToast: () => ({ toast }),
}));

const signOut = jest.fn();
const clearLastUsedLoginMethod = jest.fn();
jest.mock("../../../auth-client", () => ({
    authClient: {
        signOut: (...args: any[]) => signOut(...args),
        clearLastUsedLoginMethod: (...args: any[]) =>
            clearLastUsedLoginMethod(...args),
    },
}));

describe("useSignOut", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("signs out successfully, clears method, toasts, and navigates home", async () => {
        signOut.mockResolvedValue({ ok: true });
        const { result } = renderHook(() => useSignOut());
        await act(async () => {
            await result.current.signOut();
        });
        expect(signOut).toHaveBeenCalledWith({});
        expect(clearLastUsedLoginMethod).toHaveBeenCalled();
        expect(toast).toHaveBeenCalledWith(
            expect.objectContaining({
                title: "Signed out",
                description: "You have been signed out successfully.",
            })
        );
        expect(replace).toHaveBeenCalledWith("/");
        expect(refresh).toHaveBeenCalled();
    });

    it("handles error, shows error toast, logs, and still navigates", async () => {
        const spy = jest.spyOn(console, "error").mockImplementation(() => {});
        signOut.mockRejectedValue(new Error("boom"));
        const { result } = renderHook(() => useSignOut());
        await act(async () => {
            await result.current.signOut();
        });
        expect(toast).toHaveBeenCalledWith(
            expect.objectContaining({
                title: "Error",
                description: expect.stringContaining(
                    "There was an error signing out"
                ),
                variant: "destructive",
            })
        );
        expect(replace).toHaveBeenCalledWith("/");
        expect(refresh).toHaveBeenCalled();
        spy.mockRestore();
    });
});
