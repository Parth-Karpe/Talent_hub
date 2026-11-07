# TalentHub — Campus Placement Platform

**TalentHub** is an end-to-end campus placement management platform built with **Next.js (TypeScript, React, App Router, and Tailwind CSS)**. It models and executes the complete university recruitment lifecycle from student registration and multi-stage eligibility evaluation to atomic company shortlisting, multi-round interview tracking, atomic offer acceptance, and live placement coordinator statistics.

---

## 📖 Scenario & Requirements Alignment

Built in reference to `TalentHub_Scenario_Explained.docx` and the official TalentHub requirements specification:

### 1. The 6-Step Recruitment Process
1. **Step 1: Student Details** — Records academic data: University Seat Number (USN), full name, email, engineering branch (`CSE`, `ECE`, `ISE`, `MECH`, `CIVIL`), CGPA (0.00–10.00), active backlogs, cleared backlogs, and accepted-offer flag.
2. **Step 2: 4-Step Eligibility Evaluation** — Evaluates eligibility in strict rule order:
   - Rule 1: `student.cgpa >= job.min_cgpa` (exact minimum qualifies)
   - Rule 2: `student.active_backlogs <= job.max_backlogs` (cleared backlogs do not disqualify)
   - Rule 3: `student.has_accepted_offer === false` (no prior accepted offer in the season)
   - Rule 4: `job.allowed_branches` is empty (open to all branches) OR includes `student.branch`
3. **Step 3: Atomic Company Shortlisting** — Evaluates all applicants for a drive atomically and idempotently. Eligible applicants are moved to `SHORTLISTED`; ineligibility reasons are logged into `eligibility_decisions`; and notifications are logged (failures never roll back shortlists).
4. **Step 4: Interview Rounds & Results** — Schedules rounds (`round_number`, `scheduled_at`, `venue`, `notes`). Uniqueness of round per application is enforced. Recording results (`PASS` / `FAIL` / `PENDING`) transitions the application to `INTERVIEWED`.
5. **Step 5: Offer Management & Atomic Acceptance** — Employers issue offers with CTC in LPA and unpredictable secure storage keys. Authenticated students accept offers atomically:
   - `offers.is_accepted = true` and `offers.accepted_at = timestamp`
   - `applications.status = 'ACCEPTED'`
   - `students.has_accepted_offer = true`
   - All locked in a single atomic state transition.
6. **Step 6: Placement Coordinator Reports** — Tracks real-time statistics: total registered, placed students, placement rate %, average package, highest package, branch-wise performance, company performance, and audit trails.

### 2. The Example Scenario (Pre-Seeded & Ready)
- **Employer**: ABC Technologies (Visiting college for Software Development Engineer)
- **Drive Criteria**: Minimum CGPA 7.0, Maximum active backlogs 2, Allowed branches: `CSE`, `ISE`, `ECE`
- **Candidate Rahul**: CGPA 8.2, 1 active backlog, 1 cleared backlog, branch `CSE`
- **Execution**: Rahul satisfies all criteria, applies, gets shortlisted, completes Round 1 with `PASS`, receives a 12.5 LPA offer, accepts the offer, and updates the coordinator placement dashboard live!

---

## 🏛️ Layered Architecture

TalentHub follows the internal 4-layer architecture:

```
src/
├── app/
│   ├── api/                              # 1. ROUTER LAYER (Next.js API Route Handlers)
│   │   ├── students/route.ts             # Student profiles & eligibility check endpoints
│   │   ├── companies/route.ts            # Company registry endpoints
│   │   ├── jobs/route.ts                 # Drive listings & branch whitelisting
│   │   ├── applications/route.ts         # Applications & status lifecycles
│   │   ├── shortlist/route.ts            # 1-Click atomic shortlisting endpoint
│   │   ├── interviews/route.ts           # Slot scheduling & result recording
│   │   ├── offers/route.ts               # Offer issuance & atomic acceptance
│   │   ├── reports/route.ts              # Placement analytics & audit trail
│   │   └── reset/route.ts                # Database reset to demo baseline
│   ├── page.tsx                          # Unified Portal with Quick Role Switcher
│   └── layout.tsx
├── lib/
│   ├── services/                         # 2. SERVICE LAYER (Pure Business Logic)
│   │   ├── eligibilityService.ts         # 4-step eligibility algorithm & reason generator
│   │   ├── applicationService.ts         # Season application constraints & state machine
│   │   ├── shortlistingService.ts        # Atomic & idempotent batch shortlisting
│   │   ├── interviewService.ts           # Multi-round scheduling & result recorder
│   │   ├── offerService.ts               # Offer issuance & atomic acceptance transaction
│   │   └── reportService.ts              # Placement analytics & aggregate calculations
│   ├── repositories/                     # 3. REPOSITORY LAYER (Data Access & Mutations)
│   │   ├── studentRepository.ts
│   │   ├── companyRepository.ts
│   │   ├── seasonRepository.ts
│   │   ├── jobRepository.ts
│   │   ├── applicationRepository.ts
│   │   ├── interviewRepository.ts
│   │   ├── offerRepository.ts
│   │   └── auditRepository.ts
│   ├── models/                           # 4. MODEL & DATABASE LAYER (13 Entities)
│   │   └── types.ts                      # All 13 core & support tables as TypeScript schemas
│   └── db/
│       ├── database.ts                   # Persistent atomic JSON data store
│       └── seedData.ts                   # Pre-seeded scenario data (Rahul, ABC Tech, etc.)
└── components/                           # FRONTEND UI COMPONENTS (React & Tailwind CSS)
    ├── Header.tsx                        # Global navigation & instant role switcher
    ├── ScenarioBanner.tsx                # 6-step walkthrough & one-click simulation
    ├── StudentPortal.tsx                 # Student view: drives, eligibility, applications, offers
    ├── CompanyPortal.tsx                 # Recruiter view: post drives, shortlisting, interviews, offers
    └── CoordinatorPortal.tsx             # Coordinator view: KPIs, funnel, branch & audit logs
```

---

## 🗄️ Database Tables (13 Entities)

1. `students` — USN, full_name, email, branch, cgpa, active_backlogs, cleared_backlogs, has_accepted_offer
2. `companies` — company_id, company_name
3. `placement_seasons` — season_id, season_name, start_date, end_date, is_active
4. `users` — user_id, email, password_hash, role (`STUDENT`, `COMPANY_REPRESENTATIVE`, `PLACEMENT_COORDINATOR`)
5. `job_listings` — job_id, company_id, season_id, role_title, min_cgpa, max_backlogs, drive_date, is_open
6. `job_allowed_branches` — job_allowed_branch_id, job_id, branch
7. `applications` — application_id, student_id, job_id, status (`APPLIED` ➔ `SHORTLISTED` ➔ `INTERVIEW_SCHEDULED` ➔ `INTERVIEWED` ➔ `OFFERED` ➔ `ACCEPTED`)
8. `interview_slots` — interview_slot_id, application_id, round_number, scheduled_at, venue, result (`PASS`, `FAIL`, `PENDING`), notes
9. `offers` — offer_id, application_id, package_lpa, offer_letter_key, is_accepted, issued_at, accepted_at
10. `student_consents` — consent_id, student_id, purpose, is_granted, policy_version
11. `eligibility_decisions` — decision_id, student_id, job_id, eligible, reason, checked_at
12. `application_status_history` — status_history_id, application_id, old_status, new_status, changed_at, reason
13. `notification_logs` — notification_id, student_id, application_id, notification_type, recipient_email, delivery_status, attempt_count

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+ or v20+)
- npm

### 1. Run Automated Test Suite
Verify all 24 unit tests covering the 4-step eligibility algorithm, constraints, atomic shortlisting, multi-round interviews, and atomic offer acceptance:
```bash
npm test
```

### 2. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your web browser.

### 3. Build for Production
```bash
npm run build
npm start
```

---

## 🎯 Exploring the Portals
Use the **Role Switcher** in the top navigation bar to switch between:
1. **🎓 Student (Rahul Kumar)**:
   - View open drives, examine the detailed 4-step eligibility checklist with green/red status pills.
   - Apply for eligible drives and track the 6-stage application progress stepper.
   - Review interview schedules and click **"Accept Offer"** to finalize placement.
2. **🏢 Company (ABC Technologies)**:
   - Post new recruitment drives with branch whitelists.
   - Click **"1-Click Atomic Shortlisting"** to automatically process all applicants.
   - Schedule interview rounds and record evaluation outcomes.
   - Issue official compensation offers with secure storage keys.
3. **📊 Placement Coordinator**:
   - Inspect placement rate (%), average CTC, highest package, and the live pipeline funnel.
   - View branch-wise and company-wise performance breakdowns.
   - Audit central eligibility decisions, status change history, and email delivery logs.
4. **✨ Scenario Walkthrough Banner**:
   - Click **"Simulate Full 6-Step Workflow"** on the top banner to watch the scenario unfold automatically from Rahul's application to coordinator statistics!
