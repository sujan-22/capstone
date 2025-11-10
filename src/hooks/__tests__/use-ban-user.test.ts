/* eslint-disable @typescript-eslint/no-explicit-any */
import { renderHook, act } from "@testing-library/react";
import { useUserBanMutations } from "../use-ban-user";

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

const banUserApi = jest.fn();
const unbanUserApi = jest.fn();
jest.mock("../../../auth-client", () => ({
    authClient: {
        admin: {
            banUser: (...args: any[]) => banUserApi(...args),
            unbanUser: (...args: any[]) => unbanUserApi(...args),
        },
    },
}));

type Customer = {
    id: string;
    isBanned: boolean;
    bannedUntil: string | null;
    bannedReason: string | null;
    banReason?: string | null;
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

describe("useUserBanMutations", () => {
    test("banUser: prevents banning self", async () => {
        getQueriesData.mockReturnValue([]);
        const { result } = renderHook(() =>
            useUserBanMutations({ currentUserId: "me" })
        );
        await expect(
            result.current.banUser({ userId: "me", banReason: "x" })
        ).rejects.toThrow(/cannot ban yourself/i);
        expect(banUserApi).not.toHaveBeenCalled();
    });

    test("banUser: optimistic update, success invalidates and onBanSuccess called", async () => {
        const now = Date.now();
        jest.spyOn(Date, "now").mockReturnValue(now);

        let cacheState: Infinite<Page> = makeCache([
            {
                id: "u1",
                isBanned: false,
                bannedUntil: null,
                bannedReason: null,
            },
            {
                id: "u2",
                isBanned: false,
                bannedUntil: null,
                bannedReason: null,
            },
        ]);

        getQueriesData.mockReturnValue([[KEY0, cacheState]]);
        setQueryData.mockImplementation((_key, data) => {
            if (_key === KEY0) cacheState = data;
        });

        banUserApi.mockResolvedValue({ error: null });

        const onBanSuccess = jest.fn();
        const { result } = renderHook(() =>
            useUserBanMutations({ onBanSuccess })
        );

        await act(async () => {
            await result.current.banUser({
                userId: "u1",
                banReason: "abuse",
                banExpiresIn: 60,
            });
        });

        expect(cancelQueries).toHaveBeenCalledWith({ queryKey: KEY0 });
        const updated = cacheState.pages[0].customers.find(
            (c) => c.id === "u1"
        )!;
        expect(updated.isBanned).toBe(true);
        expect(updated.bannedUntil).toBe(new Date(now + 60_000).toISOString());
        expect(invalidateQueries).toHaveBeenCalledWith({
            queryKey: KEY0,
            exact: false,
        });
        expect(onBanSuccess).toHaveBeenCalledWith({
            userId: "u1",
            banReason: "abuse",
            banExpiresIn: 60,
        });
    });

    test("banUser: rollback on error and onError called", async () => {
        let cacheState: Infinite<Page> = makeCache([
            {
                id: "u3",
                isBanned: false,
                bannedUntil: null,
                bannedReason: null,
            },
        ]);
        const snapshot = JSON.parse(JSON.stringify(cacheState));

        getQueriesData.mockReturnValue([[KEY0, cacheState]]);
        setQueryData.mockImplementation((_key, data) => {
            if (_key === KEY0) cacheState = data;
        });

        banUserApi.mockResolvedValue({ error: "nope" });
        const onError = jest.fn();

        const { result } = renderHook(() => useUserBanMutations({ onError }));
        await expect(result.current.banUser({ userId: "u3" })).rejects.toThrow(
            /failed to ban user|nope/i
        );

        expect(cacheState).toEqual(snapshot);
        expect(onError).toHaveBeenCalled();
    });

    test("unbanUser: optimistic update, success invalidates and onUnbanSuccess called", async () => {
        let cacheState: Infinite<Page> = makeCache([
            {
                id: "u4",
                isBanned: true,
                bannedUntil: "2099-01-01T00:00:00.000Z",
                bannedReason: "spam",
            },
        ]);

        getQueriesData.mockReturnValue([[KEY0, cacheState]]);
        setQueryData.mockImplementation((_key, data) => {
            if (_key === KEY0) cacheState = data;
        });

        unbanUserApi.mockResolvedValue({ error: null });
        const onUnbanSuccess = jest.fn();

        const { result } = renderHook(() =>
            useUserBanMutations({ onUnbanSuccess })
        );

        await act(async () => {
            await result.current.unbanUser({ userId: "u4" });
        });

        const updated = cacheState.pages[0].customers.find(
            (c) => c.id === "u4"
        )!;
        expect(updated.isBanned).toBe(false);
        expect(updated.bannedUntil).toBeNull();
        expect(updated.bannedReason).toBeNull();
        expect(invalidateQueries).toHaveBeenCalledWith({
            queryKey: KEY0,
            exact: false,
        });
        expect(onUnbanSuccess).toHaveBeenCalledWith({ userId: "u4" });
    });

    test("unbanUser: rollback on error and onError called", async () => {
        let cacheState: Infinite<Page> = makeCache([
            {
                id: "u5",
                isBanned: true,
                bannedUntil: "2099-01-01T00:00:00.000Z",
                bannedReason: "abuse",
            },
        ]);
        const snapshot = JSON.parse(JSON.stringify(cacheState));

        getQueriesData.mockReturnValue([[KEY0, cacheState]]);
        setQueryData.mockImplementation((_key, data) => {
            if (_key === KEY0) cacheState = data;
        });

        unbanUserApi.mockResolvedValue({ error: "nope" });
        const onError = jest.fn();

        const { result } = renderHook(() => useUserBanMutations({ onError }));
        await expect(
            result.current.unbanUser({ userId: "u5" })
        ).rejects.toThrow(/failed to unban user|nope/i);

        expect(cacheState).toEqual(snapshot);
        expect(onError).toHaveBeenCalled();
    });
});
