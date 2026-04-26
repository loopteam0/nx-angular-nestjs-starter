# Phase 1 — MVP (Months 1–3)

## Overview

This directory contains the implementation-facing module specifications for the Phase 1 MVP. The goal of Phase 1 is to establish the operational core of the platform: setup, entity records, core workflows, billing, evaluation, and the first working portals.

## Active Phase 1 delivery modules

- Platform Foundations
- User & Role Management
- Domain Structure & Configuration
- Entity & Profile Management
- Schedule & Resource Management
- Presence & Activity Tracking
- Assessments & Evaluation
- Billing & Payments
- Staff Portal
- Primary User & Secondary Contact Portal

## Deferred but important design considerations

These topics are not Phase 1 delivery scope, but should influence current design decisions.

- API Marketplace — keep APIs versionable and event names stable
- Multi-Tenancy — avoid single-tenant assumptions that block future isolation

## Recommended implementation order

1. Platform foundations, user/role management, and domain structure.
2. Entity & profile management.
3. Schedule, activity tracking, assessments, and billing.
4. Staff portal and primary user/secondary contact portal.

## Implementation status

| Module | Delivery status | Priority | Notes |
| ------ | --------------- | -------- | ----- |
| Platform Foundations | 🔵 Not Started | High | Documentation expanded for implementation |
| User & Role Management | 🔵 Not Started | High | Documentation expanded for implementation |
| Domain Structure & Configuration | 🔵 Not Started | High | Documentation expanded for implementation |
| Entity & Profile Management | 🔵 Not Started | High | Documentation expanded for implementation |
| Schedule & Resource Management | 🔵 Not Started | Medium | Documentation expanded for implementation |
| Presence & Activity Tracking | 🔵 Not Started | Medium | Documentation expanded for implementation |
| Assessments & Evaluation | 🔵 Not Started | Medium | Documentation expanded for implementation |
| Billing & Payments | 🔵 Not Started | Medium | Documentation expanded for implementation |
| Staff Portal | 🔵 Not Started | Medium | Documentation expanded for implementation |
| Primary User & Secondary Contact Portal | 🔵 Not Started | Medium | Documentation expanded for implementation |

## Design-only future considerations

| Module | Current role in Phase 1 | Notes |
| ------ | ----------------------- | ----- |
| API Marketplace | Deferred | Keep APIs versionable and event names stable |
| Multi-Tenancy | Deferred | Avoid single-tenant assumptions that block future isolation |

## Dependencies

- Reference the main [Module README](../README.md) for overall architecture.
- See [PRD](../../prd.md) for product requirements.

## Notes

- These documents are intended as implementation specs and reference material for contributors.
- When starting a module, create a spec file (e.g., `user-role-management.md`) inside this folder covering: scope, data model, API endpoints, frontend pages/components, roles/permissions, and acceptance criteria.
- Update delivery status as engineering work starts and finishes.

---

## Regeneration Prompt

Use the following prompt with an AI assistant to regenerate or customize this phase overview for your specific domain:

```text
You are a technical project manager. Generate a Phase 1 MVP module plan as a README.md for a [APPLICATION TYPE] built as an Nx monorepo with Angular (frontend) and NestJS (backend).

Use these placeholders when adapting the content:
- Primary roles: [PRIMARY ROLES]
- Supporting roles: [SUPPORTING ROLES]
- Foundational capabilities: [PHASE 1 FEATURES]
- Deferred architecture considerations: [DEFERRED CONSIDERATIONS]

Match this exact document structure and formatting:
1. H1 title: Phase 1 — MVP (Months 1–3)
2. H2 section: Overview with one short paragraph
3. H2 section: Active Phase 1 delivery modules with a bullet list of module names
4. H2 section: Deferred but important design considerations with one short paragraph and bullet list
5. H2 section: Recommended implementation order with a numbered list of four items
6. H2 section: Implementation status with a markdown table using columns Module | Delivery status | Priority | Notes
7. H2 section: Design-only future considerations with a markdown table
8. H2 section: Dependencies with bullet links to the parent module README and PRD
9. H2 section: Notes with short implementation guidance bullets
10. A horizontal rule
11. H2 section: Regeneration Prompt with a fenced text code block

Keep the phase scope, delivery ordering, table structure, and emoji status conventions exactly aligned with this template. Use generic functional names rather than domain-specific nouns.

End the generated document by adding a ## Regeneration Prompt section with a fenced text code block that instructs an AI how to recreate the same document for another domain.
```
