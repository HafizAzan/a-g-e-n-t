import Link from "next/link";
import { StatusBadge } from "@/components/badges/status-badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cardSurface } from "@/lib/ui-classes";
import { cn } from "@/lib/utils";
import type { SearchRun } from "@/types/search";

type SearchCardProps = {
  search: SearchRun;
};

/**
 * SearchCard
 * Purpose: one recent search as a clickable summary card.
 */
export function SearchCard({ search }: SearchCardProps) {
  const href =
    search.status === "running" || search.status === "queued"
      ? `/search/${search.id}/progress`
      : `/search/${search.id}/results`;

  return (
    <Link
      href={href}
      className={cn(
        "block rounded-xl outline-none transition-transform",
        "focus-visible:ring-2 focus-visible:ring-ring"
      )}
    >
      <Card
        className={cn(cardSurface, "h-full transition-colors hover:bg-card")}
      >
        <CardHeader className="gap-3">
          <div className="flex items-start justify-between gap-3">
            <CardTitle className="text-base leading-snug">
              {search.title}
            </CardTitle>
            <StatusBadge status={search.status} />
          </div>
          <CardDescription className="line-clamp-2">
            {search.summary}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{search.leadCount} leads</span>
            <span>{search.createdAt}</span>
          </div>

          {search.status === "running" ? (
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-blue-400 transition-all"
                style={{ width: `${search.progressPercent}%` }}
              />
            </div>
          ) : null}
        </CardContent>
      </Card>
    </Link>
  );
}
