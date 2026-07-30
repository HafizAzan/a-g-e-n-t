import Link from "next/link";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Download,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { LeadDetail } from "@/types/lead-detail";

type LeadActionButtonsProps = {
  searchId: string;
  lead: LeadDetail;
  previousId: string | null;
  nextId: string | null;
};

/**
 * LeadActionButtons
 * Purpose: primary navigation and export actions for the detail page.
 */
export function LeadActionButtons({
  searchId,
  lead,
  previousId,
  nextId,
}: LeadActionButtonsProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
      <div className="flex flex-wrap gap-2">
        <Button asChild variant="outline">
          <Link href={`/search/${searchId}/results`}>
            <ArrowLeft className="size-4" />
            Back to results
          </Link>
        </Button>

        {previousId ? (
          <Button asChild variant="outline">
            <Link href={`/search/${searchId}/leads/${previousId}`}>
              <ChevronLeft className="size-4" />
              Previous
            </Link>
          </Button>
        ) : (
          <Button type="button" variant="outline" disabled>
            <ChevronLeft className="size-4" />
            Previous
          </Button>
        )}

        {nextId ? (
          <Button asChild variant="outline">
            <Link href={`/search/${searchId}/leads/${nextId}`}>
              Next
              <ChevronRight className="size-4" />
            </Link>
          </Button>
        ) : (
          <Button type="button" variant="outline" disabled>
            Next
            <ChevronRight className="size-4" />
          </Button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {lead.website ? (
          <Button asChild variant="outline">
            <a
              href={`https://${lead.website}`}
              target="_blank"
              rel="noreferrer"
            >
              <ExternalLink className="size-4" />
              Visit website
            </a>
          </Button>
        ) : null}

        <Button asChild>
          <Link href={`/search/${searchId}/export?ids=${lead.id}`}>
            <Download className="size-4" />
            Export this lead
          </Link>
        </Button>
      </div>
    </div>
  );
}
