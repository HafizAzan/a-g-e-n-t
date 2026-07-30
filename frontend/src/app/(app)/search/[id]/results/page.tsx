import { ResultsView } from "@/features/results/results-view";

type ResultsPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ResultsPage({ params }: ResultsPageProps) {
  const { id } = await params;
  return <ResultsView searchId={id} />;
}
