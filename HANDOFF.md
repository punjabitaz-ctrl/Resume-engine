# Handoff

Updated at the end of each build cycle so work can resume without rereading the whole history.

## State: v0.9.0 (11 Nov 2026)

Everything below is on `main` and published to the inside-Claude copy.

- Resume engine: sources, interview, fact base, jobs, tailor, memory, setup
- Bring your own AI: API key or local model in the standalone copy; nothing hard-coded
- Approval gate: fixes, data repairs, lesson changes and unmatched facts need a genuine user tap
- Facts switch on automatically only when they match the user's uploaded material
- Resume standard built into the writer and the checks (see docs/RESUME-STANDARD.md)
- Repair system, data health check, problem reports with pre-filled GitHub issue
- Templates (4), versions with compare and sent-lock, learning as an approved proposal

## Not yet proven

- No real provider, key or local model has been used. All tests run against simulated providers.
- The owner's own material has not been run through the app.

## Waiting on the owner

1. First real run from his main PC with an Anthropic key: resume, LinkedIn text, 7-question interview, one posting.
2. GitHub Pages stays off until that run passes without breakage.

## Next, in order

1. Fix whatever the first real run exposes.
2. Turn on GitHub Pages once the owner says the test passed.
3. Invite the four testers.
4. Phase 2, pipeline tracker (ROADMAP.md). Weekly view: outreach sent, applications submitted, people contacted, source of each lead.

## Standing rules for this project

- A human approves every AI decision. No bypass, ever.
- No keys, accounts or model names in the code.
- Nothing is written that the user's facts do not support. No invented numbers.
- No em dashes or en dashes in resume text. Nothing is rewritten silently.
- Push to `main`. Update this file and project memory at the end of each cycle.
