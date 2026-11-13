import type { CandidateStage, CandidateStatus } from "@/types/candidate";

export const STATUS_LABELS: Record<CandidateStatus, string> = {
  received: "Received",
  in_progress: "In progress",
  selected: "Selected",
  discarded: "Discarded",
};

export const STAGE_LABELS: Record<CandidateStage, string> = {
  pending: "Pending review",
  review: "Under review",
  personal_interview: "Personal interview",
  technical_interview: "Technical interview",
  offer_presented: "Offer presented",
};

export function getStatusLabel(value: string): string {
  return value in STATUS_LABELS
    ? STATUS_LABELS[value as CandidateStatus]
    : "Unknown status";
}

export function getStageLabel(value: string): string {
  return value in STAGE_LABELS
    ? STAGE_LABELS[value as CandidateStage]
    : "Unknown stage";
}
