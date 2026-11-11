# Resume standard

The rules Resume Engine writes to and checks against, with where each comes from. Reviewed November 2026.

Read this first: most published advice on tracking systems comes from vendors and career sites, and the evidence behind it is uneven. Rules below are marked **firm** where independent sources agree, and **judgment** where the evidence is thin or disputed.

## 1. Parses cleanly

| Rule | Status | Why |
| --- | --- | --- |
| One column. No tables, text boxes, graphics or icons | firm | University career offices (MIT, Columbia, UIC, UNC, as cited in the guides below) and vendor guides agree these scramble or drop text |
| Contact details in the document body, not a header or footer | firm | Same sources: some systems skip header and footer content |
| Standard section headings: Summary, Skills, Experience, Education | firm | Parsers map sections by heading; unusual names are a known failure point |
| Common fonts, simple bullets, plain characters | firm | Widely repeated and low cost to follow |
| One plain date format: `Mon YYYY - Mon YYYY` | judgment | Consistency is recommended everywhere; the exact format is our choice |
| Send DOCX unless the posting asks for PDF. PDFs must be real text | judgment | Sources disagree on DOCX versus PDF; all agree to follow the employer's instruction and never send a scanned image |
| Check the plain-text export | firm | MIT's career office recommends saving as plain text to see what survives. The TXT export does this |

## 2. Can be found

| Rule | Status | Why |
| --- | --- | --- |
| Use the posting's exact phrases for skills, tools and credentials, where the facts support them | firm | Recruiters search and rank by these terms; synonyms may not match |
| Put the posting's exact job title in the headline when the facts support that kind of work | judgment | Strongly advised by vendors. The often-quoted "10.6 times more interviews" figure is a single vendor's number and is not used in this app |
| Give an abbreviation with its long form the first time | firm | Advised by vendors and several university career offices: a search may use either form |
| Never repeat a term to game a score | firm | Stuffing is visible to the person who reads the parsed text |
| A keyword score is a writing guide only | firm | No outside tool can see how an employer's system is configured |

## 3. Reads like a person wrote it

| Rule | Status | Why |
| --- | --- | --- |
| No em dashes or en dashes, in anything the app writes | project rule | Set by the project owner for every scenario: resumes, extracted facts, interview questions, and cover letters and outreach when they are built. Enforced on every AI request. Also a common tell of machine-written text |
| No filler or buzzwords | firm | Hiring-manager surveys name generic, repetitive and inflated language as the main giveaways |
| Varied bullet openings and lengths | judgment | Uniform rhythm is one of the patterns reviewers describe |
| Something specific in each bullet: a number, partner, product or place | firm | Vague description is a named giveaway, and specifics are what a reader remembers |
| No first person, no claims about personal qualities | firm | Long-standing convention |

## What the evidence does not support

- **"75% of resumes are rejected by software before a human sees them."** No traceable source. In a 2025 Enhancv study of 25 US recruiters, 23 said their system does not auto-reject on formatting or content. That sample is small and the write-up has been disputed, so treat it as a counterweight, not proof. The practical point holds either way: a person reads the resume, usually quickly.
- **"Recruiters can always tell."** In Resume Genius's 2026 survey of 1,000 US hiring managers, 80% said they can spot an AI-written resume. In a TopResume test of 600 hiring managers, 33.5% correctly picked the AI-written one out of four. Confidence is high, accuracy is not. Generic writing is what gets penalized.

## How the app applies this

- The writer receives these rules in every request.
- Every version is checked by the app itself, in two groups: parsing and search, and human voice.
- Checks flag; they never rewrite. The user edits, or approves a Revise that passes the failed checks to the writer.
- All of it sits under the truth rules: no check may be satisfied by inventing a fact or a number.

## Sources

- [JobShinobi: ATS formatting rules, with university career office citations (MIT CAPD, Columbia, UIC, UNC)](https://jobshinobi.com/blog/ats-optimized-resume-formatting-rules-2026)
- [JobShinobi: should you use columns](https://jobshinobi.com/blog/ats-optimized-resume-should-you-use-columns)
- [FrogHire: lower-risk formatting choices](https://www.froghire.ai/blog/ats-resume-formatting-how-to-format-a-resume-for-applicant-tracking-systems)
- [The Muse: getting a resume past the ATS](https://www.themuse.com/advice/a-job-hunters-guide-to-getting-your-resume-past-the-ats-and-into-human-hands)
- [MCPHS career development: navigating applicant tracking systems](https://www.mcphs.edu/academics/career-development-center/job-internship-search/interviewing/navigating-applicant-tracking-systems)
- [Enhancv: does the ATS reject your resume](https://enhancv.com/blog/does-ats-reject-resumes/)
- [Hiration: the auto-reject myth, including the dispute over the Enhancv figure](https://www.hiration.com/blog/ats-auto-reject-resume-myth/)
- [Resume Genius: 2026 hiring insights report](https://resumegenius.com/blog/job-hunting/hiring-insights-report)
- [TopResume: AI in hiring survey](https://topresume.com/career-advice/ai-in-hiring-survey)
- [HRO Today: giveaways hiring managers cite](https://www.hrotoday.com/news/ticker/is-ai-taking-the-personality-out-of-recruitment/)
