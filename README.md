# Resume Engine

A browser app that builds a reusable fact base from your career material and writes a tailored, ATS-safe resume for each job posting.

It is one HTML file plus four bundled libraries. There is no server and nothing is built in: every user connects their own AI engine, either an API key from a provider or a model running on their own computer. No keys, accounts or model names are hard-coded anywhere in this project.

## What it does

| Tab | Job |
| --- | --- |
| Sources | Upload PDF, DOCX or text (resume, LinkedIn, portfolio, project notes). Claude splits it into atomic facts. Long documents are read in parts. |
| Interview | Asks 7 questions aimed at gaps in the fact base, optionally targeted at one job. Answers become facts. |
| Fact base | The only material the writer may use. Edit, switch off, move between roles, merge duplicate roles. |
| Jobs | Paste a posting. Get a weighted keyword map, an evidence score against your facts, and a status tracker. |
| Tailor | Writes a version per job. Keyword match, checks, gaps, four templates, DOCX / PDF / TXT export, version history, compare, mark as sent. |
| Memory | Learned lessons (from your hand edits and results), results table, and your own standing instructions. |
| Setup | AI engine (your key or local model), backup, restore, delete everything, and a problem report testers can copy and send (no resume content or keys in it). |

## Rules the writer cannot break

- Only facts in the fact base may appear. Nothing is inferred or invented.
- A number appears only if the fact a line cites contains that exact number. The page checks this itself and flags anything else in red.
- Company names, titles and dates are copied from your roles, never rewritten.
- Requirements you cannot evidence are listed as gaps instead of being written in.
- Learning changes how things are written, never what is claimed.

The keyword match is a coverage measure of the posting's terms. It is a writing guide, not a prediction of how any employer's system ranks applicants.

## How repair works

When a step fails, the app does not just show an error. A repair panel appears with the likely cause and one or more fixes. Nothing is changed until you pick one.

- **Known failures** are diagnosed without any AI call: unreachable server, rejected key, rate limit, an answer cut short, an answer that cannot be read as data, a request that is too large.
- **Unknown failures** can be sent to your AI engine for analysis. It sees the failure record, your settings and the data check, and must choose from a fixed list of fixes. Anything outside that list is refused.
- **Fixes** are a fixed, safe set: retry, wait and retry, read documents in smaller parts, let the AI repair unreadable answers, turn off streaming, send only the most relevant facts, repair saved data, open Setup, or draft a problem report. Each approved fix is logged in Setup and can be reset.
- **Saved data** has its own health check. It finds damage such as unreadable items, facts pointing at deleted roles, or versions for deleted jobs. A repair takes a restore point first and can be undone.
- **A screen that cannot draw** shows a recovery card with the health check and a backup button instead of a blank page.

The repair assistant cannot rewrite the app's own code. A defect in the app ends in a drafted problem report for the maintainer.

## How learning works

Two signals are captured as you work, at no cost:

1. **Hand edits.** The original text of a version is kept, so every line you rewrite is a before/after pair. The most recent pairs go straight into the next writing request.
2. **Results.** Mark the version you submit as sent, then record the job's status. Interview and Offer count as progress; Rejected and No response do not.

"Update learning" sends both to Claude, which maintains up to 12 weighted lessons (strength 1 to 5). Supported lessons are reinforced, contradicted ones are reduced and dropped. Outcome-based lessons need at least two sent versions pointing the same way and are labelled early signals under five outcomes. You can switch any lesson off or drop it for good.

## Running it

### Standalone (bring your own key or local model)

Serve the repository root as a static site. Any of these works:

- GitHub Pages: repository Settings, Pages, deploy from the `main` branch root
- Locally: `npx serve .` or `python3 -m http.server`, then open the address it prints

Open the **Setup** tab and choose an AI engine:

| Field | What to enter |
| --- | --- |
| Provider | A preset that fills in the address (Anthropic, OpenAI, OpenRouter, Google Gemini, Groq, Ollama, LM Studio), or "Another server" |
| Request format | Anthropic, or OpenAI-compatible (most providers and local servers) |
| API address | Editable. Any server that speaks one of the two formats |
| Model | "Load models" asks the provider for its list. Or type the exact name |
| API key | Leave empty for a local model |

About keys:

- The key is stored in your browser only and sent only to the address you entered.
- It is never written to backups or problem reports, and never shown again in full.
- "Remember the key on this device" off keeps it for the current tab session only.
- Anyone with access to your browser profile can read a remembered key. Use a key with a spending limit.

Local models:

- **Ollama:** start it with `OLLAMA_ORIGINS` set to the address the app is served from, then pick the Ollama preset.
- **LM Studio:** start the local server and enable CORS in its server settings.
- Give the model a context window of at least 16,000 tokens. Smaller windows silently cut the request.
- Small models often return malformed answers. The fact and number checks still run, but writing quality depends on the model you bring.
- Some browsers (Safari) block calls from an https page to a local address. Serve the app locally in that case.

Data is kept in the browser (IndexedDB). Use the Setup tab's backup to move it between devices.

### Inside Claude (optional)

The same file also runs as a Claude artifact. Pages inside Claude cannot reach outside services, so API keys and local models are unavailable there; that copy uses each viewer's own Claude account instead. Declare these capabilities:

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

Each signed-in person's data lives under their own `data/users/<id>/` subtree. The owner-only `inbox` collection lets a Claude chat session load job postings (`{kind:"job", company, title, url, jdText}`) or sources (`{kind:"source", title, type, text}`) into the app.

In both modes the page cannot fetch job links, so postings are pasted as text.

## Layout

```
index.html        the whole app: styles, logic, prompts
lib/              bundled third-party libraries (see below)
tests/            jsdom scripts with a simulated Claude runtime, database and AI providers
```

## Tests

```
npm install
npm test
```

The scripts drive the real page in jsdom against simulated providers. They cover intake and extraction, storage modes and migration, versions, templates and exports, the learning loop, problem reports, bring-your-own-key and local-model modes (`tests/byo.js`), and the repair system (`tests/heal.js`). Nothing in them calls a real provider, so a live connection is only proven by the Setup tab's "Test connection" button.

## Bundled libraries

| File | Library | License |
| --- | --- | --- |
| `lib/docx.umd.js` | docx 8.5.0 | MIT |
| `lib/jspdf.umd.min.js` | jsPDF 2.5.1 | MIT |
| `lib/mammoth.browser.min.js` | mammoth 1.6.0 | BSD-2-Clause |
| `lib/pdf.min.js`, `lib/pdf.worker.min.js` | PDF.js 3.11.174 | Apache-2.0 |

## Where this is going

Today it is a resume engine. The plan is a full job-search manager: pipeline tracking, outreach, interview prep and offers. See [ROADMAP.md](ROADMAP.md).

## License

Copyright (C) 2026 Taz Abbas.

Licensed under the GNU Affero General Public License v3.0. See [LICENSE](LICENSE). If you host a modified version for other people, the AGPL requires you to offer them your source. The bundled libraries keep their own licenses, listed above.
