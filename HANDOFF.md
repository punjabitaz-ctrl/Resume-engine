# Handoff

Updated at the end of each build cycle so work can resume without rereading the whole history.

## State: v0.14.0 (12 Nov 2026)

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
- New features are paused after the v0.13 review. Fixes from the first real run come first.

## Next, in order

1. Fix whatever the first real run exposes.
2. Turn on GitHub Pages once the owner says the test passed.
3. Invite the four testers.
4. Phase 2, pipeline tracker (ROADMAP.md). Weekly view: outreach sent, applications submitted, people contacted, source of each lead.

## Standing rules for this project

- A human approves every AI decision. No bypass, ever.
- No keys, accounts or model names in the code.
- Nothing is written that the user's facts do not support. No invented numbers.
- No em dashes or en dashes in anything the app writes, in every scenario (resumes now; cover letters, outreach and the rest when built). Nothing is rewritten silently.
- The standards apply to every part of the tool, present and future: source verification, fact finding, writing, and anything added later. Every AI answer goes through one door (`askJSON`), carries the house style rule, lands in saved data that the dash scan and health check cover, and changes nothing without a user tap. New features must use the same door.
- Push to `main`. Update this file and project memory at the end of each cycle.
