# ThreatScope Internal OS

Internal CRM and operations platform for ThreatScope.

## Sections
- **Dashboard** — KPIs, blocker alerts, pipeline overview, recent activity
- **Prospects** — BFSI pipeline with stage tracking (Cold → Contract)
- **Tasks** — Kanban + list view, priority tracking, due dates
- **Notes** — Pinnable notes, search, full markdown-like content
- **Comms** — Channel-based internal messaging (general, gtm, engineering, investor)
- **Templates** — Outreach/sales templates with [Name]/[Company]/[Role] fill-in
- **Docs** — Document vault (contracts, NDAs, proposals)
- **Quick Capture** — Inbox for ideas, convert to tasks instantly

## Deploy to Vercel (free)
1. Push this repo to GitHub
2. Go to vercel.com → New Project → Import your repo
3. Framework: Create React App (auto-detected)
4. Deploy — done. Your URL is live.

## Data storage
All data is stored in localStorage — persists per browser.
For multi-user/team sync, replace the localStorage calls in App.js with a free Supabase backend.

## Local dev
```
npm install
npm start
```
