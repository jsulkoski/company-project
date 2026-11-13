# Nexova Talent Pipeline Tracker

An internal People & Talent application for managing Nexova's active recruitment campaign. Built with Next.js App Router, React, and TypeScript.

## Run locally

```sh
npm install
npm run dev
```

Copy `.env.example` to `.env.local` before starting the app. The required variable is `NEXT_PUBLIC_API_URL`; its example value points to the shared 4Geeks Talent Tracker API.

Open [http://localhost:3000](http://localhost:3000).

## Features

- Candidate list with URL-backed status/stage filters, name/email search, and pagination.
- Candidate detail at `/candidates/[id]` with profile, status/stage updates, and internal notes.
- Candidate registration at `/candidates/new` and full-record editing from candidate details.
- Visible loading, success, and error feedback for asynchronous API operations.
