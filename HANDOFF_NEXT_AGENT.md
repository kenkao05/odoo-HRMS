# Handoff — PeoplePay360 frontend conversion (ledger design)

## Status: CONVERSION COMPLETE
Every page under `app/(app)/` is now on the ledger design system. Verified
with `npm install && npm run build` — TypeScript passes with 0 errors and
all 34 routes prerender/compile successfully (Google Fonts network calls
and real Supabase env vars are the only things that fail in a sandboxed/
offline environment; neither is a code issue).

## What this project is
Converting the existing Next.js/Supabase HR+Payroll app (logic/backend from
GitHub repo `kenkao05/odoo-HRMS`, main branch) to a new "Ledger" visual
design (source: HTML/CSS/JS mockup `peoplepay360-p`). Rule for every file:
**backend/Supabase calls/API routes/validation = untouched, copy exactly.
Only JSX/className/markup changes to use the ledger design system already
ported into `app/globals.css`.**

No features added, none dropped. Every route in `lib/utils/roles.ts`
`SIDEBAR_SECTIONS` works exactly as before.

## Note on the previous version of this doc
An earlier version of this file claimed Attendance, Working Schedules, all
three Time Off sub-areas, the Payroll → Payruns list, Salary Structures,
Salary Rules, and Users were "done" — they were not (verified by file
mtimes and content: they were still on the original cream/brown Tailwind
build). That inaccuracy has been corrected; see the full list below.

## Done (all pages)
Login, Dashboard (+6 dashboard components), Employees list+detail,
Contracts list+detail, all shared `components/ui/*` (including a
`import type { JSX } from "react"` fix in `Sidebar.tsx` for a React 19
typing error unrelated to the design conversion), all `components/layout/*`
(Sidebar/Topbar/AppShell/icons/NavigationProgress), `app/layout.tsx`,
`app/globals.css`, `lib/utils/colors.ts`, `CheckInOutWidget`,
`PayrunWizard` (2-step, restyled with `.select-grid`/`.emp-check`/`.field`
— do NOT change to a 4-step wizard; the mockup's 4-step version was
rejected, confirmed against `final-v1-prd.md` section 8.13 which has the
same 2-step wizard as the repo), Attendance list+detail, Working Schedules
list+detail (day-builder table restyled to `table.ledger` with the
green-wash auto-calculated-total card from the mockup), Time Off Requests
list+detail (detail uses the `.dl` dt/dd pattern from the mockup's
employee drawer), Time Off Allocations list+detail, Time Off Types
list+detail (booleans use the `.switch`/`.slider` toggle already defined
in `globals.css` but previously unused anywhere), Payroll → Payruns list,
`WarningsCallout` (`.warn-box`), Payslips list+detail, `PayslipLinesTable`
(`.payslip-doc`/`.payslip-rows`/`.ps-row`), Payrun detail, Salary
Structures list+detail (inline rules table reuses the shared `Table`
component; `canEdit` gate preserved: `profile.role === 'admin' ||
(role === 'hr_payroll' && can_edit_salary_config)`), Salary Rules
list+detail (conditional fixed/percentage/formula fields, same `canEdit`
gate), Users admin page (Table + `Modal` "Add User" form, row actions as
`.btn-ghost`/`.btn-danger` `.btn-sm`).

## If further changes are needed
- Zero hardcoded hex/Tailwind arbitrary values (`bg-[#`, `text-[#`,
  `border-[#`) remain outside `app/globals.css` itself — verified by grep.
- `npm install && npm run build` passes clean (TypeScript: 0 errors, all
  routes compile).

## Conventions established so far (follow exactly)
- List pages: `<div className="view-head"><div><h2>Title</h2><p className="sub">...</p></div>{actions}</div>` then `<div className="card"><Table .../></div>`.
- Detail pages: `<div className="view-head"><Link href="..." className="section-title link">← Back to X</Link></div>` then `<div className="card pad" style={{maxWidth: 420 or 480}}>` wrapping `FormField`s and a `Button`.
- Loading state: `<LoadingBlock label="Loading X…" />`, never bare `<p>`.
- Status pills: always via `<Badge status={...} />`, never manual pill markup, unless the value isn't a real status enum (e.g. wizard step numbers).
- Toasts: `useToast()` → `push(message, "success" | "error")`, unchanged from original.
- No new files/features/routes — 1:1 file mapping with the original `app/(app)/...` tree.
