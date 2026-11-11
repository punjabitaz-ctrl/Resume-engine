# Resume Engine

A browser app that builds a reusable fact base from your career material and writes a tailored, ATS-safe resume for each job posting.

It runs as a Claude artifact: the page is one HTML file plus four bundled libraries, and it uses the artifact runtime for Claude calls, private per-person storage and file downloads.

## What it does

| Tab | Job |
| --- | --- |
| Sources | Upload PDF, DOCX or text (resume, LinkedIn, portfolio, project notes). Claude splits it into atomic facts. Long documents are read in parts. |
| Interview | Asks 7 questions aimed at gaps in the fact base, optionally targeted at one job. Answers become facts. |
| Fact base | The only material the writer may use. Edit, switch off, move between roles, merge duplicate roles. |
| Jobs | Paste a posting. Get a weighted keyword map, an evidence score against your facts, and a status tracker. |
| Tailor | Writes a version per job. Keyword match, checks, gaps, four templates, DOCX / PDF / TXT export, version history, compare, mark as sent. |
| Memory | Learned lessons (from your hand edits and results), results table, and your own standing instructions. |
| Data | Backup, restore, delete everything. |

## Rules the writer cannot break

- Only facts in the fact base may appear. Nothing is inferred or invented.
- A number appears only if the fact a line cites contains that exact number. The page checks this itself and flags anything else in red.
- Company names, titles and dates are copied from your roles, never rewritten.
- Requirements you cannot evidence are listed as gaps instead of being written in.
- Learning changes how things are written, never what is claimed.

The keyword match is a coverage measure of the posting's terms. It is a writing guide, not a prediction of how any employer's system ranks applicants.

## How learning works

Two signals are captured as you work, at no cost:

1. **Hand edits.** The original text of a version is kept, so every line you rewrite is a before/after pair. The most recent pairs go straight into the next writing request.
2. **Results.** Mark the version you submit as sent, then record the job's status. Interview and Offer count as progress; Rejected and No response do not.

"Update learning" sends both to Claude, which maintains up to 12 weighted lessons (strength 1 to 5). Supported lessons are reinforced, contradicted ones are reduced and dropped. Outcome-based lessons need at least two sent versions pointing the same way and are labelled early signals under five outcomes. You can switch any lesson off or drop it for good.

## Running it

Publish `index.html` and `lib/` as a Claude artifact and declare these capabilities:

```json
{
  "db": { "rules": [
    { "path": "", "read": "owner", "write": "owner" },
    { "path": "data/users/{self}", "read": "interact", "write": "interact" }
  ] },
  "user": {},
  "sample": {},
  "downloads": true
}
```

- Each signed-in person's data lives under their own `data/users/<id>/` subtree, private from everyone else.
- People who cannot write to the artifact's database (anyone outside the owner's workspace) fall back to browser storage and should use the Data tab's backup.
- The owner-only `inbox` collection lets a Claude chat session load job postings (`{kind:"job", company, title, url, jdText}`) or sources (`{kind:"source", title, type, text}`) into the app.
- Opened as a plain file outside Claude, the page loads and stores data locally, but extraction, analysis and writing are unavailable because they need Claude.

The page cannot fetch URLs, so postings are pasted as text.

## Layout

```
index.html        the whole app: styles, logic, prompts
lib/              bundled third-party libraries (see below)
tests/            jsdom smoke scripts with a simulated Claude and database
```

## Tests

```
npm install
npm test
```

The scripts drive the real page in jsdom against a simulated Claude, database and download prompt. They cover intake and extraction, storage modes and migration, versions, templates and exports, and the learning loop. They print results and fail only on a crash; they do not exercise the live artifact runtime.

## Bundled libraries

| File | Library | License |
| --- | --- | --- |
| `lib/docx.umd.js` | docx 8.5.0 | MIT |
| `lib/jspdf.umd.min.js` | jsPDF 2.5.1 | MIT |
| `lib/mammoth.browser.min.js` | mammoth 1.6.0 | BSD-2-Clause |
| `lib/pdf.min.js`, `lib/pdf.worker.min.js` | PDF.js 3.11.174 | Apache-2.0 |

## Not built yet

Cover letters, a first-run walkthrough, and a tester feedback route.
