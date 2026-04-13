import { ClaimSubmissionForm } from '@/components/insurance/ClaimSubmissionForm';

export default function NewClaimPage({ searchParams }: { searchParams?: { policyId?: string } }) {
  return (
    <main className="mx-auto max-w-2xl p-6">
      <ClaimSubmissionForm policyId={searchParams?.policyId} />
    </main>
  );
}
