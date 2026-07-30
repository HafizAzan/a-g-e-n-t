"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { SearchInput } from "@/components/forms/search-input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cardSurface } from "@/lib/ui-classes";

/**
 * QuickSearch
 * Purpose: lightweight search box on the Dashboard.
 * Submits to /search/new?q=... so New Search can prefill later.
 */
export function QuickSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmed = query.trim();
    const params = new URLSearchParams();

    if (trimmed) {
      params.set("q", trimmed);
    }

    const url = params.size > 0 ? `/search/new?${params}` : "/search/new";
    router.push(url);
  }

  return (
    <Card className={cardSurface}>
      <CardHeader>
        <CardTitle>Quick Search</CardTitle>
        <CardDescription>
          Describe who you want to find. We&apos;ll take you to New Search.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-3 sm:flex-row"
        >
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder="e.g. VP Sales at SaaS companies in Singapore"
            aria-label="Quick search query"
            className="flex-1"
          />
          <Button type="submit" className="h-10 sm:px-5">
            Start
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
