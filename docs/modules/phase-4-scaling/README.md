# Phase 4 — Scaling & Optimization (Months 10–12)

## Overview

This directory contains all module documentation for Phase 4. Phase 4 focuses on production hardening, mobile general availability, compliance certifications, and the enterprise and multi-tenant capabilities needed to serve large or multi-organization deployments.

## Modules in This Phase

- Mobile Apps (GA)
- Performance Optimization
- Security Hardening & Compliance Certifications
- International Expansion Prep & Enterprise Features
- Multi-Tenancy & Deep Configuration

## Implementation Status

| Module | Status | Priority | Notes |
| ------ | ------ | -------- | ----- |
| Mobile Apps (GA) | 🔵 Not Started | Medium | |
| Performance Optimization | 🔵 Not Started | Medium | |
| Security Hardening & Compliance | 🔵 Not Started | Medium | |
| International & Enterprise Features | 🔵 Not Started | Medium | |
| Multi-Tenancy & Deep Configuration | 🔵 Not Started | Medium | |

## Dependencies

- Reference the main [Module README](../README.md) for overall architecture.
- See [PRD](../../prd.md) for product requirements.
- Phases 1–3 must be feature-complete and stable before Phase 4 delivery begins.

## Notes

- Create a `<module-name>.md` spec file in this folder when a module moves to active development.
- Each spec should cover: scope, data model, API endpoints, frontend pages/components, roles/permissions, and acceptance criteria.
- Update the status table as work progresses.

---

## Regeneration Prompt

Use the following prompt with an AI assistant to regenerate or customize this phase overview for your specific domain:

```text
You are a technical project manager. Generate a Phase 4 Scaling & Optimization module plan as a README.md for a [APPLICATION TYPE] built as an Nx monorepo with Angular (frontend) and NestJS (backend).

Use these placeholders when adapting the content:
- Primary roles: [PRIMARY ROLES]
- Supporting roles: [SUPPORTING ROLES]
- Scaling priorities: [PHASE 4 FEATURES]
- Deployment targets: [DEPLOYMENT CONTEXT]

Match this exact document structure and formatting:
1. H1 title: Phase 4 — Scaling & Optimization (Months 10–12)
2. H2 section: Overview with one short paragraph
3. H2 section: Modules in This Phase with a bullet list of module names
4. H2 section: Implementation Status with a markdown table using columns Module | Status | Priority | Notes
5. H2 section: Dependencies with bullet links to the parent module README and PRD plus the phase dependency note
6. H2 section: Notes with short implementation guidance bullets
7. A horizontal rule
8. H2 section: Regeneration Prompt with a fenced text code block

Keep the technical stack references, phase timing, and emoji status conventions unchanged. Use generic functional names only, avoiding domain-specific nouns.

End the generated document by adding a ## Regeneration Prompt section with a fenced text code block that instructs an AI how to recreate the same document for another domain.
```
