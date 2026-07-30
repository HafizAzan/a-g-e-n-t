"use client";

import type { Table } from "@tanstack/react-table";
import { Columns3, Download, X } from "lucide-react";
import { SearchInput } from "@/components/forms/search-input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ResultLead } from "@/types/result-lead";

type ResultsToolbarProps = {
  table: Table<ResultLead>;
  globalFilter: string;
  onGlobalFilterChange: (value: string) => void;
  selectedCount: number;
  onExportSelected: () => void;
  onExportAll: () => void;
  onClearSelection: () => void;
};

const columnLabels: Record<string, string> = {
  business: "Business",
  phone: "Phone",
  email: "Email",
  website: "Website",
  websiteStatus: "Website Status",
  leadScore: "Lead Score",
  rating: "Rating",
  reviews: "Reviews",
  city: "City",
  country: "Country",
};

/**
 * ResultsToolbar
 * Purpose: search, filters, column visibility, and export actions.
 */
export function ResultsToolbar({
  table,
  globalFilter,
  onGlobalFilterChange,
  selectedCount,
  onExportSelected,
  onExportAll,
  onClearSelection,
}: ResultsToolbarProps) {
  const websiteStatus = table.getColumn("websiteStatus");
  const country = table.getColumn("country");

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <SearchInput
          value={globalFilter}
          onChange={onGlobalFilterChange}
          placeholder="Search business, email, city…"
          aria-label="Search results"
          className="w-full lg:max-w-sm"
        />

        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
          <Select
            value={
              (websiteStatus?.getFilterValue() as string | undefined) ?? "all"
            }
            onValueChange={(value) =>
              websiteStatus?.setFilterValue(value === "all" ? undefined : value)
            }
          >
            <SelectTrigger
              className="h-10 w-full sm:w-[180px]"
              aria-label="Filter by website status"
            >
              <SelectValue placeholder="Website status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="good">Good</SelectItem>
              <SelectItem value="poor">Poor</SelectItem>
              <SelectItem value="none">No website</SelectItem>
              <SelectItem value="unknown">Unknown</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={(country?.getFilterValue() as string | undefined) ?? "all"}
            onValueChange={(value) =>
              country?.setFilterValue(value === "all" ? undefined : value)
            }
          >
            <SelectTrigger
              className="h-10 w-full sm:w-[200px]"
              aria-label="Filter by country"
            >
              <SelectValue placeholder="Country" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All countries</SelectItem>
              <SelectItem value="United States">United States</SelectItem>
              <SelectItem value="United Kingdom">United Kingdom</SelectItem>
              <SelectItem value="Canada">Canada</SelectItem>
              <SelectItem value="Australia">Australia</SelectItem>
              <SelectItem value="United Arab Emirates">
                United Arab Emirates
              </SelectItem>
              <SelectItem value="Pakistan">Pakistan</SelectItem>
              <SelectItem value="Singapore">Singapore</SelectItem>
            </SelectContent>
          </Select>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" variant="outline" className="h-10">
                <Columns3 className="size-4" aria-hidden="true" />
                Columns
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(value === true)
                    }
                  >
                    {columnLabels[column.id] ?? column.id}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            type="button"
            variant="outline"
            className="h-10"
            onClick={onExportAll}
          >
            <Download className="size-4" aria-hidden="true" />
            Export all
          </Button>
        </div>
      </div>

      {selectedCount > 0 ? (
        <div className="flex flex-col gap-3 rounded-xl border border-border/60 bg-secondary/40 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm" aria-live="polite">
            <span className="font-medium tabular-nums">{selectedCount}</span>{" "}
            selected
          </p>
          <div className="flex flex-wrap gap-2">
            <Button type="button" size="sm" onClick={onExportSelected}>
              <Download className="size-3.5" aria-hidden="true" />
              Export selected
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={onClearSelection}
            >
              <X className="size-3.5" aria-hidden="true" />
              Clear
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
