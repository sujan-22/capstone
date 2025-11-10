/* eslint-disable @typescript-eslint/no-explicit-any */
import { renderHook, act } from "@testing-library/react";
import { useDeleteUser } from "../use-delete-user";

const invalidateQueries = jest.fn();
const cancelQueries = jest.fn();
const getQueriesData = jest.fn();
const setQueryData = jest.fn();

jest.mock("@tanstack/react-query", () => {
    return {
        __esModule: true,
        useQueryClient: () => ({
            invalidateQueries,
            cancelQueries,
            getQueriesData,
            setQueryData,
        }),
        useMutation: (opts: any) => {
            let lastError: any = null;
            return {
                isPending: false,
                error: lastError,
                mutateAsync: async (vars: any) => {
                    const ctx = (await opts.onMutate?.(vars)) ?? undefined;
                    try {
                        const res = await opts.mutationFn(vars);
                        await opts.onSuccess?.(res, vars, ctx);
                        return res;
                    } catch (err) {
                        lastError = err;
                        await opts.onError?.(err, vars, ctx);
                        throw err;
                    }
                },
            };
        },
    };
});

jest.mock(
    "@/app/(site)/(admin)/admin-dashboard/customers/actions/actions",
    () => ({
        adminCustomersKeys: { all: ["admin", "customers"] },
    })
);

const removeUserApi = jest.fn();
jest.mock("../../../auth-client", () => ({
    authClient: {
        admin: {
            removeUser: (...args: any[]) => removeUserApi(...args),
        },
    },
}));

type Customer = {
    id: string;
    isBanned?: boolean;
    bannedUntil?: string | null;
    bannedReason?: string | null;
};
type Page = { customers: Customer[] };
type Infinite<T> = { pageParams: any[]; pages: T[] };

const makeCache = (custs: Customer[]): Infinite<Page> => ({
    pageParams: [null],
    pages: [{ customers: custs }],
});

const KEY0 = ["admin", "customers"];

beforeEach(() => {
    jest.clearAllMocks();
});

describe("useDeleteUser", () => {
    test("prevents deleting self", async () => {
        getQueriesData.mockReturnValue([]);
        const { result } = renderHook(() =>
            useDeleteUser({ currentUserId: "me" })
        );
        await expect(
            result.current.deleteUser({ userId: "me" })
        ).rejects.toThrow(/cannot delete your own account/i);
        expect(removeUserApi).not.toHaveBeenCalled();
    });

    test("optimistic delete, success invalidates and onSuccess called", async () => {
        let cacheState: Infinite<Page> = makeCache([
            { id: "u1" },
            { id: "u2" },
            { id: "u3" },
        ]);

        getQueriesData.mockReturnValue([[KEY0, cacheState]]);
        setQueryData.mockImplementation((_key, data) => {
            if (_key === KEY0) cacheState = data;
        });

        removeUserApi.mockResolvedValue({ data: { ok: true }, error: null });

        const onSuccess = jest.fn();
        const { result } = renderHook(() => useDeleteUser({ onSuccess }));

        await act(async () => {
            await result.current.deleteUser({ userId: "u2" });
        });

        expect(cancelQueries).toHaveBeenCalledWith({ queryKey: KEY0 });
        expect(cacheState.pages[0].customers.map((c) => c.id)).toEqual([
            "u1",
            "u3",
        ]);
        expect(invalidateQueries).toHaveBeenCalledWith({
            queryKey: KEY0,
            exact: false,
        });
        expect(onSuccess).toHaveBeenCalledWith({ userId: "u2" });
    });

    test("rollback on error and onError called", async () => {
        let cacheState: Infinite<Page> = makeCache([
            { id: "u4" },
            { id: "u5" },
        ]);
        const snapshot = JSON.parse(JSON.stringify(cacheState));

        getQueriesData.mockReturnValue([[KEY0, cacheState]]);
        setQueryData.mockImplementation((_key, data) => {
            if (_key === KEY0) cacheState = data;
        });

        removeUserApi.mockResolvedValue({ data: null, error: "nope" });

        const onError = jest.fn();
        const { result } = renderHook(() => useDeleteUser({ onError }));

        await expect(
            result.current.deleteUser({ userId: "u4" })
        ).rejects.toThrow(/failed to delete user|nope/i);

        expect(cacheState).toEqual(snapshot);
        expect(onError).toHaveBeenCalledWith(expect.any(Error), {
            userId: "u4",
        });
    });
});
