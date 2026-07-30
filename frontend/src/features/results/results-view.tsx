"use client";

import Link from "next/link";
import { ArrowLeft, Download } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ResultsTable } from "@/features/results/results-table";
import { useLeads } from "@/hooks/queries";
import { toResultLead } from "@/lib/map-lead";
import { getApiErrorMessage } from "@/api/axios";

type ResultsViewProps = {
  searchId: string;
};

export function ResultsView({ searchId }: ResultsViewProps) {
  const { data, isLoading, error } = useLeads(searchId);
  const leads = (data || []).map(toResultLead);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-24 w-full rounded-2xl" />
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    );
  }

  if (error) {
    return (
      <p className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
        {getApiErrorMessage(error)}
      </p>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8">
      <PageHeader
        eyebrow={`Search ${searchId}`}
        title="Results"
        description={`${leads.length} leads found. Sort, filter, select rows, then export.`}
        actions={
          <>
            <Button asChild variant="outline">
              <Link href="/dashboard">
                <ArrowLeft className="size-4" aria-hidden="true" />
                Dashboard
              </Link>
            </Button>
            <Button asChild>
              <Link href={`/search/${searchId}/export`}>
                <Download className="size-4" aria-hidden="true" />
                Export
              </Link>
            </Button>
          </>
        }
      />

      <ResultsTable searchId={searchId} data={leads} />
    </div>
  );
}
