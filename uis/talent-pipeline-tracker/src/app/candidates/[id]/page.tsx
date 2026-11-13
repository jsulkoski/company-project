import { Suspense } from "react";
import CandidateDetail from "@/components/candidate-detail";

interface CandidatePageProps {
  params: Promise<{ id: string }>;
}

export default function CandidatePage({ params }: CandidatePageProps) {
  return (
    <Suspense fallback={<main className="page-shell"><p className="state-card">Loading candidate details…</p></main>}>
      <CandidatePageContent params={params} />
    </Suspense>
  );
}

async function CandidatePageContent({ params }: CandidatePageProps) {
  const { id } = await params;
  return <CandidateDetail id={id} />;
}
