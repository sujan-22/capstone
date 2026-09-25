"use client";

import {
    useMutation,
    useQueryClient,
    InfiniteData,
} from "@tanstack/react-query";
import { authClient } from "../../auth-client";
import {
    adminCustomersKeys,
    type CustomersPage,
} from "@/app/(admin)/admin-dashboard/customers/actions/actions";

type DeleteArgs = {
    userId: string;
};

export function useDeleteUser(opts?: {
    currentUserId?: string;
    onSuccess?: (args: DeleteArgs) => void;
    onError?: (err: unknown, args: DeleteArgs) => void;
}) {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: async ({ userId }: DeleteArgs) => {
            if (opts?.currentUserId && userId === opts.currentUserId) {
                throw new Error("You cannot delete your own account.");
            }

            const { data, error } = await authClient.admin.removeUser({
                userId,
            });
            if (error)
                throw new Error(
                    typeof error === "string" ? error : "Failed to delete user"
                );
            return { userId, data };
        },
        onMutate: async ({ userId }) => {
            await queryClient.cancelQueries({
                queryKey: adminCustomersKeys.all,
            });

            const previous = queryClient.getQueriesData<
                InfiniteData<CustomersPage>
            >({
                queryKey: adminCustomersKeys.all,
            });

            previous.forEach(([key, old]) => {
                if (!old) return;
                queryClient.setQueryData<InfiniteData<CustomersPage>>(key, {
                    ...old,
                    pages: old.pages.map((p) => ({
                        ...p,
                        customers: p.customers.filter((c) => c.id !== userId),
                    })),
                });
            });

            return { previous };
        },

        // Roll back on error
        onError: (err, vars, ctx) => {
            ctx?.previous?.forEach(([key, old]) =>
                queryClient.setQueryData(key, old)
            );
            opts?.onError?.(err, vars);
        },
        onSuccess: (_res, vars) => {
            queryClient.invalidateQueries({
                queryKey: adminCustomersKeys.all,
                exact: false,
            });
            opts?.onSuccess?.(vars);
        },
    });

    const deleteUser = (args: DeleteArgs) => mutation.mutateAsync(args);

    return {
        deleteUser,
        isPending: mutation.isPending,
        error: mutation.error as Error | null,
    };
}
