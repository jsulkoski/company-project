"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  createNote,
  getCandidate,
  getNotes,
  removeNote,
  updateCandidate,
} from "@/lib/api";
import { STAGE_LABELS, STATUS_LABELS } from "@/lib/constants";
import { formatDate, formatExperience, getErrorMessage } from "@/lib/format";
import type {
  Candidate,
  CandidateNote,
  CandidateStage,
  CandidateStatus,
} from "@/types/candidate";
import { candidateStages, candidateStatuses } from "@/types/candidate";
import CandidateForm from "./candidate-form";
import { StageBadge, StatusBadge } from "./status-badge";

export default function CandidateDetail({ id }: { id: string }) {
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [notes, setNotes] = useState<CandidateNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);
  const [fieldLoading, setFieldLoading] = useState<"status" | "stage" | null>(null);
  const [mutationError, setMutationError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [noteLoading, setNoteLoading] = useState(false);
  const [noteError, setNoteError] = useState<string | null>(null);
  const [notesLoading, setNotesLoading] = useState(true);
  const [deletingNote, setDeletingNote] = useState<string | null>(null);

  const loadCandidate = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    setNotesLoading(true);
    setNoteError(null);
    const [candidateResult, notesResult] = await Promise.allSettled([
      getCandidate(id),
      getNotes(id),
    ]);

    if (candidateResult.status === "fulfilled") {
      setCandidate(candidateResult.value);
    } else {
      setLoadError(getErrorMessage(candidateResult.reason));
    }
    if (notesResult.status === "fulfilled") {
      setNotes(notesResult.value);
    } else {
      setNoteError(getErrorMessage(notesResult.reason));
    }
    setLoading(false);
    setNotesLoading(false);
  }, [id]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadCandidate();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [loadCandidate, retry]);

  async function updateField(field: "status", value: CandidateStatus): Promise<void>;
  async function updateField(field: "stage", value: CandidateStage): Promise<void>;
  async function updateField(
    field: "status" | "stage",
    value: CandidateStatus | CandidateStage,
  ) {
    if (!candidate) return;
    setFieldLoading(field);
    setMutationError(null);
    setFeedback(null);
    try {
      const updated = await updateCandidate(
        candidate.id,
        field === "status"
          ? { status: value as CandidateStatus }
          : { stage: value as CandidateStage },
      );
      setCandidate(updated);
      setFeedback(`${field === "status" ? "Status" : "Stage"} updated.`);
    } catch (cause) {
      setMutationError(getErrorMessage(cause));
    } finally {
      setFieldLoading(null);
    }
  }

  async function handleAddNote(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!candidate || !noteText.trim()) return;
    setNoteLoading(true);
    setNoteError(null);
    setFeedback(null);
    try {
      await createNote(candidate.id, noteText.trim());
      setNoteText("");
      setNotes(await getNotes(candidate.id));
      setFeedback("Internal note added.");
    } catch (cause) {
      setNoteError(getErrorMessage(cause));
    } finally {
      setNoteLoading(false);
    }
  }

  async function handleDeleteNote(noteId: string) {
    if (!candidate || !window.confirm("Delete this internal note? This cannot be undone.")) return;
    setDeletingNote(noteId);
    setNoteError(null);
    try {
      await removeNote(candidate.id, noteId);
      setNotes((current) => current.filter((note) => note.id !== noteId));
      setFeedback("Internal note deleted.");
    } catch (cause) {
      setNoteError(getErrorMessage(cause));
    } finally {
      setDeletingNote(null);
    }
  }

  return (
    <main className="page-shell">
      <header className="topbar">
        <Link className="brand" href="/" aria-label="Back to Nexova talent pipeline">
          <span className="brand-mark" aria-hidden="true">N</span>
          <span>
            <span className="brand-name">nexova</span>
            <span className="brand-caption">People &amp; Talent</span>
          </span>
        </Link>
        <span className="topbar-note">Valencia headquarters · Internal recruitment</span>
      </header>

      <div className="detail-header">
        <div>
          <p className="eyebrow">Executive Assistant search · Candidate record</p>
          <h1>{candidate?.full_name ?? "Candidate details"}</h1>
          <p className="form-hint">Candidate information and internal interview notes.</p>
        </div>
        <div className="detail-actions">
          <Link className="button button-secondary" href="/">← Back to pipeline</Link>
          {candidate && !editMode && (
            <button className="button button-primary" type="button" onClick={() => setEditMode(true)}>
              Edit candidate
            </button>
          )}
        </div>
      </div>

      {feedback && <div className="state-card state-success" role="status">{feedback}</div>}
      {mutationError && <div className="state-card state-error" role="alert">{mutationError}</div>}

      {loading ? (
        <div className="state-card" role="status"><span className="loading-line"><span className="spinner" /> Loading candidate record…</span></div>
      ) : loadError ? (
        <div className="state-card state-error" role="alert">
          <strong>Candidate details could not be loaded.</strong>
          <p>{loadError}</p>
          <button className="button button-secondary" type="button" onClick={() => setRetry((value) => value + 1)}>Try again</button>
        </div>
      ) : candidate ? (
        editMode ? (
          <CandidateForm
            candidate={candidate}
            onSaved={(updated) => {
              setCandidate(updated);
              setEditMode(false);
            }}
          />
        ) : (
          <div className="detail-grid">
            <section className="detail-card">
              <h2>Candidate profile</h2>
              <div className="detail-fields">
                <DetailItem label="Full name" value={candidate.full_name} />
                <DetailItem label="Email" value={<a href={`mailto:${candidate.email}`}>{candidate.email}</a>} />
                <DetailItem label="Phone" value={<a href={`tel:${candidate.phone}`}>{candidate.phone}</a>} />
                <DetailItem label="Position" value={candidate.position} />
                <DetailItem label="LinkedIn" value={candidate.linkedin_url ? <a href={candidate.linkedin_url} target="_blank" rel="noreferrer">View profile ↗</a> : "Not provided"} />
                <DetailItem label="CV" value={candidate.cv_url ? <a href={candidate.cv_url} target="_blank" rel="noreferrer">View CV ↗</a> : "Not provided"} />
                <DetailItem label="Experience" value={formatExperience(candidate.experience_years)} />
                <DetailItem label="Applied" value={formatDate(candidate.applied_at)} />
                <div className="detail-item">
                  <label className="detail-label" htmlFor="status-editor">Status</label>
                  <select
                    className="control"
                    id="status-editor"
                    value={candidate.status}
                    disabled={fieldLoading !== null}
                    onChange={(event) => void updateField("status", event.target.value as CandidateStatus)}
                  >
                    {candidateStatuses.map((value) => <option key={value} value={value}>{STATUS_LABELS[value]}</option>)}
                  </select>
                  {fieldLoading === "status" && <span className="detail-label" role="status">Updating status…</span>}
                </div>
                <div className="detail-item">
                  <label className="detail-label" htmlFor="stage-editor">Stage</label>
                  <select
                    className="control"
                    id="stage-editor"
                    value={candidate.stage}
                    disabled={fieldLoading !== null}
                    onChange={(event) => void updateField("stage", event.target.value as CandidateStage)}
                  >
                    {candidateStages.map((value) => <option key={value} value={value}>{STAGE_LABELS[value]}</option>)}
                  </select>
                  {fieldLoading === "stage" && <span className="detail-label" role="status">Updating stage…</span>}
                </div>
              </div>
              <div className="state-actions" aria-label="Current selection">
                <StatusBadge value={candidate.status} />
                <StageBadge value={candidate.stage} />
              </div>
            </section>

            <section className="detail-card">
              <h2>Internal notes</h2>
              <form className="note-form" onSubmit={handleAddNote}>
                <label className="detail-label" htmlFor="note-content">Add a call or interview note</label>
                <textarea
                  className="control"
                  id="note-content"
                  value={noteText}
                  onChange={(event) => setNoteText(event.target.value)}
                  maxLength={5000}
                  required
                  placeholder="Record relevant observations for the selection team…"
                />
                <button className="button button-primary" type="submit" disabled={noteLoading || !noteText.trim()}>
                  {noteLoading ? "Adding note…" : "Add internal note"}
                </button>
              </form>
              {noteError && (
                <div className="state-card state-error" role="alert">
                  <p>{noteError}</p>
                  <button className="button button-secondary" type="button" onClick={() => setRetry((value) => value + 1)}>Reload notes</button>
                </div>
              )}
              {notesLoading ? (
                <div role="status" className="loading-line"><span className="spinner" /> Loading notes…</div>
              ) : notes.length ? (
                <div className="notes-list">
                  {notes.map((note) => (
                    <article className="note-card" key={note.id}>
                      <div className="note-meta">
                        <time className="note-date" dateTime={note.created_at}>{formatDate(note.created_at)}</time>
                        <button
                          className="note-delete"
                          type="button"
                          disabled={deletingNote === note.id}
                          onClick={() => void handleDeleteNote(note.id)}
                        >
                          {deletingNote === note.id ? "Deleting…" : "Delete"}
                        </button>
                      </div>
                      <p className="note-content">{note.content}</p>
                    </article>
                  ))}
                </div>
              ) : (
                !noteError && <div className="empty-state">No notes yet. Add the first note after a conversation.</div>
              )}
            </section>
          </div>
        )
      ) : null}
    </main>
  );
}

function DetailItem({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="detail-item">
      <span className="detail-label">{label}</span>
      <div className="detail-value">{value}</div>
    </div>
  );
}
