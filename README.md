# Resume Engine

A browser app that builds a reusable fact base from your career material and writes a tailored, ATS-safe resume for each job posting.

It is one HTML file plus four bundled libraries. There is no server and nothing is built in: every user connects their own AI engine, either an API key from a provider or a model running on their own computer. No keys, accounts or model names are hard-coded anywhere in this project.

## What it does

| Tab | Job |
| --- | --- |
| Sources | Upload PDF, DOCX or text (resume, LinkedIn, portfolio, project notes). Claude splits it into atomic facts. Long documents are read in parts. |
| Wins | Your accomplishments told in full using STAR (situation, task, action, result): projects, awards, deliverables, recognition. Scored for strength, tracked per role, checked against a posting. |
| Intake | Asks 7 questions aimed at gaps in the fact base, optionally targeted at one job. Answers become facts. |
| Fact base | The only material the writer may use. Edit, switch off, move between roles, merge duplicate roles. |
| Jobs | Paste a posting. Get a weighted keyword map, an evidence score against your facts, and a status tracker. |
| Tailor | Writes a version per job. Keyword match, checks, gaps, four templates, DOCX / PDF / TXT export, version history, compare, mark as sent. |
| Interview prep | Story bank by theme, interview rounds, likely questions matched to your stories, timed practice with feedback, "tell me about yourself", research notes, debrief and thank-you drafts. |
| Memory | Learned lessons (from your hand edits and results), results table, and your own standing instructions. |
| Setup | AI engine (your key or local model), backup, restore, delete everything, and a problem report testers can copy and send (no resume content or keys in it). |

## Rules the writer cannot break

- Only facts in the fact base may appear. Nothing is inferred or invented.
- A number appears only if the fact a line cites contains that exact number. The page checks this itself and flags anything else in red.
- Company names, titles and dates are copied from your roles, never rewritten.
- Requirements you cannot evidence are listed as gaps instead of being written in.
- Learning changes how things are written, never what is claimed.

The keyword match is a coverage measure of the posting's terms. It is a writing guide, not a prediction of how any employer's system ranks applicants.

## How wins work

Resumes get interviews on accomplishments, and extracted one-liners are usually too thin. The Wins tab builds each one out.

- **In your own words.** You fill in situation, task, action and result. Because you wrote it, a win is trusted as written and the writer may use it directly.
- **Strength score.** Each win is scored out of 5 by the app itself: a result, a number in the result, enough detail on what you did, the situation or task, and something named. It says exactly what is missing. It never suggests a number.
- **Coaching by question only.** "Ask me what is missing" has your AI engine read the draft and ask up to four questions. It is told never to suggest answers, numbers or wording. Your answers are added to the win as you typed them.
- **Suggested wording, on request.** The AI can offer a more succinct version of each part. It may not add facts or numbers; the app drops any part that adds a number. You accept parts one at a time with your own tap, and can still edit before saving.
- **Coverage.** Each role shows how many wins it has against a target of 2 to 3 (3 for your two most recent roles, 2 for older ones), and you can check your wins against a posting to see which of its main terms no win speaks to.
- **Starting points.** One-line accomplishments from your sources are listed for building out, and ten memory prompts help surface wins you have forgotten.

A win is stored as one complete fact, so the number checks, backups, dash scan and repair all cover it. Building a win from an extracted fact switches that fact off so it is not used twice.

## How interview prep works

The concern that started this: a resume alone does not capture the accomplishments and accolades a candidate needs in the room. Wins fix the capture; Interview prep puts them to use. The approach and its sources are in [docs/INTERVIEW-PREP.md](docs/INTERVIEW-PREP.md).

- **Story bank.** Each win can be tagged with the interview themes it answers (leadership, results, conflict, failure and so on), plus themes you add yourself. The bank shows which themes have no story. Stories about setbacks or disagreements can be marked interview-only, which keeps them off every resume.
- **Rounds.** Log each interview by stage. Each stage says what it is for and how to prepare.
- **Likely questions.** For a posting and stage, the AI predicts 12 to 14 questions, matches each to stories you already have, and leaves it unmatched when none fits. The app discards any story reference it cannot find. Unmatched questions are your gaps.
- **Practice.** Answer out loud against a clock, with your story hidden until you ask for it. Optional feedback says which STAR parts were missing. It does not rewrite your answer.
- **Tell me about yourself.** Write it yourself, or approve a draft built only from your facts in the present, past, future shape. The app checks the draft's numbers against your facts and shows the spoken length.
- **After each round.** A debrief captures what was asked and what you owe, and feeds a thank-you draft that you read, edit and send yourself. Debriefs also feed the learning loop: approved interview lessons and the questions you were actually asked shape later prep packs.

Every AI output here is a proposal or advice. Drafts are accepted only by your own tap.

## How facts are approved

A fact extracted from your sources is approved on its own only when its wording is found in your own material and it carries no number. Every fact with a number waits for you, and so does any wording the sources do not contain. The Fact base gathers these in one review list: each fact sits beside the closest line of your own material, numbers found there are marked green, numbers not found are marked red, and words not found are shaded. One tap confirms, one tap rejects. A rejected fact stays out of resumes.

Before any export, each version lists every line that carries a number beside the fact it came from. Export stays locked until you confirm them, and asks again if such a line changes.

## What runs without a tap

Technical retries only: trying a failed step again, waiting out a rate limit, tidying punctuation slips in an answer, asking the AI to repair an unreadable answer, reading in smaller parts, and turning off streaming. Each runs at most once per failed step, changes no saved content, and is logged in Setup as automatic. Everything else still needs a direct tap: confirming numbers and unmatched facts, repairing saved data, sending fewer facts to the writer, accepting AI wording, and approving lessons.

## Resume standard

Every version is written and checked against one standard, set out with its sources in [docs/RESUME-STANDARD.md](docs/RESUME-STANDARD.md). In short:

- **Parses cleanly:** one column, standard headings, plain characters, contact details in the body, dates in one plain format, DOCX or text PDF.
- **Can be found:** the posting's exact job title and skill phrases where your facts support them, abbreviations given with their long form, no term stuffed.
- **Reads like a person wrote it:** no em or en dashes, no filler or machine-sounding words, varied bullet openings and lengths, no first person, something specific in each bullet.

The checks only flag. Text is never rewritten silently: you edit the line, or approve a Revise that sends the failed checks to the writer.

## How repair works

When a step fails, the app does not just show an error. A repair panel appears with the likely cause and one or more fixes. Nothing is changed until you pick one.

**A human always approves.** Fixes, data repairs and learned-lesson changes pass through an approval gate in the code that only opens for a genuine tap or click by the user (the browser's trusted-input mark, which scripts cannot forge). The AI's analysis is displayed as a recommendation and nothing more. There is no setting that lets the AI apply anything by itself, and the tests fail if a script-made click or a direct function call gets through.

- **Known failures** are diagnosed without any AI call: unreachable server, rejected key, rate limit, an answer cut short, an answer that cannot be read as data, a request that is too large.
- **Unknown failures** can be sent to your AI engine for analysis. It sees the failure record, your settings and the data check, and must choose from a fixed list of fixes. Anything outside that list is refused.
- **Fixes** are a fixed, safe set: retry, wait and retry, read documents in smaller parts, let the AI repair one unreadable answer, turn off streaming, send only the most relevant facts, repair saved data, open Setup, or draft a problem report. Each approved fix is logged in Setup and can be reset.
- **Saved data** has its own health check. It finds damage such as unreadable items, facts pointing at deleted roles, or versions for deleted jobs. A repair takes a restore point first and can be undone.
- **A screen that cannot draw** shows a recovery card with the health check and a backup button instead of a blank page.

A problem report can be copied, downloaded, or opened as a pre-filled public GitHub issue on this repository.

The repair assistant cannot rewrite the app's own code. A defect in the app ends in a drafted problem report for the maintainer.

## How learning works

Two signals are captured as you work, at no cost:

1. **Hand edits.** The original text of a version is kept, so every line you rewrite is a before/after pair. The most recent pairs go straight into the next writing request.
2. **Results.** Mark the version you submit as sent, then record the job's status. Interview and Offer count as progress; Rejected and No response do not.

"Update learning" sends both to your AI engine, which proposes up to 12 weighted lessons (strength 1 to 5): new ones, stronger or weaker ones, and ones to drop. The proposal is shown for review and applies only when you approve it. Outcome-based lessons need at least two sent versions pointing the same way and are labelled early signals under five outcomes. You can switch any lesson off or drop it for good.

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

## Privacy and protection

- Your data stays in your browser (or in your own Claude account in the inside-Claude copy). There is no server, no account, no analytics and no third-party request of any kind except the AI engine you choose.
- Your API key is sent only to the provider you set. It is stored unencrypted in this browser, so use a key you can revoke and do not use a shared computer. It is stripped from every error message, problem report and console line.
- Standalone copies set a content security policy (scripts only from the app's own files, no plugins, no forms) and refuse to run inside another site's frame.
- Resumes, postings and other pasted text are fenced as material, and the AI is told to treat anything inside as data, never as instructions. Each request seals its markers with a one-time code, hidden characters are stripped from what is sent, wording aimed at an AI is detected and flagged, a flagged source loses automatic approval for all its facts, and a version is checked for links or addresses that are not in your own facts.
- Imported backups are sanitised before use: unsafe ids are remapped, unexpected types are forced back, and prototype keys are dropped.
- PDFs are read with script evaluation off.
- Every backup is locked with a password you choose (AES-256-GCM, key derived with PBKDF2-SHA256, 600,000 rounds). The password is never stored and cannot be recovered. Unlocked backups cannot be exported.
- "Delete everything" removes data, restore points, drafts, incident records and the error log.

Full findings, including what is still unverified, are in [docs/SECURITY.md](docs/SECURITY.md).

## Layout

```
index.html        the page shell (no inline script)
js/               the app code in twelve ordered files: state, logic, storage, AI engine, prompts,
                  actions, export, repair, views, wins, interview prep, events
app.css           all styles (system fonts, nothing loaded from other sites)
lib/              bundled third-party libraries (see below)
docs/             the resume standard, interview prep notes and the security review
HANDOFF.md        current state and next steps, updated at the end of each build cycle
tests/            jsdom scripts with a simulated Claude runtime, database and AI providers
```

## Tests

```
npm install
npm test
```

The scripts drive the real page in jsdom against simulated providers. They cover intake and extraction, storage modes and migration, versions, templates and exports, the learning loop, problem reports, bring-your-own-key and local-model modes (`tests/byo.js`), the repair system (`tests/heal.js`), fact approval plus the resume standard (`tests/standards.js`), the wins builder (`tests/wins.js`), interview prep (`tests/prep.js`), the privacy and protection checks (`tests/security.js`), and a round trip that reads the exported PDF back with the bundled PDF reader (`tests/pdf-roundtrip.mjs`). Nothing in them calls a real provider, so a live connection is only proven by the Setup tab's "Test connection" button.

## Bundled libraries

| File | Library | License |
| --- | --- | --- |
| `lib/docx.umd.js` | docx 8.5.0 | MIT |
| `lib/jspdf.umd.min.js` | jsPDF 4.2.1 | MIT |
| `lib/mammoth.browser.min.js` | mammoth 1.13.0 | BSD-2-Clause |
| `lib/pdf.min.js`, `lib/pdf.worker.min.js` | PDF.js 6.5.438 (legacy build, ES module) | Apache-2.0 |

## Where this is going

Today it is a resume engine. The plan is a full job-search manager: pipeline tracking, outreach, interview prep and offers. See [ROADMAP.md](ROADMAP.md).

## License

Copyright (C) 2026 Taz Abbas.

Licensed under the GNU Affero General Public License v3.0. See [LICENSE](LICENSE). If you host a modified version for other people, the AGPL requires you to offer them your source. The bundled libraries keep their own licenses, listed above.
