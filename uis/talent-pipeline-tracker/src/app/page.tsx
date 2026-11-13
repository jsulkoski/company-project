import { Suspense } from "react";
import CandidateDashboard from "@/components/candidate-dashboard";

export default function HomePage() {
  return (
    <Suspense fallback={<main className="page-shell"><p className="state-card">Loading the Nexova talent pipeline…</p></main>}>
      <CandidateDashboard />
    </Suspense>
  );
}
