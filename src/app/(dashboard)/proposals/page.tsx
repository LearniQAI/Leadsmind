import { requireAuth, getCurrentWorkspaceId } from "@/lib/auth";
import { getQuotes } from "@/app/actions/finance";
import { ProposalMasterDetail } from "@/components/proposals/ProposalMasterDetail";

export const dynamic = 'force-dynamic';

export default async function ProposalsPage() {
  await requireAuth();
  const workspaceId = await getCurrentWorkspaceId();
  const proposals = await getQuotes(workspaceId!);

  return (
    <ProposalMasterDetail proposals={proposals} />
  );
}
