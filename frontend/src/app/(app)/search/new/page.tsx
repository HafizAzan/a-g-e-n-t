import { NewSearchView } from "@/features/search/new-search-view";

type NewSearchPageProps = {
  searchParams: Promise<{ q?: string }>;
};

/**
 * New Search page
 * Thin route: reads optional ?q= from Quick Search, renders the form view.
 */
export default async function NewSearchPage({
  searchParams,
}: NewSearchPageProps) {
  const params = await searchParams;
  const initialQuery = params.q?.trim() || undefined;

  return <NewSearchView initialQuery={initialQuery} />;
}
