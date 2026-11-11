# Handoff

Updated at the end of each build cycle so work can resume without rereading the whole history.

## State: v0.10.0 (11 Nov 2026)

Everything below is on `main` and published to the inside-Claude copy.

- Resume engine: sources, interview, fact base, jobs, tailor, memory, setup
- Bring your own AI: API key or local model in the standalone copy; nothing hard-coded
- Approval gate: fixes, data repairs, lesson changes and unmatched facts need a genuine user tap
- Facts switch on automatically only when they match the user's uploaded material
- Resume standard built into the writer and the checks (see docs/RESUME-STANDARD.md)
- Repair system, data health check, problem reports with pre-filled GitHub issue
- Templates (4), versions with compare and sent-lock, learning as an approved proposal
- Wins tab: STAR accomplishment stories in the user's own words, strength score, per-role targets, posting coverage, question-only AI coaching. Added after feedback from the first tester.

## Not yet proven

- No real provider, key or local model has been used. All tests run against simulated providers.
- The owner's own material has not been run through the app.

## Waiting on the owner

0. Fact-match threshold (three quarters of wording) stays as is until the first real run; tune it with the owner afterwards.
1. First real run from his main PC with an Anthropic key: resume, LinkedIn text, 7-question interview, one posting.
2. GitHub Pages stays off until that run passes without breakage.
3. The owner wants live support in chat during the first run, working through issues together.

## Open questions for the owner

- What exactly the first tester said, and whether per-role targets (3, 3, then 1) fit
- Whether the AI may ever propose tightened wording for a win (today it only asks questions)
- Whether wins should also become the interview story bank (roadmap phase 4)

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
