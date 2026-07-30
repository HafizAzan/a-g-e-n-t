import { Search } from "lucide-react";
import { DetailRow } from "@/features/lead-detail/detail-row";
import { DetailSectionCard } from "@/features/lead-detail/detail-section-card";
import type { LeadDetail } from "@/types/lead-detail";

type SeoAnalysisProps = {
  lead: LeadDetail;
};

/**
 * SeoAnalysis
 * Purpose: mock on-page SEO snapshot and issues list.
 */
export function SeoAnalysis({ lead }: SeoAnalysisProps) {
  const seo = lead.seoAnalysis;

  return (
    <DetailSectionCard
      title="SEO Analysis"
      description="Basic search-visibility signals."
      action={
        <div className="flex size-9 items-center justify-center rounded-lg bg-secondary">
          <Search className="size-4 text-muted-foreground" />
        </div>
      }
    >
      <DetailRow label="SEO score" value={`${seo.score}/100`} />
      <DetailRow label="Title tag" value={seo.titleTag} />
      <DetailRow label="Meta description" value={seo.metaDescription} />
      <DetailRow label="H1 count" value={String(seo.h1Count)} />
      <DetailRow label="Indexed pages" value={String(seo.indexedPages)} />
      <div className="pt-3">
        <p className="mb-2 text-xs text-muted-foreground">Issues</p>
        <ul className="space-y-2">
          {seo.issues.map((issue) => (
            <li
              key={issue}
              className="rounded-lg border border-border/50 bg-secondary/30 px-3 py-2 text-sm"
            >
              {issue}
            </li>
          ))}
        </ul>
      </div>
    </DetailSectionCard>
  );
}
