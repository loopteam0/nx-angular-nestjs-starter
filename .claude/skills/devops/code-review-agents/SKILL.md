---
name: code-review-agents
description: Performs automated code quality reviews using AI-assisted agents that proactively check for adherence to project guidelines, identify issues, and ensure best practices throughout development. Use these agents after writing code, before creating PRs, during refactoring, or when the user mentions code review, quality check, or validation.
---

# Code Review Agents

Automated code quality agents for proactive review throughout development.

---

## Available Code Review Agents

### 1. Code Reviewer Agent
**Agent:** `pr-review-toolkit:code-reviewer`

**Use When:**
- After completing a feature
- Before committing changes
- Before creating a PR

**Checks:**
- Style guide violations
- Project pattern adherence
- Code organization
- `.github/copilot-instructions.md` compliance

---

### 2. Silent Failure Hunter Agent
**Agent:** `pr-review-toolkit:silent-failure-hunter`

**Use When:**
- After implementing error handling
- After adding try-catch blocks
- Before finalizing error-prone features

**Checks:**
- Empty catch blocks
- Generic error messages
- Swallowed errors
- Missing error propagation

---

### 3. Code Simplifier Agent
**Agent:** `pr-review-toolkit:code-simplifier`

**Use When:**
- After writing complex logic
- After code generation
- During refactoring

**Does:**
- Removes redundant code
- Simplifies complex expressions
- Improves readability

---

### 4. PR Test Analyzer Agent
**Agent:** `pr-review-toolkit:pr-test-analyzer`

**Use When:**
- After writing tests
- Before creating a PR

**Checks:**
- Test coverage completeness
- Critical path coverage
- Edge case testing
- Missing test scenarios

---

### 5. Comment Analyzer Agent
**Agent:** `pr-review-toolkit:comment-analyzer`

**Use When:**
- After adding JSDoc comments
- Before finalizing a PR

**Checks:**
- Comment accuracy vs code
- Outdated comments
- Missing documentation
- JSDoc completeness

---

### 6. Type Design Analyzer Agent
**Agent:** `pr-review-toolkit:type-design-analyzer`

**Use When:**
- Creating new types/interfaces
- Refactoring type definitions

**Checks:**
- Type encapsulation
- Invariant expression
- Type safety enforcement
- Generic constraints

---

## Proactive Usage Workflow

### Daily Development

```
1. Write Code
   ↓
2. Run Code Reviewer (before commit)
   ↓
3. Run Silent Failure Hunter (if error handling added)
   ↓
4. Run Code Simplifier (if complex code)
   ↓
5. Commit Changes
   ↓
6. Run PR Test Analyzer (before creating PR)
   ↓
7. Create Pull Request
```

### Feature Completion Checklist

```
✅ Code written and working
✅ Code Reviewer agent passed
✅ Silent Failure Hunter passed (if applicable)
✅ Code Simplifier applied (if needed)
✅ Tests written
✅ PR Test Analyzer passed
✅ Documentation added
✅ Comment Analyzer passed
✅ Type Design Analyzer passed (if new types)
✅ Ready for PR
```

---

## Project-Specific Rules

### Frontend Rules
- ✅ Angular 21+ standalone-first patterns
- ✅ Feature-library architecture (feature/ui/data-access/util)
- ✅ OnPush change detection
- ✅ Reactive Forms with validators

### Backend Rules
- ✅ NestJS app + library layering
- ✅ Multi-tenancy (all queries filter by tenantId)
- ✅ Repository/service/controller separation
- ✅ DTO validation

### Code Quality Rules
- ✅ TypeScript strict mode
- ✅ No 'any' types
- ✅ Function length: max 20 lines
- ✅ Class length: max 200 lines
- ✅ Cyclomatic complexity: max 10

---

## Best Practices

### ✅ DO
- Run agents proactively (don't wait for PR review)
- Run code-reviewer after every significant change
- Run silent-failure-hunter when adding error handling
- Run pr-test-analyzer before creating PRs
- Fix issues immediately

### ❌ DON'T
- Wait until PR review to run agents
- Ignore agent suggestions
- Skip testing agents
- Skip error handling checks
- Disable agents for "quick fixes"

---

## Quick Reference

### Agent Command Mapping

| Task | Agent | When |
|------|-------|------|
| General code review | code-reviewer | After writing code |
| Error handling check | silent-failure-hunter | After adding try-catch |
| Code simplification | code-simplifier | Complex code written |
| Documentation check | comment-analyzer | After adding docs |
| Test coverage check | pr-test-analyzer | Before creating PR |
| Type design review | type-design-analyzer | After creating types |

---

## Additional Resources

For detailed checklists and examples, see:

- [agents.md](./references/agents.md) - Detailed agent descriptions and outputs
- [workflows.md](./references/workflows.md) - Integration workflows and scenarios
- [checklists.md](./references/checklists.md) - Complete review checklists

---

## Related Skills

- **Code Quality Standards** - Manual standards
- **Angular Component Architecture** - Frontend patterns
- **NestJS Repository Service** - Backend patterns
