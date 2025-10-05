# Project Brief: Cobetes - F1 Bets

## Executive Summary
Cobetes - F1 Bets is a lightweight private web application where a tight-knit group of Formula 1 fans submit weekly race predictions and automatically track scores across the season. The platform replaces cobbled-together Discord threads and Google Forms with a purpose-built experience that runs smoothly without a dedicated organizer. Tailored strictly to the group's needs, it offers exactly the prediction inputs and scoring they want-no noisy extras-delivering fast setup, consistent deadlines, and immediate results.

## Problem Statement
Friendly F1 betting has always been a highlight for our circle, yet orchestrating each week's predictions quickly became a chore. One friend had to spin up a Google Form or manually track picks in Discord, chase late submissions, and calculate scores by hand after every race. That overhead often delayed results and dulled the fun. Existing public fantasy platforms feel oversized for a private league-too many configuration steps, unwanted complexity, or features geared toward massive communities. What we need is a minimal, reliable system that locks in everyone's picks on time and tabulates standings without manual effort, preserving the spontaneity and fairness we actually care about.

## Proposed Solution
Cobetes - F1 Bets delivers a streamlined prediction flow built specifically for our group: each race week, friends log in, submit their finishing order picks and bonus predictions, and let the system automatically lock submissions when the countdown hits zero. After the race, the app ingests final results, calculates scores using our house rules, and updates standings instantly. The interface is intentionally minimal-focusing only on the data we care about-making it faster to use and easier to maintain than generic fantasy platforms while still feeling like a shared clubhouse.

## Target Users
### Primary User Segment: Close F1 Friends
Our participants are longtime Formula 1 enthusiasts who watch every race together (virtually or in person). They enjoy tactical speculation and friendly competition but dislike administrative chores. They're comfortable with web apps, want the freedom to make quick predictions from phone or laptop, and expect automated validation so they can jump straight to race-day banter.

## Goals & Success Metrics
### Business Objectives
- **Zero manual admin:** Reduce weekly coordination time for the organizer to under 5 minutes.
- **High stickiness:** Keep all friends participating through the entire season.

### User Success Metrics
- Submit predictions in under 2 minutes per race.
- Receive standings updates within 5 minutes of official results.

### Key Performance Indicators (KPIs)
- **Submission completion rate:** Percentage of participants submitting predictions before cutoff.
- **Race-day engagement:** Number of comments/interactions tied to each race week.

## MVP Scope
### Core Features (Must Have)
- **Prediction form per race:** Collect finishing order, bonuses, and optional tiebreakers with validation.
- **Automated scoring engine:** Apply house rules to race results and update standings immediately.
- **Season leaderboard:** Persistent table tracking cumulative points and tie-breakers.
- **Locking & deadlines:** Enforcement of submission cutoff with countdown per race.

### Out of Scope for MVP
- Mobile native apps.
- Public leagues or open registration.
- Real-money betting integrations.
- Complex analytics dashboards beyond standings.

### MVP Success Criteria
Successful MVP means every race of the initial rollout captures predictions from all members, processes results without manual intervention, and maintains a reliable leaderboard through the season without admin overhead.

## Post-MVP Vision
### Phase 2 Features
- Customizable scoring variants or alternate prediction modes.
- Lightweight social feed for sharing smack talk, memes, or race reactions.
- Seasonal awards (e.g., boldest prediction, comeback of the year) with automated tracking.

### Long-term Vision
Create the go-to platform for private motorsport prediction leagues where small groups can spin up tailored competitions across F1, Formula 2, or other series, letting users reuse custom rules and brand their experience.

### Expansion Opportunities
- Invite-only leagues for other friend groups with template-based onboarding.
- Integrations with official F1 data feeds for richer stats.
- Companion mobile app if demand grows beyond web.

## Technical Considerations
### Platform Requirements
- **Target Platforms:** Modern desktops and mobile browsers.
- **Browser/OS Support:** Latest Chrome, Firefox, Safari, Edge; iOS/Android browsers.
- **Performance Requirements:** Sub-second page loads for predictions and standings views.

### Technology Preferences
- **Frontend:** Lightweight React or Svelte SPA optimized for speed.
- **Backend:** Node.js service handling submissions, results ingestion, and scoring.
- **Database:** PostgreSQL for relational data accuracy (users, races, predictions, scores).
- **Hosting/Infrastructure:** Managed cloud hosting (Vercel/Netlify front-end, Render/Fly backend).

### Architecture Considerations
- **Repository Structure:** Monorepo with separate frontend and backend folders.
- **Service Architecture:** Single backend service with future readiness for race data ingestion microservice.
- **Integration Requirements:** Configurable feed or manual upload for official race results.
- **Security/Compliance:** Authentication limited to invited users; enforce HTTPS and secure session handling.

## Constraints & Assumptions
### Constraints
- **Budget:** Self-funded hobby project; minimal hosting costs preferred.
- **Timeline:** Launch before the next F1 season; allow 2-3 months for MVP build.
- **Resources:** 1-2 developers with part-time availability.
- **Technical:** Must operate without official F1 API contracts initially.

### Key Assumptions
- Everyone is comfortable with web access across devices.
- Manual entry of race results is acceptable at launch.
- League size remains under 10 participants for foreseeable future.

## Risks & Open Questions
### Key Risks
- **Data accuracy risk:** Manual result entry could introduce scoring errors.
- **Engagement risk:** Friends may skip weeks if reminders aren't clear.
- **Scalability risk:** Architecture may need refactor if other leagues join later.

### Open Questions
- Who will handle race-result entry each week?
- Do we need notification/email reminders for upcoming submission deadlines?
- Are there tie-breaking rules beyond current house rules?

### Areas Needing Further Research
- Options for reliable race-result automation.
- Lightweight reminder systems (email, SMS, push) for small groups.

## Next Steps
### Immediate Actions
1. Document current scoring rules and bonuses in detail.
2. Validate required fields for prediction form with the group.
3. Choose hosting/deployment approach aligned with budget and skills.

### PM Handoff
This Project Brief provides the full context for Cobetes - F1 Bets. Please start in 'PRD Generation Mode', review the brief thoroughly to work with the user to create the PRD section by section as the template indicates, asking for any necessary clarification or suggesting improvements.
