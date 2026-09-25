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
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { PhoneModelDTO } from "../../actions/actions";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

type ColMeta = { th?: string; td?: string };

interface Props {
    rows: PhoneModelDTO[];
    loading?: boolean;
    hasNextPage?: boolean;
    onLoadMore?: () => void;
    onToggleActive?: (id: string, next: boolean) => void;
}

export const Models: React.FC<Props> = ({
    rows,
    loading,
    hasNextPage,
    onLoadMore,
    onToggleActive,
}) => {
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnVisibility, setColumnVisibility] =
        React.useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = React.useState({});

    const columns = React.useMemo<ColumnDef<PhoneModelDTO, unknown>[]>(
        () => [
            {
                id: "active",
                header: () => <span>Active</span>,
                enableSorting: false,
                enableHiding: false,
                cell: ({ row }) => (
                    <div className="flex justify-center">
                        <Checkbox
                            checked={!!row.original.active}
                            onCheckedChange={(val) => {
                                if (!onToggleActive) return;
                                onToggleActive(row.original.id, Boolean(val));
                            }}
                            aria-label={`Set ${row.original.modelName} active`}
                            disabled={!onToggleActive}
                        />
                    </div>
                ),
                meta: { th: "w-14 text-center", td: "text-center" } as ColMeta,
            },
            {
                accessorKey: "modelName",
                header: ({ column }) => (
                    <Button
                        variant="ghost"
                        onClick={() =>
                            column.toggleSorting(column.getIsSorted() === "asc")
                        }
                        className="px-0"
                    >
                        Model
                        <ArrowUpDown className="ml-2 size-4" />
                    </Button>
                ),
                cell: ({ row }) => (
                    <div className="font-medium truncate">
                        {row.original.modelName}
                    </div>
                ),
                meta: { th: "w-[10rem]", td: "" } as ColMeta,
            },
            {
                accessorKey: "modelBrand",
                header: ({ column }) => (
                    <Button
                        variant="ghost"
                        onClick={() =>
                            column.toggleSorting(column.getIsSorted() === "asc")
                        }
                        className="px-0"
                    >
                        Brand
                        <ArrowUpDown className="ml-2 size-4" />
                    </Button>
                ),
                cell: ({ row }) => (
                    <span className="text-muted-foreground truncate">
                        {row.original.modelBrand ?? "—"}
                    </span>
                ),
                sortingFn: (a, b) =>
                    (a.original.modelBrand ?? "").localeCompare(
                        b.original.modelBrand ?? ""
                    ),
                meta: { th: "w-[15rem]", td: "" } as ColMeta,
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
            <div
                className="overflow-hidden rounded-md border"
                aria-busy={loading ? "true" : "false"}
            >
                <Table className="table-fixed">
                    <TableHeader>
                        {table.getHeaderGroups().map((hg) => (
                            <TableRow key={hg.id}>
                                {hg.headers.map((header) => {
                                    const meta = header.column.columnDef
                                        .meta as ColMeta | undefined;
                                    return (
                                        <TableHead
                                            key={header.id}
                                            className={cn(
                                                "whitespace-nowrap",
                                                meta?.th
                                            )}
                                        >
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                      header.column.columnDef
                                                          .header,
                                                      header.getContext()
                                                  )}
                                        </TableHead>
                                    );
                                })}
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
                                    {row.getVisibleCells().map((cell) => {
                                        const meta = cell.column.columnDef
                                            .meta as ColMeta | undefined;
                                        return (
                                            <TableCell
                                                key={cell.id}
                                                className={meta?.td}
                                            >
                                                {flexRender(
                                                    cell.column.columnDef.cell,
                                                    cell.getContext()
                                                )}
                                            </TableCell>
                                        );
                                    })}
                                </TableRow>
                            ))
                        ) : loading ? (
                            <>
                                {Array.from({ length: 5 }).map((_, idx) => (
                                    <TableRow key={`skel-${idx}`}>
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
                                    No models found.
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
};
