import { LeadScoreBadge } from "@/components/badges/lead-score-badge";
import { WebsiteStatusBadge } from "@/components/badges/website-status-badge";
import { EmptyState } from "@/components/feedback/empty-state";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getInitials } from "@/lib/get-initials";
import { cardSurface, sectionTitle } from "@/lib/ui-classes";
import type { ResultLead } from "@/types/result-lead";
import { Users } from "lucide-react";
import Link from "next/link";

type LatestLeadsProps = {
  leads: ResultLead[];
};

export function LatestLeads({ leads }: LatestLeadsProps) {
  return (
    <section className="space-y-4">
      <div className="space-y-1">
        <h2 className={sectionTitle}>Latest Leads</h2>
        <p className="text-sm text-muted-foreground">
          Fresh matches from your recent searches.
        </p>
      </div>

      {leads.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No leads yet"
          description="Leads will appear here after a search finishes."
        />
      ) : (
        <Card className={cardSurface}>
          <CardHeader className="border-b border-border/50">
            <CardTitle className="text-base">Newest matches</CardTitle>
            <CardDescription>
              Showing {leads.length} recent lead
              {leads.length === 1 ? "" : "s"}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <ul className="divide-y divide-border/50">
              {leads.map((lead) => {
                const content = (
                  <>
                    <Avatar className="size-10">
                      <AvatarFallback className="bg-secondary text-xs font-medium">
                        {getInitials(lead.business)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-sm font-medium">
                          {lead.business}
                        </p>
                        <WebsiteStatusBadge status={lead.websiteStatus} />
                      </div>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {[lead.city, lead.country].filter(Boolean).join(", ") ||
                          "—"}
                        {lead.phone ? ` · ${lead.phone}` : ""}
                      </p>
                    </div>

                    <LeadScoreBadge
                      score={lead.leadScore}
                      className="shrink-0"
                    />
                  </>
                );

                if (!lead.searchId) {
                  return (
                    <li key={lead.id}>
                      <div className="flex items-center gap-3 px-4 py-3.5 md:px-5">
                        {content}
                      </div>
                    </li>
                  );
                }

                return (
                  <li key={lead.id}>
                    <Link
                      href={`/search/${lead.searchId}/leads/${lead.id}`}
                      className="flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-secondary/40 md:px-5"
                    >
                      {content}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>
      )}
    </section>
  );
}
