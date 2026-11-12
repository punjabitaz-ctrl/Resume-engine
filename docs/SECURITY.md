# Security and code review (v0.14.0, 12 Nov 2026)

Scope: everything in this repository. Method: reading the code, static searches for risky patterns, `npm audit` on the bundled libraries, and automated tests in `tests/security.js`.

## What the app holds

Resume text, work history, wins, job postings, interview notes and an AI provider key. All of it lives in the user's browser (IndexedDB plus local or session storage), or in the user's own Claude account in the inside-Claude copy. There is no server.

## Findings and fixes

| # | Finding | Risk | Fix |
| --- | --- | --- | --- |
| 1 | Fonts were loaded from Google on every visit | Third party learns the visit and IP address | Removed. System fonts only. The page now makes no third-party request except the chosen AI engine |
| 2 | All code sat in an inline script, so no script policy could be set | An injected script would run freely | Split into `index.html`, `app.js`, `app.css`. Standalone copies set a content security policy: scripts from own files only, no plugins, no form posts, no base tag |
| 3 | The page could be framed by another site | Clickjacking the approval taps | Standalone copies blank themselves and stop when framed |
| 4 | Provider errors could echo the API key into toasts, the error log, problem reports and the console | Key leaks into a public GitHub issue | `scrub()` removes the live key and key-shaped strings everywhere text leaves the app |
| 5 | Resume, posting and source text went into prompts unmarked | A posting could carry instructions for the AI | Text is fenced as material and the house rule tells the AI to treat it as data. Human approval of every change remains the hard stop |
| 6 | Imported backups were trusted as is | A crafted file could plant odd ids, types or prototype keys | `cleanData()` runs on every load and import |
| 7 | Bundled jsPDF 2.5.1, mammoth 1.6.0 and PDF.js 3.11.174 had published advisories, including script execution from a crafted PDF | Opening a hostile file | Upgraded to jsPDF 4.2.1, mammoth 1.13.0, PDF.js 6.5.438; `npm audit` reports none. PDF reader runs with evaluation off |
| 8 | "Delete everything" left restore points, drafts, incident records and the error log | Data thought deleted stays on disk | All cleared |
| 10 | Backups were plain JSON holding the whole work history | Anyone with the file reads everything | v0.14: every backup is encrypted with the user's password (AES-256-GCM, PBKDF2-SHA256, 600,000 rounds, fresh salt and nonce each time). No plain export exists. Wrong passwords and tampered files are rejected. Older plain backups still restore, with a warning |
| 9 | Key storage was not explained | False sense of safety | Setup now says the key is stored unencrypted in this browser |

## Checked and found sound

- No `eval`, `new Function` or `document.write`. Six `innerHTML` writes, all fed by strings built with the escaping helper.
- No unused top-level names; no dead code paths found.
- The approval gate still needs a real user tap (`isTrusted`) and cannot be granted by code.
- No key, account or model name in the code.

## Accepted limits

- The key is not encrypted at rest. Any encryption done in the page could be undone by the same page, so it would add no real protection. Use a revocable key with a spend cap; "this session only" storage is available.
- Styles allow inline style attributes (`style-src 'unsafe-inline'`); scripts do not.
- The connect policy allows any https or http host, because the user may point the app at any provider or a local model.
- Anyone with access to the browser profile can read the data held there. Backups are locked, but only as strong as the password chosen; a forgotten password cannot be recovered.
- Text sent to an AI provider is governed by that provider's terms.

## Not yet verified

- The app has never been opened in a real browser or used with a real provider. The policy, frame refusal and PDF reader are tested in jsdom and Node only.
- PDF upload is expected to fail when the page is opened straight from disk, since browsers block module imports on `file://`. It fails with a clear message.
