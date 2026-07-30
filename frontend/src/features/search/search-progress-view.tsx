"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useSearch } from "@/hooks/queries";
import { getApiErrorMessage } from "@/api/axios";
import Link from "next/link";

type SearchProgressViewProps = {
  searchId: string;
};

/**
 * Progress screen — sync search already finished on create.
 * Polls status and routes to results (or shows failed).
 */
export function SearchProgressView({ searchId }: SearchProgressViewProps) {
  const router = useRouter();
  const { data, isLoading, error, refetch } = useSearch(searchId);

  useEffect(() => {
    if (data?.status === "completed") {
      router.replace(`/search/${searchId}/results`);
    }
  }, [data?.status, router, searchId]);

  if (isLoading) {
    return <Skeleton className="h-64 w-full rounded-2xl" />;
  }

  if (error) {
    return (
      <div className="space-y-4">
        <p className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {getApiErrorMessage(error)}
        </p>
        <Button type="button" variant="outline" onClick={() => void refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  if (data?.status === "failed") {
    return (
      <div className="space-y-4 rounded-2xl border border-border/50 bg-card p-8">
        <h2 className="text-xl font-semibold">Search failed</h2>
        <p className="text-sm text-muted-foreground">
          Search <span className="font-mono">{searchId}</span> did not complete.
        </p>
        <Button asChild variant="outline">
          <Link href="/dashboard">Back to dashboard</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-2xl border border-border/50 bg-card p-8">
      <h2 className="text-xl font-semibold">Search {data?.status || "…"}</h2>
      <p className="text-sm text-muted-foreground">
        {data?.query || searchId}
        {typeof data?.totalFound === "number"
          ? ` · ${data.totalFound} leads`
          : ""}
      </p>
      <p className="text-sm text-muted-foreground">
        {data?.status === "completed"
          ? "Redirecting to results…"
          : "Waiting for the backend to finish…"}
      </p>
      <Button asChild>
        <Link href={`/search/${searchId}/results`}>Open results</Link>
      </Button>
    </div>
  );
}
