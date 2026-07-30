"use client";

import Link from "next/link";
import { LeadScoreBadge } from "@/components/badges/lead-score-badge";
import { WebsiteStatusBadge } from "@/components/badges/website-status-badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AiNotes } from "@/features/lead-detail/ai-notes";
import { BusinessInformation } from "@/features/lead-detail/business-information";
import { ContactInformation } from "@/features/lead-detail/contact-information";
import { GoogleReviews } from "@/features/lead-detail/google-reviews";
import { LeadActionButtons } from "@/features/lead-detail/lead-action-buttons";
import { LeadScoreSection } from "@/features/lead-detail/lead-score-section";
import { MapLocation } from "@/features/lead-detail/map-location";
import { SeoAnalysis } from "@/features/lead-detail/seo-analysis";
import { TechnologyStack } from "@/features/lead-detail/technology-stack";
import { WebsiteAnalysis } from "@/features/lead-detail/website-analysis";
import { useLead, useLeads } from "@/hooks/queries";
import { toLeadDetail } from "@/lib/map-lead";
import { getApiErrorMessage } from "@/api/axios";

type LeadDetailViewProps = {
  searchId: string;
  leadId: string;
};

export function LeadDetailView({ searchId, leadId }: LeadDetailViewProps) {
  const leadQuery = useLead(leadId);
  const siblingsQuery = useLeads(searchId);

  if (leadQuery.isLoading) {
    return <Skeleton className="h-96 w-full rounded-2xl" />;
  }

  if (leadQuery.error) {
    return (
      <p className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
        {getApiErrorMessage(leadQuery.error)}
      </p>
    );
  }

  if (!leadQuery.data) {
    return <LeadNotFound searchId={searchId} leadId={leadId} />;
  }

  const lead = toLeadDetail(leadQuery.data);
  const siblingIds = (siblingsQuery.data || []).map((l) => l.id);
  const index = siblingIds.indexOf(leadId);
  const previousId = index > 0 ? siblingIds[index - 1] : null;
  const nextId =
    index >= 0 && index < siblingIds.length - 1 ? siblingIds[index + 1] : null;

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="space-y-4 rounded-2xl border border-border/50 bg-gradient-to-br from-card via-card to-secondary/30 p-6 md:p-8">
        <div className="flex flex-wrap items-center gap-2">
          <WebsiteStatusBadge status={lead.websiteStatus} />
          <LeadScoreBadge score={lead.leadScore} />
          <span className="text-xs text-muted-foreground">
            {lead.rating.toFixed(1)} ★ · {lead.reviews} reviews
          </span>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Search {searchId} · Lead {lead.id}
          </p>
          <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
            {lead.business}
          </h2>
          <p className="max-w-2xl text-sm text-muted-foreground md:text-base">
            {lead.category} · {[lead.city, lead.country].filter(Boolean).join(", ")}
          </p>
        </div>

        <LeadActionButtons
          searchId={searchId}
          lead={lead}
          previousId={previousId}
          nextId={nextId}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          <BusinessInformation lead={lead} />
          <ContactInformation lead={lead} />
          <WebsiteAnalysis lead={lead} />
          <SeoAnalysis lead={lead} />
          <GoogleReviews lead={lead} />
        </div>

        <div className="space-y-6 xl:sticky xl:top-24 xl:self-start">
          <LeadScoreSection lead={lead} />
          <TechnologyStack lead={lead} />
          <AiNotes lead={lead} />
          <MapLocation lead={lead} />
        </div>
      </div>
    </div>
  );
}

export function LeadNotFound({
  searchId,
  leadId,
}: {
  searchId: string;
  leadId: string;
}) {
  return (
    <div className="space-y-4 rounded-2xl border border-border/50 bg-card p-8">
      <h2 className="text-xl font-semibold">Lead not found</h2>
      <p className="text-sm text-muted-foreground">
        No lead <span className="font-mono">{leadId}</span> in search{" "}
        <span className="font-mono">{searchId}</span>.
      </p>
      <Button asChild variant="outline">
        <Link href={`/search/${searchId}/results`}>Back to results</Link>
      </Button>
    </div>
  );
}
