"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { getCandidates } from "@/lib/api";
import { STATUS_LABELS, STAGE_LABELS } from "@/lib/constants";
import { formatDate, getErrorMessage } from "@/lib/format";
import type {
  Candidate,
  CandidatePage,
  CandidateStage,
  CandidateStatus,
} from "@/types/candidate";
import { candidateStages, candidateStatuses } from "@/types/candidate";
import { StageBadge, StatusBadge } from "./status-badge";

const PAGE_SIZE = 20;

export default function CandidateDashboard() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const status = searchParams.get("status") ?? "";
  const stage = searchParams.get("stage") ?? "";
  const search = searchParams.get("search") ?? "";
  const page = Math.max(1, Number(searchParams.get("page") ?? "1") || 1);
  const [searchValue, setSearchValue] = useState(search);
  const [result, setResult] = useState<CandidatePage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requestNumber, setRequestNumber] = useState(0);

  const updateQuery = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value) params.set(key, value);
        else params.delete(key);
      }
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  useEffect(() => {
    const timer = window.setTimeout(() => setSearchValue(search), 0);
    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (searchValue.trim() !== search) {
        updateQuery({ search: searchValue.trim(), page: "" });
      }
    }, 300);
    return () => window.clearTimeout(timer);
  }, [searchValue, search, updateQuery]);

  useEffect(() => {
    let active = true;
    const timer = window.setTimeout(() => {
      if (!active) return;
      setLoading(true);
      setError(null);
      void getCandidates({
        status: candidateStatuses.includes(status as CandidateStatus)
          ? (status as CandidateStatus)
          : undefined,
        stage: candidateStages.includes(stage as CandidateStage)
          ? (stage as CandidateStage)
          : undefined,
        search,
        page,
        limit: PAGE_SIZE,
      })
        .then((data) => {
          if (active) setResult(data);
        })
        .catch((cause: unknown) => {
          if (active) setError(getErrorMessage(cause));
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    }, 0);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [status, stage, search, page, requestNumber]);

  const totalPages = result ? Math.max(1, Math.ceil(result.total / PAGE_SIZE)) : 1;

  return (
    <main className="page-shell">
      <header className="topbar">
        <Link className="brand" href="/" aria-label="Nexova Talent Pipeline home">
          <span className="brand-mark" aria-hidden="true">N</span>
          <span>
            <span className="brand-name">nexova</span>
            <span className="brand-caption">People &amp; Talent</span>
          </span>
        </Link>
        <span className="topbar-note">Valencia headquarters · Internal recruitment</span>
      </header>

      <section className="page-intro">
        <p className="eyebrow">People &amp; Talent · Recruitment campaign</p>
        <h1>Talent pipeline</h1>
        <p>Keep every candidate and next step in view for Nexova’s active search.</p>
      </section>

      <section className="toolbar" aria-label="Candidate filters">
        <div className="toolbar-controls">
          <div className="field search-field">
            <label htmlFor="candidate-search">Search candidates</label>
            <input
              id="candidate-search"
              className="control"
              type="search"
              placeholder="Name or email"
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="status-filter">Status</label>
            <select
              id="status-filter"
              className="control"
              value={status}
              onChange={(event) => updateQuery({ status: event.target.value, page: "" })}
            >
              <option value="">All statuses</option>
              {candidateStatuses.map((value) => (
                <option key={value} value={value}>{STATUS_LABELS[value]}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="stage-filter">Stage</label>
            <select
              id="stage-filter"
              className="control"
              value={stage}
              onChange={(event) => updateQuery({ stage: event.target.value, page: "" })}
            >
              <option value="">All stages</option>
              {candidateStages.map((value) => (
                <option key={value} value={value}>{STAGE_LABELS[value]}</option>
              ))}
            </select>
          </div>
        </div>
        <Link className="button button-primary" href="/candidates/new">
          <span aria-hidden="true">＋</span> Register candidate
        </Link>
      </section>

      {error && (
        <div className="state-card state-error" role="alert">
          <strong>We couldn’t load the candidate pipeline.</strong>
          <p>{error}</p>
          <button
            className="button button-secondary"
            type="button"
            onClick={() => setRequestNumber((number) => number + 1)}
          >
            Try again
          </button>
        </div>
      )}

      <section className="panel" aria-label="Candidates">
        <div className="panel-heading">
          <h2>Executive Assistant search</h2>
          <span className="result-count">
            {loading ? "Updating candidates…" : `${result?.total ?? 0} candidates`}
          </span>
        </div>
        {loading ? (
          <div className="state-card" role="status">
            <span className="loading-line"><span className="spinner" /> Loading candidate records…</span>
          </div>
        ) : !error && result?.data.length === 0 ? (
          <div className="empty-state">No candidates match these filters. Try changing your search.</div>
        ) : !error && result ? (
          <>
            <div className="table-wrap">
              <table className="candidate-table">
                <thead>
                  <tr>
                    <th scope="col">Candidate</th>
                    <th scope="col">Position</th>
                    <th scope="col">Status</th>
                    <th scope="col">Stage</th>
                    <th scope="col">Applied</th>
                  </tr>
                </thead>
                <tbody>
                  {result.data.map((candidate: Candidate) => (
                    <tr key={candidate.id}>
                      <td>
                        <Link className="candidate-name" href={`/candidates/${encodeURIComponent(candidate.id)}`}>
                          {candidate.full_name}
                        </Link>
                        <span className="candidate-email">{candidate.email}</span>
                      </td>
                      <td>{candidate.position}</td>
                      <td><StatusBadge value={candidate.status} /></td>
                      <td><StageBadge value={candidate.stage} /></td>
                      <td>{formatDate(candidate.applied_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <nav className="pagination" aria-label="Candidate pages">
              <button
                className="button button-secondary"
                type="button"
                disabled={page <= 1}
                onClick={() => updateQuery({ page: String(page - 1) })}
              >
                Previous
              </button>
              <span className="pagination-label">Page {page} of {totalPages}</span>
              <button
                className="button button-secondary"
                type="button"
                disabled={page >= totalPages}
                onClick={() => updateQuery({ page: String(page + 1) })}
              >
                Next
              </button>
            </nav>
          </>
        ) : null}
      </section>
    </main>
  );
}
