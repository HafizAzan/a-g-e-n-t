"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { createResultsColumns } from "@/features/results/results-columns";
import { ResultsPagination } from "@/features/results/results-pagination";
import { ResultsToolbar } from "@/features/results/results-toolbar";
import { cardSurface } from "@/lib/ui-classes";
import { cn } from "@/lib/utils";
import type { ResultLead } from "@/types/result-lead";

type ResultsTableProps = {
  searchId: string;
  data: ResultLead[];
};

/**
 * ResultsTable
 * Purpose: TanStack Table with sorting, filters, search, pagination,
 * column visibility, sticky header, and row selection.
 */
export function ResultsTable({ searchId, data }: ResultsTableProps) {
  const router = useRouter();

  // All interactive table state lives here (easy to follow)
  const [sorting, setSorting] = useState<SortingState>([
    { id: "leadScore", desc: true },
  ]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState("");

  const columns = useMemo(
    () => createResultsColumns({ searchId }),
    [searchId]
  );

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    // Search across these text fields
    globalFilterFn: "includesString",
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  const selectedCount = table.getFilteredSelectedRowModel().rows.length;

  function goToExport(selectedOnly: boolean) {
    const params = new URLSearchParams();

    if (selectedOnly) {
      const ids = table
        .getFilteredSelectedRowModel()
        .rows.map((row) => row.original.id)
        .join(",");
      params.set("ids", ids);
    }

    const query = params.toString();
    router.push(
      query
        ? `/search/${searchId}/export?${query}`
        : `/search/${searchId}/export`
    );
  }

  return (
    <div className="space-y-4">
      <ResultsToolbar
        table={table}
        globalFilter={globalFilter}
        onGlobalFilterChange={setGlobalFilter}
        selectedCount={selectedCount}
        onExportSelected={() => goToExport(true)}
        onExportAll={() => goToExport(false)}
        onClearSelection={() => setRowSelection({})}
      />

      <div className={cn("overflow-hidden rounded-xl", cardSurface)}>
        {/* Horizontal scroll on small screens */}
        <div className="relative max-h-[min(70vh,720px)] overflow-auto">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-card/95 backdrop-blur">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="hover:bg-transparent">
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className="whitespace-nowrap border-b border-border/60"
                    >
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
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className={cn(
                      "cursor-default",
                      row.getIsSelected() && "bg-secondary/40"
                    )}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="align-middle">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-28 text-center text-muted-foreground"
                  >
                    No results match your search or filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <ResultsPagination table={table} />
      </div>
    </div>
  );
}
