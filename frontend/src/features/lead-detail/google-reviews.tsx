import { Star } from "lucide-react";
import { DetailSectionCard } from "@/features/lead-detail/detail-section-card";
import type { LeadDetail } from "@/types/lead-detail";

type GoogleReviewsProps = {
  lead: LeadDetail;
};

/**
 * GoogleReviews
 * Purpose: mock review cards plus overall rating summary.
 */
export function GoogleReviews({ lead }: GoogleReviewsProps) {
  return (
    <DetailSectionCard
      title="Google Reviews"
      description={`${lead.rating.toFixed(1)} ★ · ${lead.reviews} total reviews`}
      action={
        <div className="flex size-9 items-center justify-center rounded-lg bg-secondary">
          <Star className="size-4 text-muted-foreground" />
        </div>
      }
    >
      <div className="space-y-3">
        {lead.googleReviews.map((review) => (
          <article
            key={`${review.author}-${review.date}`}
            className="rounded-xl border border-border/50 bg-secondary/20 p-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-medium">{review.author}</p>
              <p className="text-xs text-muted-foreground">{review.date}</p>
            </div>
            <p className="mt-1 text-xs text-amber-300">
              {"★".repeat(review.rating)}
              <span className="text-zinc-600">
                {"★".repeat(Math.max(0, 5 - review.rating))}
              </span>
            </p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {review.text}
            </p>
          </article>
        ))}
      </div>
    </DetailSectionCard>
  );
}
