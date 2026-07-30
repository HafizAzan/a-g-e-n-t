import { PageHeader } from "@/components/layout/page-header";
import { SearchForm } from "@/features/search/search-form";

type NewSearchViewProps = {
  initialQuery?: string;
};

/**
 * NewSearchView
 * Purpose: page composition for the New Search screen.
 */
export function NewSearchView({ initialQuery }: NewSearchViewProps) {
  return (
    <div className="space-y-8">
      <PageHeader
        title="New Search"
        description="Configure who to find. When you start, we'll simulate an AI run and take you to Search Progress."
      />

      <SearchForm initialQuery={initialQuery} />
    </div>
  );
}
