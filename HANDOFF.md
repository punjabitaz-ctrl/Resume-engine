# Handoff

Updated at the end of each build cycle so work can resume without rereading the whole history.

## State: v0.18.0 (25 Nov 2026)

Everything below is on `main` and published to the inside-Claude copy.

- Resume engine: sources, interview, fact base, jobs, tailor, memory, setup
- Bring your own AI: API key or local model in the standalone copy; nothing hard-coded
- Approval gate: fixes, data repairs, lesson changes and unmatched facts need a genuine user tap
- Facts switch on automatically only when they match the user's uploaded material
- Resume standard built into the writer and the checks (see docs/RESUME-STANDARD.md)
- Repair system, data health check, problem reports with pre-filled GitHub issue
- Templates (4), versions with compare and sent-lock, learning as an approved proposal
- Wins tab: STAR accomplishment stories in the user's own words, strength score, per-role targets, posting coverage, question-only AI coaching. Added after feedback from the first tester.

- Interview prep tab (v0.11): story bank themes, interview-only stories, rounds, likely questions matched to stories, timed practice with feedback, introduction draft, research notes, debrief, thank-you drafts. See docs/INTERVIEW-PREP.md.
- Wins: AI may suggest tighter wording, accepted part by part with the user's tap; targets are 2 to 3 wins per role.

- v0.12: users can add their own story themes; interview debriefs feed the learning loop as approved, interview-scope lessons that shape later prep packs (never resumes).
- A go-to-market readiness analysis exists as a private Claude doc (not in this public repo). Its verdict: not ready for outside testers until the owner's real run passes. First-tier gaps: real-model check, first-run guide, a home plus key setup guide (or the inside-Claude route), terms and privacy note, backup reminder and persistent storage, pasted text treated as data, a private feedback channel.
- v0.13: code and security review (docs/SECURITY.md). App split into index.html, app.js and app.css; no third-party requests; standalone CSP and frame refusal; key redaction; pasted text fenced as data; imported data sanitised; bundled libraries upgraded to versions with no known advisories (jsPDF 4.2.1, mammoth 1.13.0, PDF.js 6.5.438); thorough delete.
- v0.14: backups are always password locked (owner: "password protected backups are a must"). No plain export.
- v0.15: code split into `js/` (twelve ordered classic scripts, no build step). Fact review list with the closest source line and marked numbers and words; confirm or reject per fact. Every fact with a number waits for the user; every version's numbers must be confirmed before export. Technical retries run automatically (frozen `AUTO_FIX` list, once each per failed step, logged). Injection defences strengthened (sealed markers, hidden characters stripped, flagged sources untrusted, foreign-link check).
- v0.16: only metrics are held for confirmation, not dates or years (`metrics()` in js/02-logic.js; a bare four-digit figure with no date wording still counts as a metric). The review list groups facts by role with a gated "I read these: confirm all" tap that covers only the facts shown.
- v0.17 (tester build, owner: "build what a tester will need"): a seven-step Start here guide on Sources that ticks itself from the user's own data and can be hidden (Setup brings it back); a backup reminder strip when work has no backup, and again when changes are over 20 minutes newer than the last backup (`Prefs` in js/01-state.js holds only dates and flags, no content); the browser is asked to keep stored data after the first change, and Setup shows the last backup date and the answer; a warning when the page is opened from file://; a source cut at 9 parts now records and shows how much was left out. `serve.py` with `start-windows.bat` and `start-mac.command` serves the folder at localhost:8000 with correct script types. START-HERE.md is the tester setup guide (Python, start file, Anthropic key with prepaid credit and auto-reload off, Setup, backups); docs/TESTER-KIT.md has the test script, form, terms and privacy note. tests/firstrun.js covers the new parts.
- v0.18 (owner: fix the fact-check gaps before the first tester): closes findings 2 to 7 of the pre-test review. Skills, education, certifications and the headline are checked and join the lines to confirm before export (panel now "Lines to confirm"); the writer's jobs must tie to a saved role (by id, else by the role of the facts they cite) or are left out with a banner; only approved facts count as citations; intake questions are not evidence (`srcEvidence`); numbers match with their unit (`numUnits`) and spelled-out numbers are metrics; extracted name, contact details, companies, titles and dates are kept only when found in the source (`inSource`, dates by month and year); deleting a win never re-approves a rejected fact, and replaced facts leave the review list. tests/factcheck.js covers them. Review findings 8 to 22 beyond what v0.17 did are not done.
- Spoken mock interviews are approved as essential but not built. Decision made: the user chooses between Chrome's free built-in speech and a voice-capable model of their own choosing. Build is on hold with all other new features.

## Not yet proven

- Never opened in a real browser. The CSP, the frame refusal and the PDF reader (now loaded as an ES module) are tested only in jsdom and Node.
- PDF upload probably fails when index.html is opened straight from disk (file://), because browsers block module imports there. It fails with a clear message; .docx and pasted text still work. Served over http(s) or inside Claude it should work.
- No real provider, key or local model has been used. All tests run against simulated providers.
- The owner's own material has not been run through the app.

## Waiting on the owner

0. Fact-match threshold (three quarters of wording) stays as is until the first real run; tune it with the owner afterwards.
1. First real run inside Claude, uploading from his PC (standalone run with an Anthropic key comes after that passes): resume, LinkedIn text, 7-question interview, one posting.
2. GitHub Pages stays off until that run passes without breakage.
3. The owner wants live support in chat during the first run, working through issues together.

## Decisions from the owner (11 Nov 2026)

- The first tester's concern: the tool might build only from the main resume and miss accomplishments and accolades needed for interviews. Wins and Interview prep answer that.
- AI may offer a more succinct or professional variation; the user approves it, so everything is user driven.
- Ask for 2 to 3 wins per role regardless of role, with emphasis on the most recent.
- Build the story bank early in the process.

## Decisions from the owner (12 Nov 2026)

- Voice: offer both Chrome's free built-in speech and a voice-capable model the user picks.
- Testers get the choice of the inside-Claude copy or the standalone copy.
- The tool is for the owner's own job search first; it opens to others only if it works well.
- Approvals: automate as much as possible up to critical points; the user always validates every number. Implemented as above.
- Friends run their own copy; they do not share the owner's inside-Claude copy.
- Problem reports stay public on GitHub for now.
- Build on strong, proven research: every writing or interview rule must trace to a source listed in docs/.
- First real run: morning of 12 Nov 2026 (owner's time), inside Claude. Material: resume as a Word file, LinkedIn as pasted text.
- New features are paused after the v0.13 review. Fixes from the first real run come first.

## Decisions from the owner (24 Nov 2026)

Launch calls from the go-to-market readiness review. Four of its eight were already settled on 12 Nov (own search first, testers choose their copy, speech choice, feature pause); these settle the rest.

- Legal: the owner confirms no employer or client is involved in any build of this project and sees no legal issues. No lawyer review before the test.
- Feedback: testers get a private route, a short form after each session plus a direct line to the owner. GitHub issues stay public for problem reports.
- Pass marks for the two-week test: all four finish the script, nobody loses data, no invented fact reaches a resume, and at least three of the four say they would use it for their next application.
- Testers: the four friends already planned, with at least one working outside sales and technology. A check with less technical users waits for the wider 15 to 25 person round.
- Name: "Resume Engine" stays for the private test. A new name, checked for conflicts, is chosen before the wider round.

## Next, in order

1. Fix whatever the first real run exposes. Watch for: too many number facts to confirm (review fatigue), false flags from the AI-wording scan, PDF upload inside Claude.
2. Turn on GitHub Pages once the owner says the test passed.
3. Invite the four testers, with the session form and a private way to reach the owner.
4. Phase 2, pipeline tracker (ROADMAP.md). Weekly view: outreach sent, applications submitted, people contacted, source of each lead.

## Standing rules for this project

- A human approves every AI decision that changes content: facts with numbers or unmatched wording, numbers in each version, saved-data repairs, AI wording, lessons. No bypass. The only things that run without a tap are the technical retries in the frozen `AUTO_FIX` list (owner's decision, 12 Nov 2026); never add a content-changing fix to it.
- No keys, accounts or model names in the code.
- Nothing is written that the user's facts do not support. No invented numbers.
- No em dashes or en dashes in anything the app writes, in every scenario (resumes now; cover letters, outreach and the rest when built). Nothing is rewritten silently.
- The standards apply to every part of the tool, present and future: source verification, fact finding, writing, and anything added later. Every AI answer goes through one door (`askJSON`), carries the house style rule, lands in saved data that the dash scan and health check cover, and changes nothing without a user tap. New features must use the same door.
- Push to `main`. Update this file and project memory at the end of each cycle.
