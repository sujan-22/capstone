"use client";

import * as React from "react";
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    SortingState,
    useReactTable,
    VisibilityState,
} from "@tanstack/react-table";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";
import { LuChevronsUpDown } from "react-icons/lu";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import type { OrderListItem } from "../actions/actions";
import { RequestBadge } from "./share-state";
import { ORDER_STATUSES } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";

import { adminOrdersKeys } from "../actions/actions";
import { updateAdminOrderStatus } from "../actions/actions";

function getShareState(o: OrderListItem) {
    const req = o.caseDesign?.hasRequestedToSharePublicly;
    const shared = o.caseDesign?.isSharedPublicly;
    if (shared) return "shared" as const;
    if (req && !shared) return "requested" as const;
    return null;
}

function ShareBadge({ state }: { state: ReturnType<typeof getShareState> }) {
    if (state === "requested") return <RequestBadge />;
    if (state === "shared")
        return (
            <span className="inline-flex items-center rounded-full bg-emerald-500 px-2 py-0.5 text-xs font-medium text-white dark:bg-emerald-600">
                Shared
            </span>
        );
    return null;
}

type OrdersTableProps = {
    rows: OrderListItem[];
    loading?: boolean;
    hasNextPage?: boolean;
    onLoadMore?: () => void;
};

export function OrdersTable({
    rows,
    loading,
    hasNextPage,
    onLoadMore,
}: OrdersTableProps) {
    const router = useRouter();
    const qc = useQueryClient();
    const updateStatus = useMutation({
        mutationFn: ({ id, status }: { id: string; status: string }) =>
            updateAdminOrderStatus({ id, status }),
        onSuccess: async () => {
            await qc.invalidateQueries({
                queryKey: adminOrdersKeys.all,
                exact: false,
            });
        },
    });

    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnVisibility, setColumnVisibility] =
        React.useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = React.useState({});

    const columns = React.useMemo<ColumnDef<OrderListItem>[]>(
        () => [
            {
                accessorKey: "orderNumber",
                header: ({ column }) => (
                    <Button
                        variant="ghost"
                        onClick={() =>
                            column.toggleSorting(column.getIsSorted() === "asc")
                        }
                        className="px-0"
                    >
                        Order #
                        <ArrowUpDown className="ml-2 size-4" />
                    </Button>
                ),
                cell: ({ row }) => {
                    const state = getShareState(row.original);
                    return (
                        <div className="flex items-center gap-2">
                            <span className="font-medium">
                                {row.original.orderNumber ?? "—"}
                            </span>
                            <ShareBadge state={state} />
                        </div>
                    );
                },
            },
            {
                id: "customer",
                header: ({ column }) => (
                    <Button
                        variant="ghost"
                        onClick={() =>
                            column.toggleSorting(column.getIsSorted() === "asc")
                        }
                        className="px-0"
                    >
                        Customer
                        <ArrowUpDown className="ml-2 size-4" />
                    </Button>
                ),
                sortingFn: (a, b) =>
                    (a.original.customer.name ?? "").localeCompare(
                        b.original.customer.name ?? ""
                    ),
                cell: ({ row }) => {
                    const c = row.original.customer;
                    return (
                        <div className="flex min-w-0 flex-col">
                            <span className="truncate font-medium">
                                {c.name ?? "—"}
                            </span>
                            <span className="truncate text-xs text-muted-foreground">
                                {c.email ?? "—"}
                            </span>
                        </div>
                    );
                },
            },
            {
                accessorKey: "status",
                header: ({ column }) => (
                    <Button
                        variant="ghost"
                        onClick={() =>
                            column.toggleSorting(column.getIsSorted() === "asc")
                        }
                        className="px-0"
                    >
                        Status
                        <ArrowUpDown className="ml-2 size-4" />
                    </Button>
                ),
                cell: ({ row }) => {
                    const backendKey = String(
                        row.original.status
                    ).toUpperCase();
                    const label =
                        ORDER_STATUSES[
                            backendKey as keyof typeof ORDER_STATUSES
                        ] ?? "Unknown";

                    const tone =
                        label === "Fulfilled"
                            ? "bg-emerald-500 text-white dark:bg-emerald-600"
                            : label === "Pending"
                            ? "bg-amber-500 text-white dark:bg-amber-600"
                            : "bg-muted text-foreground";

                    return (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Badge className={`${tone} gap-1`}>
                                    {label}
                                    <LuChevronsUpDown className="w-4 h-4" />
                                </Badge>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent align="center">
                                <DropdownMenuLabel>
                                    Update Status
                                </DropdownMenuLabel>

                                {Object.keys(ORDER_STATUSES).map((key) => {
                                    const optionKey = key.toUpperCase();
                                    const optionLabel =
                                        ORDER_STATUSES[
                                            optionKey as keyof typeof ORDER_STATUSES
                                        ];

                                    const isCurrent =
                                        optionLabel.toLowerCase() ===
                                        label.toLowerCase();

                                    return (
                                        <DropdownMenuCheckboxItem
                                            key={optionKey}
                                            checked={isCurrent}
                                            disabled={updateStatus.isPending}
                                            className="capitalize"
                                            onCheckedChange={(checked) => {
                                                if (checked && !isCurrent) {
                                                    updateStatus.mutate({
                                                        id: row.original.id,
                                                        status: optionKey,
                                                    });
                                                }
                                            }}
                                        >
                                            {optionLabel}
                                        </DropdownMenuCheckboxItem>
                                    );
                                })}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    );
                },
            },
            {
                id: "actions",
                enableHiding: false,
                cell: ({ row }) => {
                    const ord = row.original;
                    return (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                    <span className="sr-only">Open menu</span>
                                    <MoreHorizontal />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem
                                    onClick={() =>
                                        router.push(
                                            `/order-details/${encodeURIComponent(
                                                ord.id
                                            )}`
                                        )
                                    }
                                >
                                    View order
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onClick={() =>
                                        navigator.clipboard.writeText(ord.id)
                                    }
                                >
                                    Copy order ID
                                </DropdownMenuItem>
                                {ord.orderNumber && (
                                    <DropdownMenuItem
                                        onClick={() =>
                                            navigator.clipboard.writeText(
                                                ord.orderNumber!
                                            )
                                        }
                                    >
                                        Copy order #
                                    </DropdownMenuItem>
                                )}
                                {ord.customer.email && (
                                    <DropdownMenuItem
                                        onClick={() =>
                                            navigator.clipboard.writeText(
                                                ord.customer.email!
                                            )
                                        }
                                    >
                                        Copy customer email
                                    </DropdownMenuItem>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    );
                },
            },
        ],
        [router, updateStatus]
    );

    const table = useReactTable({
        data: rows,
        columns,
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        state: { sorting, columnVisibility, rowSelection },
    });

    const visibleCols = table.getVisibleLeafColumns().length;

    return (
        <div className="w-full">
            <div
                className="overflow-hidden rounded-md border"
                aria-busy={loading ? "true" : "false"}
            >
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((hg) => (
                            <TableRow key={hg.id}>
                                {hg.headers.map((header) => (
                                    <TableHead
                                        key={header.id}
                                        className="whitespace-nowrap"
                                    >
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                  header.column.columnDef
                                                      .header,
                                                  header.getContext()
                                              )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>

                    <TableBody>
                        {rows.length
                            ? table.getRowModel().rows.map((row) => {
                                  const state = getShareState(row.original);
                                  const pendingClass =
                                      state === "requested"
                                          ? "bg-blue-50/40 dark:bg-blue-950/20"
                                          : "";
                                  return (
                                      <TableRow
                                          key={row.id}
                                          data-state={
                                              row.getIsSelected() && "selected"
                                          }
                                          className={pendingClass}
                                      >
                                          {row.getVisibleCells().map((cell) => (
                                              <TableCell key={cell.id}>
                                                  {flexRender(
                                                      cell.column.columnDef
                                                          .cell,
                                                      cell.getContext()
                                                  )}
                                              </TableCell>
                                          ))}
                                      </TableRow>
                                  );
                              })
                            : loading && (
                                  <>
                                      {Array.from({ length: 5 }).map(
                                          (_, idx) => (
                                              <TableRow key={`skel-${idx}`}>
                                                  <TableCell
                                                      colSpan={visibleCols}
                                                      className="py-2"
                                                  >
                                                      <Skeleton className="h-6 w-full" />
                                                  </TableCell>
                                              </TableRow>
                                          )
                                      )}
                                  </>
                              )}
                    </TableBody>
                </Table>
            </div>

            {hasNextPage && (
                <div className="flex justify-end py-4">
                    <Button
                        onClick={onLoadMore}
                        disabled={loading}
                        isLoading={loading}
                        variant="outline"
                        size="sm"
                    >
                        Load more
                    </Button>
                </div>
            )}
        </div>
    );
}
