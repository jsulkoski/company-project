export const candidateStatuses = [
  "received",
  "in_progress",
  "selected",
  "discarded",
] as const;

export const candidateStages = [
  "pending",
  "review",
  "personal_interview",
  "technical_interview",
  "offer_presented",
] as const;

export type CandidateStatus = (typeof candidateStatuses)[number];
export type CandidateStage = (typeof candidateStages)[number];

export interface Candidate {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  position: string;
  linkedin_url: string | null;
  cv_url: string | null;
  status: CandidateStatus;
  stage: CandidateStage;
  experience_years: number;
  notes_count: number;
  applied_at: string;
  updated_at: string;
}

export interface CandidateInput {
  full_name: string;
  email: string;
  phone: string;
  position: string;
  experience_years: number;
  linkedin_url: string | null;
  cv_url: string | null;
}

export interface CandidatePatch {
  status?: CandidateStatus;
  stage?: CandidateStage;
}

export interface CandidateNote {
  id: string;
  record_id: string;
  content: string;
  created_at: string;
}

export interface CandidatePage {
  total: number;
  page: number;
  limit: number;
  data: Candidate[];
}

export interface NotesResponse {
  data: CandidateNote[];
  meta: { total: number };
}

export interface CandidateFilters {
  status?: CandidateStatus;
  stage?: CandidateStage;
  search?: string;
  page?: number;
  limit?: number;
}
