import { LeadDetailView } from "@/features/lead-detail/lead-detail-view";

type LeadDetailPageProps = {
  params: Promise<{ id: string; leadId: string }>;
};

export default async function LeadDetailPage({ params }: LeadDetailPageProps) {
  const { id: searchId, leadId } = await params;
  return <LeadDetailView searchId={searchId} leadId={leadId} />;
}
