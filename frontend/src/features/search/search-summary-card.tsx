import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LabelValueRow } from "@/components/forms/label-value-row";
import { cardSurfaceSoft } from "@/lib/ui-classes";
import type { NewSearchFormValues } from "@/types/new-search";

type SearchSummaryCardProps = {
  values: NewSearchFormValues;
};

function getWebsiteSummary(values: NewSearchFormValues) {
  const parts: string[] = [];

  if (values.hasWebsite) parts.push("Has website");
  if (values.noWebsite) parts.push("No website");
  if (values.onlyPoorWebsite) parts.push("Poor website only");
  if (values.onlyVerified) parts.push("Verified only");

  return parts.length > 0 ? parts.join(" · ") : "No website filters";
}

/**
 * SearchSummaryCard
 * Purpose: live preview of what the AI will search for.
 */
export function SearchSummaryCard({ values }: SearchSummaryCardProps) {
  const location = [values.city, values.state, values.country]
    .filter(Boolean)
    .join(", ");

  return (
    <Card className={cardSurfaceSoft}>
      <CardHeader>
        <CardTitle className="text-base">Search summary</CardTitle>
        <CardDescription>
          Review this before starting. Nothing is sent to a backend yet.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <dl className="space-y-3 text-sm">
          <LabelValueRow
            layout="inline"
            label="Business"
            value={values.businessType || "Not set"}
          />
          <LabelValueRow
            layout="inline"
            label="Location"
            value={location || "Not set"}
          />
          <LabelValueRow
            layout="inline"
            label="Radius"
            value={values.radius ? `${values.radius} km` : "Not set"}
          />
          <LabelValueRow
            layout="inline"
            label="Max results"
            value={String(values.maximumResults || "—")}
          />
          <LabelValueRow
            layout="inline"
            label="Min rating"
            value={`${values.minimumRating.toFixed(1)} ★`}
          />
          <LabelValueRow
            layout="inline"
            label="Filters"
            value={getWebsiteSummary(values)}
          />
        </dl>
      </CardContent>
    </Card>
  );
}
