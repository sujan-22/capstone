/* eslint-disable @typescript-eslint/no-explicit-any */
import { renderHook, act } from "@testing-library/react";
import { useUserRoleMutations, type UserRole } from "../use-toggle-role";

const invalidateQueries = jest.fn();
jest.mock("@tanstack/react-query", () => {
    return {
        __esModule: true,
        useQueryClient: () => ({ invalidateQueries }),
        useMutation: (opts: any) => {
            let lastError: any = null;
            return {
                isPending: false,
                error: lastError,
                mutateAsync: async (vars: any) => {
                    try {
                        const res = await opts.mutationFn(vars);
                        await opts.onSuccess?.(res, vars, undefined);
                        return res;
                    } catch (err) {
                        lastError = err;
                        await opts.onError?.(err, vars, undefined);
                        throw err;
                    }
                },
            };
        },
    };
});

jest.mock(
    "@/app/(admin)/admin-dashboard/customers/actions/actions",
    () => ({
        adminCustomersKeys: { all: ["admin", "customers"] },
    })
);

const setRoleApi = jest.fn();
jest.mock("../../../auth-client", () => ({
    authClient: {
        admin: {
            setRole: (...args: any[]) => setRoleApi(...args),
        },
    },
}));

describe("useUserRoleMutations", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("prevents changing own role away from admin", async () => {
        const { result } = renderHook(() =>
            useUserRoleMutations({ currentUserId: "me" })
        );
        await expect(
            result.current.setUserRole({ userId: "me", role: "user" })
        ).rejects.toThrow(/cannot change your own role/i);
        expect(setRoleApi).not.toHaveBeenCalled();
    });

    it("setUserRole succeeds, invalidates and calls onSuccess", async () => {
        setRoleApi.mockResolvedValue({ data: { ok: true }, error: null });
        const onSuccess = jest.fn();
        const { result } = renderHook(() =>
            useUserRoleMutations({ onSuccess })
        );
        await act(async () => {
            const role = await result.current.setUserRole({
                userId: "u1",
                role: "admin",
            });
            expect(role).toBe<UserRole>("admin");
        });
        expect(setRoleApi).toHaveBeenCalledWith({
            userId: "u1",
            role: "admin",
        });
        expect(invalidateQueries).toHaveBeenCalledWith({
            queryKey: ["admin", "customers"],
            exact: false,
        });
        expect(onSuccess).toHaveBeenCalledWith({ userId: "u1", role: "admin" });
    });

    it("toggleUserRole toggles from user to admin", async () => {
        setRoleApi.mockResolvedValue({ data: { ok: true }, error: null });
        const { result } = renderHook(() => useUserRoleMutations());
        await act(async () => {
            const next = await result.current.toggleUserRole({
                userId: "u2",
                currentRole: "user",
            });
            expect(next).toBe<UserRole>("admin");
        });
        expect(setRoleApi).toHaveBeenCalledWith({
            userId: "u2",
            role: "admin",
        });
        expect(invalidateQueries).toHaveBeenCalled();
    });

    it("toggleUserRole toggles from admin to user", async () => {
        setRoleApi.mockResolvedValue({ data: { ok: true }, error: null });
        const { result } = renderHook(() => useUserRoleMutations());
        await act(async () => {
            const next = await result.current.toggleUserRole({
                userId: "u3",
                currentRole: "admin",
            });
            expect(next).toBe<UserRole>("user");
        });
        expect(setRoleApi).toHaveBeenCalledWith({ userId: "u3", role: "user" });
        expect(invalidateQueries).toHaveBeenCalled();
    });

    it("calls onError and does not invalidate on API error", async () => {
        setRoleApi.mockResolvedValue({ data: null, error: "nope" });
        const onError = jest.fn();
        const { result } = renderHook(() => useUserRoleMutations({ onError }));
        await expect(
            result.current.setUserRole({ userId: "u4", role: "user" })
        ).rejects.toThrow(/failed to set role|nope/i);
        expect(invalidateQueries).not.toHaveBeenCalled();
        expect(onError).toHaveBeenCalledWith(expect.any(Error), {
            userId: "u4",
            role: "user",
        });
    });
});
