"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { createCandidate, replaceCandidate } from "@/lib/api";
import { getErrorMessage } from "@/lib/format";
import type { Candidate, CandidateInput } from "@/types/candidate";

interface CandidateFormProps {
  candidate?: Candidate;
  onSaved?: (candidate: Candidate) => void;
}

export default function CandidateForm({ candidate, onSaved }: CandidateFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [createdCandidate, setCreatedCandidate] = useState<Candidate | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    const form = event.currentTarget;
    const formData = new FormData(form);
    const experience = Number(formData.get("experience_years"));
    if (!Number.isFinite(experience) || experience < 0) {
      setError("Enter a valid number of years of experience (0 or more).");
      return;
    }

    const input: CandidateInput = {
      full_name: String(formData.get("full_name")).trim(),
      email: String(formData.get("email")).trim(),
      phone: String(formData.get("phone")).trim(),
      position: String(formData.get("position")).trim(),
      experience_years: experience,
      linkedin_url: String(formData.get("linkedin_url")).trim() || null,
      cv_url: String(formData.get("cv_url")).trim() || null,
    };

    setLoading(true);
    try {
      if (candidate) {
        const updated = await replaceCandidate(candidate.id, input);
        setSuccess("Candidate details updated successfully.");
        onSaved?.(updated);
      } else {
        const created = await createCandidate(input);
        setCreatedCandidate(created);
        setSuccess("Candidate registered successfully.");
        form.reset();
      }
    } catch (cause) {
      setError(getErrorMessage(cause));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="form-card" onSubmit={handleSubmit}>
      <p className="eyebrow">People &amp; Talent · Nexova Valencia</p>
      <h1>{candidate ? "Correct candidate details" : "Register a candidate"}</h1>
      <p className="form-hint">
        {candidate
          ? "Update the candidate’s contact and application information."
          : "Add a referral or application to the active recruitment campaign."}
      </p>

      {error && <div className="state-card state-error" role="alert">{error}</div>}
      {success && (
        <div className="state-card state-success" role="status">
          {success}
          {createdCandidate && (
            <div className="state-actions">
              <Link className="button button-secondary" href={`/candidates/${encodeURIComponent(createdCandidate.id)}`}>
                Open candidate details
              </Link>
              <button className="button button-primary" type="button" onClick={() => router.push("/")}>
                Return to pipeline
              </button>
            </div>
          )}
        </div>
      )}

      <div className="form-grid">
        <div className="form-field">
          <label htmlFor="full_name">Full name *</label>
          <input className="control" id="full_name" name="full_name" required maxLength={200} defaultValue={candidate?.full_name} />
        </div>
        <div className="form-field">
          <label htmlFor="email">Email *</label>
          <input className="control" id="email" name="email" type="email" required maxLength={254} defaultValue={candidate?.email} />
        </div>
        <div className="form-field">
          <label htmlFor="phone">Phone *</label>
          <input className="control" id="phone" name="phone" type="tel" required maxLength={50} defaultValue={candidate?.phone} />
        </div>
        <div className="form-field">
          <label htmlFor="position">Position *</label>
          <input className="control" id="position" name="position" required maxLength={200} defaultValue={candidate?.position ?? "Executive Assistant"} />
        </div>
        <div className="form-field">
          <label htmlFor="experience_years">Years of experience *</label>
          <input className="control" id="experience_years" name="experience_years" type="number" min="0" step="0.5" required defaultValue={candidate?.experience_years} />
        </div>
        <div className="form-field">
          <label htmlFor="linkedin_url">LinkedIn profile</label>
          <input className="control" id="linkedin_url" name="linkedin_url" type="url" placeholder="https://…" defaultValue={candidate?.linkedin_url ?? ""} />
        </div>
        <div className="form-field full-width">
          <label htmlFor="cv_url">CV link</label>
          <input className="control" id="cv_url" name="cv_url" type="url" placeholder="https://…" defaultValue={candidate?.cv_url ?? ""} />
        </div>
      </div>

      <div className="form-actions">
        <button className="button button-primary" type="submit" disabled={loading}>
          {loading && <span className="spinner" aria-hidden="true" />}
          {loading ? "Saving…" : candidate ? "Save changes" : "Register candidate"}
        </button>
        <Link className="button button-secondary" href={candidate ? `/candidates/${encodeURIComponent(candidate.id)}` : "/"}>
          Cancel
        </Link>
      </div>
      {loading && <p className="form-hint" role="status">Saving candidate information…</p>}
    </form>
  );
}
