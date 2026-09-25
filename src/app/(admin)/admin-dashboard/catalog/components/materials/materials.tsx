"use client";

import { formatPrice } from "@/lib/utils";

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
import {
    CaseMaterialDTO,
    catalogKeys,
    updateMaterial,
} from "../../actions/actions";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { EditMaterialDialog } from "./edit-material";
import { updateMaterialSchema } from "@/schema/catalog";

type ColMeta = { th?: string; td?: string };

interface Props {
    rows: CaseMaterialDTO[];
    loading?: boolean;
    hasNextPage?: boolean;
    onLoadMore?: () => void;
    onToggleActive?: (id: string, next: boolean) => void;
}

export const Materials: React.FC<Props> = ({
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
    const qc = useQueryClient();

    const updateMaterialMutation = useMutation({
        mutationFn: (vars: {
            id: string;
            name?: string;
            description?: string | null;
            price?: number;
        }) =>
            updateMaterial({
                id: vars.id,
                data: {
                    name: vars.name,
                    description: vars.description,
                    price: vars.price,
                },
            }),
        onSuccess: async () => {
            await Promise.all([
                qc.invalidateQueries({
                    queryKey: ["catalog", "materials"],
                    exact: false,
                }),

                qc.invalidateQueries({
                    queryKey: catalogKeys.all,
                    exact: false,
                }),
            ]);
        },
    });

    const columns = React.useMemo<ColumnDef<CaseMaterialDTO, unknown>[]>(
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
                            aria-label={`Set ${row.original.name} active`}
                            disabled={!onToggleActive}
                        />
                    </div>
                ),
                meta: { th: "w-14 text-center", td: "text-center" } as ColMeta,
            },
            {
                accessorKey: "name",
                header: ({ column }) => (
                    <Button
                        variant="ghost"
                        onClick={() =>
                            column.toggleSorting(column.getIsSorted() === "asc")
                        }
                        className="px-0"
                    >
                        Name
                        <ArrowUpDown className="ml-2 size-4" />
                    </Button>
                ),
                cell: ({ row }) => (
                    <div className="font-medium truncate">
                        {row.original.name}
                    </div>
                ),
                meta: { th: "w-[5rem]", td: "" } as ColMeta,
            },
            {
                id: "price",
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
                            Price
                            <ArrowUpDown className="ml-2 size-4" />
                        </Button>
                    </div>
                ),
                sortingFn: (a, b) => a.original.price - b.original.price,
                cell: ({ row }) => (
                    <div className="text-center font-medium">
                        {formatPrice(row.original.price)}
                    </div>
                ),
                meta: {
                    th: "w-[5rem] text-center",
                    td: "text-center",
                } as ColMeta,
            },
            {
                accessorKey: "description",
                header: "Description",
                cell: ({ row }) => (
                    <div className="text-muted-foreground line-clamp-2">
                        {row.original.description ?? "—"}
                    </div>
                ),
                meta: { th: "w-[15rem]", td: "" } as ColMeta,
            },
            {
                id: "edit",
                header: () => <span className="sr-only">Edit</span>,
                cell: ({ row }) => (
                    <div className="flex justify-center">
                        <EditMaterialDialog
                            initialData={{
                                name: row.original.name,
                                description: row.original.description ?? "",
                                price: row.original.price,
                            }}
                            schema={updateMaterialSchema}
                            onSubmit={(vals) =>
                                updateMaterialMutation.mutate({
                                    id: row.original.id,
                                    name: vals.name,
                                    description: vals.description ?? "",
                                    price: Number(vals.price) || 0,
                                })
                            }
                            isPending={updateMaterialMutation.isPending}
                        />
                    </div>
                ),
                enableSorting: false,
                meta: { th: "w-12 text-center", td: "text-center" } as ColMeta,
            },
        ],
        [onToggleActive, updateMaterialMutation]
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
                                    No materials found.
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
