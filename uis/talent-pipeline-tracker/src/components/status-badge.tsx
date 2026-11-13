import { getStageLabel, getStatusLabel } from "@/lib/constants";
import type { CandidateStage, CandidateStatus } from "@/types/candidate";

export function StatusBadge({ value }: { value: CandidateStatus }) {
  return (
    <span className={`badge badge-status-${value}`}>{getStatusLabel(value)}</span>
  );
}

export function StageBadge({ value }: { value: CandidateStage }) {
  return <span className="badge badge-stage">{getStageLabel(value)}</span>;
}
