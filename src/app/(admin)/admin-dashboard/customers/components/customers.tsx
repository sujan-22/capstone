"use client";

import * as React from "react";
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    SortingState,
    useReactTable,
} from "@tanstack/react-table";
import {
    ArrowUpDown,
    Ban,
    MoreHorizontal,
    Receipt,
    ShieldCheck,
    ShieldOff,
    Trash2,
    Undo2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";
import { useUserBanMutations } from "@/hooks/use-ban-user";
import { CustomersItem } from "@/app/api/admin/customers/get-all/route";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { adminCustomersKeys, adminSafeDeleteUser } from "../actions/actions";
import { cn, formatPrice } from "@/lib/utils";
import { LoadMore, Pill, TablePanel } from "../../components/controls";

const dateFormat = new Intl.DateTimeFormat("en-CA", {
    month: "short",
    day: "numeric",
    year: "numeric",
});

// Deleting a customer anonymises and bans them with this reason.
const isDeleted = (c: CustomersItem) =>
    !!c.banReason?.includes("Admin-initiated");

function initialsOf(name: string) {
    const parts = name.trim().split(/\s+/);
    return (
        parts.length > 1
            ? parts[0][0] + parts[parts.length - 1][0]
            : parts[0].slice(0, 2)
    ).toUpperCase();
}

function SortHeader({
    label,
    onClick,
}: {
    label: string;
    onClick: () => void;
}) {
    return (
        <Button variant="ghost" onClick={onClick}>
            {label}
            <ArrowUpDown aria-hidden />
        </Button>
    );
}

type PendingAction = { kind: "ban" | "delete"; customer: CustomersItem } | null;

export function CustomersTable({
    rows,
    loading,
    hasNextPage,
    onLoadMore,
    onToggleAdmin,
    currentUserId,
}: {
    rows: CustomersItem[];
    loading?: boolean;
    hasNextPage?: boolean;
    onLoadMore?: () => void;
    onToggleAdmin: (id: string, makeAdmin: boolean) => Promise<void>;
    currentUserId: string;
}) {
    const router = useRouter();
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [pending, setPending] = React.useState<PendingAction>(null);
    const { banUser, unbanUser, isPending } = useUserBanMutations({
        currentUserId: currentUserId,
    });
    const qc = useQueryClient();
    const deleteMutation = useMutation({
        mutationFn: ({ userId }: { userId: string }) =>
            adminSafeDeleteUser({ userId }),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: adminCustomersKeys.all });
        },
    });

    const confirmPending = () => {
        if (!pending) return;
        if (pending.kind === "ban") {
            banUser({
                userId: pending.customer.id,
                banReason: "Spamming",
                banExpiresIn: 60 * 60 * 24 * 7,
            });
        } else {
            deleteMutation.mutate({ userId: pending.customer.id });
        }
        setPending(null);
    };

    const columns = React.useMemo<ColumnDef<CustomersItem>[]>(
        () => [
            {
                accessorKey: "name",
                header: ({ column }) => (
                    <SortHeader
                        label="Customer"
                        onClick={() =>
                            column.toggleSorting(column.getIsSorted() === "asc")
                        }
                    />
                ),
                cell: ({ row }) => {
                    const c = row.original;
                    const deleted = isDeleted(c);
                    return (
                        <div
                            className={cn(
                                "flex min-w-0 items-center gap-3",
                                deleted && "opacity-55"
                            )}
                        >
                            <span
                                aria-hidden
                                className={cn(
                                    "flex size-8 shrink-0 items-center justify-center rounded-full text-[0.6875rem] font-bold",
                                    c.role === "admin"
                                        ? "bg-cobalt text-white"
                                        : "bg-ink/[0.08] text-ink"
                                )}
                            >
                                {initialsOf(c.name || "?")}
                            </span>
                            <span className="flex min-w-0 max-w-[18rem] flex-col">
                                <span className="truncate font-medium">
                                    {c.name}
                                    {c.id === currentUserId ? (
                                        <span className="ml-1.5 text-xs font-normal text-ink-soft">
                                            (you)
                                        </span>
                                    ) : null}
                                </span>
                                <span className="truncate text-xs text-ink-soft">
                                    {c.email ?? "—"}
                                </span>
                            </span>
                        </div>
                    );
                },
            },
            {
                accessorKey: "ordersCount",
                header: ({ column }) => (
                    <SortHeader
                        label="Orders"
                        onClick={() =>
                            column.toggleSorting(column.getIsSorted() === "asc")
                        }
                    />
                ),
                cell: ({ row }) => (
                    <span className="font-mono text-[0.8125rem]">
                        {row.original.ordersCount}
                    </span>
                ),
            },
            {
                accessorKey: "revenue",
                header: ({ column }) => (
                    <SortHeader
                        label="Revenue"
                        onClick={() =>
                            column.toggleSorting(column.getIsSorted() === "asc")
                        }
                    />
                ),
                cell: ({ row }) => (
                    <span className="font-mono text-[0.8125rem]">
                        {formatPrice(row.original.revenue ?? 0)}
                    </span>
                ),
            },
            {
                accessorKey: "createdAt",
                header: ({ column }) => (
                    <SortHeader
                        label="Joined"
                        onClick={() =>
                            column.toggleSorting(column.getIsSorted() === "asc")
                        }
                    />
                ),
                cell: ({ row }) => (
                    <span className="text-ink-soft">
                        {dateFormat.format(new Date(row.original.createdAt))}
                    </span>
                ),
            },
            {
                accessorKey: "lastOrderAt",
                header: "Last order",
                cell: ({ row }) => (
                    <span className="text-ink-soft">
                        {row.original.lastOrderAt
                            ? dateFormat.format(new Date(row.original.lastOrderAt))
                            : "—"}
                    </span>
                ),
            },
            {
                id: "status",
                header: "Status",
                cell: ({ row }) => {
                    const c = row.original;
                    return (
                        <div className="flex items-center gap-1.5">
                            {c.role === "admin" ? (
                                <Pill tone="cobalt">Admin</Pill>
                            ) : null}
                            {isDeleted(c) ? (
                                <Pill tone="neutral">Deleted</Pill>
                            ) : c.banned ? (
                                <Pill tone="danger">
                                    Banned
                                    {c.banExpires
                                        ? ` · ${dateFormat.format(new Date(c.banExpires))}`
                                        : ""}
                                </Pill>
                            ) : c.role !== "admin" ? (
                                <span className="text-sm text-ink-soft">Active</span>
                            ) : null}
                        </div>
                    );
                },
            },
            {
                id: "actions",
                header: () => <span className="sr-only">Actions</span>,
                enableHiding: false,
                cell: ({ row }) => {
                    const customer = row.original;
                    const isSelf = currentUserId && currentUserId === customer.id;
                    const deleted = isDeleted(customer);

                    return (
                        <div className="flex justify-end">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="size-8">
                                        <span className="sr-only">
                                            Actions for {customer.name}
                                        </span>
                                        <MoreHorizontal aria-hidden />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56">
                                    <DropdownMenuLabel>{customer.name}</DropdownMenuLabel>
                                    <DropdownMenuItem
                                        onClick={() =>
                                            router.push(
                                                `/admin-dashboard/orders?userId=${encodeURIComponent(
                                                    customer.id
                                                )}&userName=${encodeURIComponent(
                                                    customer.name
                                                )}`
                                            )
                                        }
                                    >
                                        <Receipt aria-hidden />
                                        View orders
                                    </DropdownMenuItem>

                                    {!isSelf && !deleted && (
                                        <>
                                            <DropdownMenuSeparator />
                                            {customer.role === "admin" ? (
                                                <DropdownMenuItem
                                                    onClick={() =>
                                                        onToggleAdmin(customer.id, false)
                                                    }
                                                >
                                                    <ShieldOff aria-hidden />
                                                    Remove admin
                                                </DropdownMenuItem>
                                            ) : (
                                                <DropdownMenuItem
                                                    onClick={() =>
                                                        onToggleAdmin(customer.id, true)
                                                    }
                                                >
                                                    <ShieldCheck aria-hidden />
                                                    Make admin
                                                </DropdownMenuItem>
                                            )}
                                            {customer.banned ? (
                                                <DropdownMenuItem
                                                    onClick={() =>
                                                        unbanUser({ userId: customer.id })
                                                    }
                                                    disabled={isPending}
                                                >
                                                    <Undo2 aria-hidden />
                                                    Unban
                                                </DropdownMenuItem>
                                            ) : (
                                                <DropdownMenuItem
                                                    onClick={() =>
                                                        setPending({ kind: "ban", customer })
                                                    }
                                                    disabled={isPending}
                                                >
                                                    <Ban aria-hidden />
                                                    Ban for 7 days…
                                                </DropdownMenuItem>
                                            )}
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem
                                                disabled={deleteMutation.isPending}
                                                onClick={() =>
                                                    setPending({ kind: "delete", customer })
                                                }
                                                className="text-destructive focus:text-destructive [&_svg]:!text-destructive"
                                            >
                                                <Trash2 aria-hidden />
                                                Delete user…
                                            </DropdownMenuItem>
                                        </>
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    );
                },
            },
        ],
        [router, currentUserId, onToggleAdmin, isPending, unbanUser, deleteMutation.isPending]
    );

    const table = useReactTable({
        data: rows,
        columns,
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        state: { sorting },
    });

    const visibleCols = table.getVisibleLeafColumns().length;

    return (
        <div className="w-full">
            <TablePanel loading={loading}>
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id}>
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                  header.column.columnDef.header,
                                                  header.getContext()
                                              )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>

                    <TableBody>
                        {rows.length > 0 ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id}>
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : loading ? (
                            Array.from({ length: 6 }).map((_, r) => (
                                <TableRow key={`skel-${r}`}>
                                    <TableCell colSpan={visibleCols}>
                                        <Skeleton className="h-9 w-full" />
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={visibleCols}
                                    className="h-32 text-center text-sm text-ink-soft"
                                >
                                    No customers match this search.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TablePanel>

            {hasNextPage && <LoadMore onClick={onLoadMore} loading={loading} />}

            <AlertDialog
                open={!!pending}
                onOpenChange={(open) => !open && setPending(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {pending?.kind === "delete"
                                ? `Delete ${pending.customer.name}?`
                                : `Ban ${pending?.customer.name} for 7 days?`}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {pending?.kind === "delete"
                                ? "Their account is anonymised and permanently disabled. Their orders stay on record for accounting. This can't be undone."
                                : "They won't be able to sign in or check out for 7 days. Existing orders are unaffected, and you can unban them early from this menu."}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmPending}
                            className="bg-destructive text-white hover:bg-destructive/90"
                        >
                            {pending?.kind === "delete" ? "Delete user" : "Ban user"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
