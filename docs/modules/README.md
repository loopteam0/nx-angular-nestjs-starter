# Modules Development Plans

This folder contains module-by-module development plans derived from [docs/prd.md](../prd.md).

## Phase Grouping (from PRD roadmap)

### Phase 1 — MVP (Months 1–3)

- User & Role Management (Auth/RBAC)
- Entity & Profile Management
- Presence & Activity Tracking
- Schedule & Resource Management
- Assessments & Evaluation (Basic)
- Billing & Payments (Basic)
- Staff Portal (Basic)
- Member & Secondary Contact Portal (Basic)
- Platform Foundations (UX, i18n, observability)
- Domain Structure & Configuration

### Phase 2 — Enhanced Features (Months 4–6)

- Communication & Notifications
- Tasks & Assignments
- Advanced Evaluation & Summary Reports
- Asset & Resource Catalog
- Dashboards & Analytics (Basic)
- Billing & Payments (Advanced)
- Mobile Apps (Beta)
- Intake & Onboarding
- Behavior & Case Management
- Documents & Credentials
- Events & Calendar
- Data Import, Migration & Bulk Ops

### Phase 3 — Premium Features (Months 7–9)

- Online Sessions / Content Delivery
- Route & Logistics Management
- Facility & Service Management
- Analytics (Advanced)
- AI & Automation Enhancements
- Integrations (Payments, Email, SMS, Video, Storage)
- API Marketplace
- Workforce & HR (Leave, payroll hooks)
- Member Support & Wellbeing
- Inventory & Assets
- Statutory & Custom Reporting

### Phase 4 — Scaling & Optimization (Months 10–12)

- Mobile Apps (GA)
- Performance Optimization
- Security Hardening & Compliance Certifications
- International Expansion Prep & Enterprise Features
- Multi-Tenant / Deep Configuration

#### Note

Individual module specification documents will be created inside each phase folder as implementation begins. Each doc will cover scope, data model, API endpoints, frontend pages/components, roles/permissions, and acceptance criteria.

```text
docs/modules/
├── README.md                  # This file
├── phase-1-mvp/
│   └── README.md              # Phase 1 overview & status table
├── phase-2-enhanced/
│   └── README.md              # Phase 2 overview & status table
├── phase-3-premium/
│   └── README.md              # Phase 3 overview & status table
└── phase-4-scaling/
    └── README.md              # Phase 4 overview & status table
```

When a module is ready for implementation, add a `<module-name>.md` file inside the relevant phase folder. See the phase READMEs for the expected list of modules per phase.

## Implementation Conventions (Nx + Angular + NestJS)

These plans assume this workspace architecture:

- Frontend app: `apps/web` (Angular)
- Backend app: `apps/api` (NestJS)
- Feature libraries:
  - Web features: `libs/web/feature-*`
  - API features: `libs/api/feature-*` (recommended as the project grows)
  - Shared utilities: `libs/shared/util`
  - Shared data access: `libs/shared/data-access`

Each module plan includes:

- Scope and acceptance criteria
- Suggested data model
- Backend (Nest) endpoints/services
- Frontend (Angular) routes/pages/components
- Roles/permissions
- Testing and rollout checklist

---

## Regeneration Prompt

Use the following prompt with an AI assistant to regenerate or customize this modules index for your specific domain:

```text
You are a technical project manager. Generate a modules development plan index as a README.md for a [APPLICATION TYPE] built as an Nx monorepo with Angular (frontend) and NestJS (backend).

Use these placeholders when adapting the content:
- Primary roles: [PRIMARY ROLES]
- Supporting roles: [SUPPORTING ROLES]
- Core functional areas: [CORE FEATURES]
- Enhanced functional areas: [PHASE 2 FEATURES]
- Premium functional areas: [PHASE 3 FEATURES]
- Scaling priorities: [PHASE 4 FEATURES]

Match this exact document structure and formatting:
1. H1 title: Modules Development Plans
2. Intro sentence referencing docs/prd.md
3. H2 section: Phase Grouping (from PRD roadmap)
4. Four H3 subsections for Phase 1 through Phase 4, each with bullet lists of modules
5. H4 section named Note with one explanatory paragraph
6. A fenced text code block showing the docs/modules directory tree
7. A short paragraph explaining where to add per-module spec files
8. H2 section: Implementation Conventions (Nx + Angular + NestJS)
9. A short bullet list describing workspace layout and a bullet list of what each module plan includes
10. A horizontal rule
11. H2 section: Regeneration Prompt with a fenced text code block

Keep the technical stack, phase ordering, emoji/status conventions, and Nx workspace references intact. Use generic functional names only, avoiding domain-specific nouns or jargon.

End the generated document by adding a ## Regeneration Prompt section with a fenced text code block that instructs an AI how to recreate the same document for another domain.
```
