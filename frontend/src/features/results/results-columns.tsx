"use client";

import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, ExternalLink, Eye } from "lucide-react";
import { LeadScoreBadge } from "@/components/badges/lead-score-badge";
import { WebsiteStatusBadge } from "@/components/badges/website-status-badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import type { ResultLead } from "@/types/result-lead";

type CreateResultsColumnsOptions = {
  searchId: string;
};

/**
 * Tiny reusable sort button for column headers.
 */
function SortHeader({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="-ml-2 h-8"
      onClick={onClick}
      aria-label={`Sort by ${label}`}
    >
      {label}
      <ArrowUpDown className="size-3.5 opacity-60" aria-hidden="true" />
    </Button>
  );
}

/**
 * createResultsColumns
 * Purpose: define every Results table column in one place.
 * Keeping this as a function lets us pass searchId into Actions links.
 */
export function createResultsColumns({
  searchId,
}: CreateResultsColumnsOptions): ColumnDef<ResultLead>[] {
  return [
    {
      id: "select",
      enableSorting: false,
      enableHiding: false,
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) =>
            table.toggleAllPageRowsSelected(value === true)
          }
          aria-label="Select all rows on this page"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(value === true)}
          aria-label={`Select ${row.original.business}`}
        />
      ),
    },
    {
      accessorKey: "business",
      header: ({ column }) => (
        <SortHeader
          label="Business"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        />
      ),
      cell: ({ row }) => (
        <div className="min-w-[160px] font-medium">{row.original.business}</div>
      ),
    },
    {
      accessorKey: "phone",
      header: ({ column }) => (
        <SortHeader
          label="Phone"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        />
      ),
      cell: ({ row }) => (
        <span className="whitespace-nowrap text-muted-foreground">
          {row.original.phone}
        </span>
      ),
    },
    {
      accessorKey: "email",
      header: ({ column }) => (
        <SortHeader
          label="Email"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        />
      ),
      cell: ({ row }) => (
        <span className="max-w-[200px] truncate block">{row.original.email}</span>
      ),
    },
    {
      accessorKey: "website",
      header: "Website",
      cell: ({ row }) => {
        const website = row.original.website;
        if (!website) {
          return <span className="text-muted-foreground">â€”</span>;
        }

        return (
          <a
            href={`https://${website}`}
            target="_blank"
            rel="noreferrer"
            aria-label={`${website} (opens in a new tab)`}
            className="inline-flex max-w-[180px] items-center gap-1 truncate text-sky-300 hover:underline"
            onClick={(event) => event.stopPropagation()}
          >
            {website}
            <ExternalLink
              className="size-3 shrink-0 opacity-70"
              aria-hidden="true"
            />
          </a>
        );
      },
    },
    {
      accessorKey: "websiteStatus",
      header: ({ column }) => (
        <SortHeader
          label="Website Status"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        />
      ),
      // Used by the status filter dropdown
      filterFn: "equalsString",
      cell: ({ row }) => (
        <WebsiteStatusBadge status={row.original.websiteStatus} />
      ),
    },
    {
      accessorKey: "leadScore",
      header: ({ column }) => (
        <SortHeader
          label="Lead Score"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        />
      ),
      cell: ({ row }) => <LeadScoreBadge score={row.original.leadScore} />,
    },
    {
      accessorKey: "rating",
      header: ({ column }) => (
        <SortHeader
          label="Rating"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        />
      ),
      cell: ({ row }) => (
        <span className="tabular-nums">{row.original.rating.toFixed(1)}</span>
      ),
    },
    {
      accessorKey: "reviews",
      header: ({ column }) => (
        <SortHeader
          label="Reviews"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        />
      ),
      cell: ({ row }) => (
        <span className="tabular-nums text-muted-foreground">
          {row.original.reviews}
        </span>
      ),
    },
    {
      accessorKey: "city",
      header: ({ column }) => (
        <SortHeader
          label="City"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        />
      ),
    },
    {
      accessorKey: "country",
      header: ({ column }) => (
        <SortHeader
          label="Country"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        />
      ),
      filterFn: "equalsString",
    },
    {
      id: "actions",
      enableSorting: false,
      enableHiding: false,
      header: "Actions",
      cell: ({ row }) => (
        <Button asChild variant="ghost" size="sm">
          <Link
            href={`/search/${searchId}/leads/${row.original.id}`}
            aria-label={`View ${row.original.business}`}
          >
            <Eye className="size-3.5" aria-hidden="true" />
            View
          </Link>
        </Button>
      ),
    },
  ];
}
