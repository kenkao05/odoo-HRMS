# PeoplePay360 — HR & Payroll

Built for Odoo Hackathon 2026. Employee-centric HR + Payroll: Contracts,
Working Schedules, Attendance, Time Off, Salary Structures/Rules, Payruns,
and PDF/emailable Payslips.

## Stack

Next.js 14 (App Router) + TypeScript, Supabase (Postgres + Auth + RLS),
Tailwind, `recharts`, `@react-pdf/renderer`, Resend, deployed on Vercel.

## Setup

1. `npm install`
2. Copy `.env.local.example` to `.env.local` and fill in your Supabase +
   Resend keys.
3. Run `supabase/migrations/0001_init.sql` then `supabase/seed.sql` against
   your Supabase project.
4. Create one `admin` user by hand (Supabase Auth dashboard) and a matching
   `profiles` row — every other account is created from the app's User
   Management screen after that.
5. `npm run dev`

Full spec: see `docs/v1-prd.md` (original planning PRD) and
`final-v1-prd.md` (this build's source of truth) in the repo root/docs.

## Roles

- `employee` — self-service (own profile, attendance, leave).
- `hr_payroll` — full HR + Payrun/Payslip CRU; salary config edit only if
  `can_edit_salary_config` is set on their profile.
- `admin` — everything, plus user management.

## Team / Git

Feature branches (`feature/<name>`) per person, PR into `main`, merge on
green build. See commit history for real multi-author contribution.
