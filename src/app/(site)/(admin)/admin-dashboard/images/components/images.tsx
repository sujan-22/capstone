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
import { ArrowUpDown, ExternalLink, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
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
import { Checkbox } from "@/components/ui/checkbox";
import type { AdminImageItem } from "../actions/actions";
import Image from "next/image";
import Link from "next/link";

export function ImagesTable({
    rows,
    loading,
    hasNextPage,
    onLoadMore,
    onToggleActive,
}: {
    rows: AdminImageItem[];
    loading?: boolean;
    hasNextPage?: boolean;
    onLoadMore?: () => void;
    onToggleActive: (id: string, next: boolean) => Promise<void>;
}) {
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnVisibility, setColumnVisibility] =
        React.useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = React.useState({});

    const columns = React.useMemo<ColumnDef<AdminImageItem>[]>(
        () => [
            {
                id: "preview",
                header: " ",
                cell: ({ row }) => (
                    <div className="h-10 w-10 overflow-hidden rounded-md border bg-muted">
                        <Image
                            src={row.original.url}
                            alt="preview"
                            className="object-cover"
                            width={40}
                            height={40}
                        />
                    </div>
                ),
                enableSorting: false,
                size: 48,
            },
            {
                accessorKey: "url",
                header: "URL",
                cell: ({ row }) => (
                    <div className="max-w-[420px] truncate text-muted-foreground">
                        {row.original.url}
                    </div>
                ),
            },
            {
                id: "active",
                header: "Active",
                cell: ({ row }) => {
                    const cur = !!row.original.active;
                    return (
                        <div className="flex items-center justify-center">
                            <Checkbox
                                checked={cur}
                                onCheckedChange={async (checked) => {
                                    const next = Boolean(checked);
                                    await onToggleActive(row.original.id, next);
                                }}
                                aria-label="Toggle active"
                            />
                        </div>
                    );
                },
                meta: { align: "center" },
            },
            {
                accessorKey: "usageCount",
                header: ({ column }) => (
                    <div className="text-center">
                        <Button
                            variant="ghost"
                            onClick={() =>
                                column.toggleSorting(
                                    column.getIsSorted() === "asc"
                                )
                            }
                            className="px-0"
                        >
                            Usage
                            <ArrowUpDown className="ml-2 size-4" />
                        </Button>
                    </div>
                ),
                cell: ({ row }) => (
                    <div className="text-center">
                        {row.original.usageCount ?? 0}
                    </div>
                ),
            },
            {
                accessorKey: "createdAt",
                header: ({ column }) => (
                    <Button
                        variant="ghost"
                        onClick={() =>
                            column.toggleSorting(column.getIsSorted() === "asc")
                        }
                        className="px-0"
                    >
                        Added
                        <ArrowUpDown className="ml-2 size-4" />
                    </Button>
                ),
                cell: ({ row }) => (
                    <div className="text-muted-foreground">
                        {new Date(row.original.createdAt).toLocaleDateString()}
                    </div>
                ),
            },
            {
                accessorKey: "lastUsedAt",
                header: ({ column }) => (
                    <Button
                        variant="ghost"
                        onClick={() =>
                            column.toggleSorting(column.getIsSorted() === "asc")
                        }
                        className="px-0"
                    >
                        Last used
                        <ArrowUpDown className="ml-2 size-4" />
                    </Button>
                ),
                cell: ({ row }) => (
                    <div className="text-muted-foreground">
                        {row.original.lastUsedAt
                            ? new Date(
                                  row.original.lastUsedAt
                              ).toLocaleDateString()
                            : "—"}
                    </div>
                ),
            },
            {
                id: "actions",
                enableHiding: false,
                cell: ({ row }) => {
                    const img = row.original;

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
                                <DropdownMenuItem asChild>
                                    <Link
                                        href={img.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex w-full items-center"
                                    >
                                        <ExternalLink className="mr-2 h-4 w-4" />
                                        Open image
                                    </Link>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    );
                },
            },
        ],
        [onToggleActive]
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
            <div className="overflow-hidden rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
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
                        {rows.length > 0 ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={
                                        row.getIsSelected() && "selected"
                                    }
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell
                                            key={cell.id}
                                            className={
                                                cell.column.id === "usageCount"
                                                    ? "text-right"
                                                    : undefined
                                            }
                                        >
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : loading ? (
                            <>
                                {Array.from({ length: 5 }).map((_, r) => (
                                    <TableRow key={`skel-${r}`}>
                                        <TableCell
                                            colSpan={visibleCols}
                                            className="py-2"
                                        >
                                            <Skeleton className="h-6 w-full" />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </>
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={visibleCols}
                                    className="h-24 text-center text-sm text-muted-foreground"
                                >
                                    No images found.
                                </TableCell>
                            </TableRow>
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
