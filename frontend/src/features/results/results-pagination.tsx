"use client";

import type { Table } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ResultLead } from "@/types/result-lead";

type ResultsPaginationProps = {
  table: Table<ResultLead>;
};

/**
 * ResultsPagination
 * Purpose: page size + previous/next controls for the table.
 */
export function ResultsPagination({ table }: ResultsPaginationProps) {
  const pageIndex = table.getState().pagination.pageIndex;
  const pageCount = table.getPageCount();
  const selectedOnPage = table.getFilteredSelectedRowModel().rows.length;
  const filteredTotal = table.getFilteredRowModel().rows.length;

  return (
    <div className="flex flex-col gap-3 border-t border-border/50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs text-muted-foreground">
        {selectedOnPage} selected · {filteredTotal} result
        {filteredTotal === 1 ? "" : "s"}
      </p>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2">
          <label
            htmlFor="results-page-size"
            className="text-xs text-muted-foreground whitespace-nowrap"
          >
            Rows per page
          </label>
          <Select
            value={String(table.getState().pagination.pageSize)}
            onValueChange={(value) => table.setPageSize(Number(value))}
          >
            <SelectTrigger
              id="results-page-size"
              className="h-8 w-[84px]"
              aria-label="Rows per page"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[5, 10, 20, 30].map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <p className="text-xs text-muted-foreground tabular-nums">
          Page {pageCount === 0 ? 0 : pageIndex + 1} of {pageCount}
        </p>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
