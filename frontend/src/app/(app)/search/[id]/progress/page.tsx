import { SearchProgressView } from "@/features/search/search-progress-view";

type SearchProgressPageProps = {
  params: Promise<{ id: string }>;
};

/**
 * Search Progress page
 * Thin route — mock AI progress lives in SearchProgressView.
 */
export default async function SearchProgressPage({
  params,
}: SearchProgressPageProps) {
  const { id } = await params;

  return <SearchProgressView searchId={id} />;
}
