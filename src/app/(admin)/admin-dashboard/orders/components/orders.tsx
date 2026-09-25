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
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
    ArrowUpDown,
    ChevronDown,
    ExternalLink,
    MoreHorizontal,
    Send,
    Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
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
import Phone from "@/components/utilities/phone";
import type { OrderListItem } from "../actions/actions";
import { ORDER_STATUSES } from "@/lib/constants";
import { cn, formatPrice, getOrderStatus } from "@/lib/utils";
import { adminOrdersKeys, shareOrderDesignPublicly } from "../actions/actions";
import { updateAdminOrderStatus } from "../actions/actions";
import { LoadMore, Pill, TablePanel } from "../../components/controls";

function getShareState(o: OrderListItem) {
    const req = o.caseDesign?.hasRequestedToSharePublicly;
    const shared = o.caseDesign?.isSharedPublicly;
    if (shared) return "shared" as const;
    if (req && !shared) return "requested" as const;
    return null;
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

const dateFormat = new Intl.DateTimeFormat("en-CA", {
    month: "short",
    day: "numeric",
    year: "numeric",
});

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
            await Promise.all([
                qc.invalidateQueries({
                    queryKey: adminOrdersKeys.all,
                    exact: false,
                }),
                qc.invalidateQueries({
                    queryKey: ["get-order-by-id"],
                }),
            ]);
        },
    });

    const publishMutation = useMutation({
        mutationFn: ({ id }: { id: string }) =>
            shareOrderDesignPublicly({ id }),
        onSuccess: async () => {
            await Promise.all([
                qc.invalidateQueries({
                    queryKey: adminOrdersKeys.all,
                    exact: false,
                }),
                qc.invalidateQueries({
                    queryKey: ["get-featured-designs-page"],
                    exact: false,
                }),
                qc.invalidateQueries({
                    queryKey: ["get-featured-designs"],
                    exact: false,
                }),
            ]);
        },
    });

    const [sorting, setSorting] = React.useState<SortingState>([]);

    const columns = React.useMemo<ColumnDef<OrderListItem>[]>(
        () => [
            {
                id: "design",
                header: () => <span className="sr-only">Design</span>,
                enableSorting: false,
                cell: ({ row }) => (
                    <div className="w-9 rounded-[6px] bg-paper-sunken p-1">
                        <Phone
                            imgSrc={row.original.caseDesign.croppedImageUrl ?? ""}
                            altText={`Design for order ${row.original.orderNumber}`}
                            sizes="40px"
                        />
                    </div>
                ),
            },
            {
                accessorKey: "orderNumber",
                header: ({ column }) => (
                    <SortHeader
                        label="Order"
                        onClick={() =>
                            column.toggleSorting(column.getIsSorted() === "asc")
                        }
                    />
                ),
                cell: ({ row }) => (
                    <div className="flex flex-col">
                        <span className="font-mono text-[0.8125rem] font-medium">
                            {row.original.orderNumber ?? "—"}
                        </span>
                        <span className="text-xs text-ink-soft">
                            {dateFormat.format(new Date(row.original.createdAt))}
                        </span>
                    </div>
                ),
            },
            {
                id: "customer",
                header: ({ column }) => (
                    <SortHeader
                        label="Customer"
                        onClick={() =>
                            column.toggleSorting(column.getIsSorted() === "asc")
                        }
                    />
                ),
                sortingFn: (a, b) =>
                    (a.original.customer.name ?? "").localeCompare(
                        b.original.customer.name ?? ""
                    ),
                cell: ({ row }) => {
                    const c = row.original.customer;
                    return (
                        <div className="flex min-w-0 max-w-[16rem] flex-col">
                            <span className="truncate font-medium">
                                {c.name ?? "—"}
                            </span>
                            <span className="truncate text-xs text-ink-soft">
                                {c.email ?? "—"}
                            </span>
                        </div>
                    );
                },
            },
            {
                accessorKey: "totalAmount",
                header: ({ column }) => (
                    <SortHeader
                        label="Total"
                        onClick={() =>
                            column.toggleSorting(column.getIsSorted() === "asc")
                        }
                    />
                ),
                cell: ({ row }) => (
                    <span className="font-mono text-[0.8125rem]">
                        {formatPrice(row.original.totalAmount ?? 0)}
                    </span>
                ),
            },
            {
                id: "share",
                header: "Gallery",
                enableSorting: false,
                cell: ({ row }) => {
                    const state = getShareState(row.original);
                    if (state === "shared")
                        return <Pill tone="success">Shared</Pill>;
                    if (state === "requested")
                        return (
                            <div className="flex items-center gap-2">
                                <Pill tone="cobalt">Share request</Pill>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-7 px-2.5"
                                    disabled={publishMutation.isPending}
                                    onClick={() =>
                                        publishMutation.mutate({
                                            id: row.original.id,
                                        })
                                    }
                                >
                                    Publish
                                </Button>
                            </div>
                        );
                    return <span className="text-ink-soft">—</span>;
                },
            },
            {
                accessorKey: "status",
                header: ({ column }) => (
                    <SortHeader
                        label="Status"
                        onClick={() =>
                            column.toggleSorting(column.getIsSorted() === "asc")
                        }
                    />
                ),
                cell: ({ row }) => {
                    const { tone, label } = getOrderStatus(row.original.status);

                    return (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button
                                    type="button"
                                    aria-label={`Status: ${label}. Change status for order ${row.original.orderNumber}`}
                                    className={cn(
                                        "type-label inline-flex items-center gap-1 rounded-full py-1 pl-2.5 pr-1.5 text-[0.625rem] outline-none transition-shadow focus-visible:ring-2 focus-visible:ring-cobalt focus-visible:ring-offset-2",
                                        tone
                                    )}
                                >
                                    {label}
                                    <ChevronDown aria-hidden className="size-3" />
                                </button>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent align="start">
                                <DropdownMenuLabel>Update status</DropdownMenuLabel>

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
                                            className="rounded-lg"
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
                header: () => <span className="sr-only">Actions</span>,
                enableHiding: false,
                cell: ({ row }) => {
                    const ord = row.original;
                    const state = getShareState(ord);
                    return (
                        <div className="flex justify-end">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="size-8"
                                    >
                                        <span className="sr-only">
                                            Actions for order {ord.orderNumber}
                                        </span>
                                        <MoreHorizontal aria-hidden />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56">
                                    <DropdownMenuLabel>
                                        {ord.orderNumber}
                                    </DropdownMenuLabel>
                                    <DropdownMenuItem
                                        onClick={() =>
                                            router.push(
                                                `/order-details/${encodeURIComponent(
                                                    ord.id
                                                )}`
                                            )
                                        }
                                    >
                                        <ExternalLink aria-hidden />
                                        View order
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() =>
                                            router.push(
                                                `/admin-dashboard/orders?userId=${encodeURIComponent(
                                                    ord.customer.id
                                                )}&userName=${encodeURIComponent(
                                                    ord.customer.name
                                                )}`
                                            )
                                        }
                                    >
                                        <Users aria-hidden />
                                        Orders from this customer
                                    </DropdownMenuItem>
                                    {state === "requested" && (
                                        <>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem
                                                onClick={() =>
                                                    publishMutation.mutate({
                                                        id: ord.id,
                                                    })
                                                }
                                            >
                                                <Send aria-hidden />
                                                Publish design
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
        [router, updateStatus, publishMutation]
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
                        {table.getHeaderGroups().map((hg) => (
                            <TableRow key={hg.id}>
                                {hg.headers.map((header) => (
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
                                <TableRow
                                    key={row.id}
                                    className={cn(
                                        getShareState(row.original) ===
                                            "requested" &&
                                            "bg-cobalt-tint/35 hover:bg-cobalt-tint/50"
                                    )}
                                >
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
                            Array.from({ length: 6 }).map((_, idx) => (
                                <TableRow key={`skel-${idx}`}>
                                    <TableCell colSpan={visibleCols}>
                                        <Skeleton className="h-10 w-full" />
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={visibleCols}
                                    className="h-32 text-center text-sm text-ink-soft"
                                >
                                    No orders match these filters.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TablePanel>

            {hasNextPage && <LoadMore onClick={onLoadMore} loading={loading} />}
        </div>
    );
}
