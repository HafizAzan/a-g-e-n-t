import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type ExportPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ ids?: string }>;
};

/**
 * Lightweight Export stub so Results export actions have a destination.
 * Full Export UI comes in a later pass.
 */
export default async function ExportStubPage({
  params,
  searchParams,
}: ExportPageProps) {
  const { id } = await params;
  const query = await searchParams;
  const selectedIds = query.ids?.split(",").filter(Boolean) ?? [];

  return (
    <div className="space-y-6">
      <Button asChild variant="outline">
        <Link href={`/search/${id}/results`}>
          <ArrowLeft className="size-4" />
          Back to results
        </Link>
      </Button>

      <Card className="border-border/50 bg-card/80">
        <CardHeader>
          <CardTitle>Export</CardTitle>
          <CardDescription>
            Full export screen coming next. This stub confirms your selection.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            Search: <code className="text-foreground">{id}</code>
          </p>
          <p>
            {selectedIds.length > 0
              ? `${selectedIds.length} selected lead(s): ${selectedIds.join(", ")}`
              : "Exporting all results from this search."}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
