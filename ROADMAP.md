# Roadmap

Resume Engine starts as one job: turn a fact base into a tailored resume. The direction is a system that manages a whole job search. This file is the working plan; phases ship in order and each one has to earn the next.

## Phase 1: Resume engine (shipped, v0.5)

Fact base, intake interview, job analysis, tailored writing with truth checks, templates, versions, learning from edits and results, backup, tester problem reports.

## Phase 2: Pipeline tracker

Turn the Jobs tab into the place a search is run from.

- Stages with dates: saved, applied, screen, interviews, offer, closed, and why it closed
- Next action and follow-up date per job, with an "overdue" view
- People per job: recruiter, hiring manager, referrer, with notes and last contact
- Where each job came from (referral, careers page, job board) so sources can be compared
- Weekly view, in priority order: outreach sent, applications submitted, people contacted, and the source of each lead
- Responses and interviews per week as secondary numbers

Starts after the first real intake run (resume, LinkedIn, interview) so Phase 1 problems are fixed first.

## Phase 3: Outreach and documents

- Referral and intro tracking tied to jobs and people
- Drafted outreach and follow-up messages written from the fact base, in the user's voice
- Cover letters under the same truth rules as resumes

## Phase 4: Interview preparation

- Likely questions from the posting, answered with stories built only from facts
- A story bank reused across interviews
- Debrief notes after each round, fed back into learning

## Phase 5: Offers and close

- Side-by-side offer comparison
- Negotiation notes and decision log
- Search retrospective: what worked across the whole search

## Platform decision (before Phase 3)

The artifact runtime keeps this simple and private, with real limits: no fetching of job links, no reminders or email, and synced storage only inside the owner's workspace. Phases 3 and later likely need a hosted app with accounts, a database and a server-side model key. That is a rewrite of storage and the Claude calls, not of the product logic, and should be decided on evidence from Phase 2 testers.

## Principles that do not change

- Nothing is written that the user's own facts do not support
- The user's data is theirs: private by default, exportable, deletable
- Scores and learned lessons are guides with their evidence shown, never promises
