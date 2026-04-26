---
name: code-review-agents
description: Performs automated code quality reviews using AI-assisted agents that proactively check for adherence to project guidelines, identify issues, and ensure best practices throughout development. Use these agents after writing code, before creating PRs, during refactoring, or when the user mentions code review, quality check, or validation.
---

# Code Review Agents

---
- "check code quality"
- "code review"
- "run code reviewer"
- "simplify code"
- "check tests"
- "analyze types"

---

## Available Code Review Agents

### 1. Code Reviewer Agent

**Agent:** `pr-review-toolkit:code-reviewer`

**Purpose:** Reviews code for adherence to project guidelines, style guides, and best practices.

**Use When:**

- After completing a feature
- Before committing changes
- Before creating a PR
- After modifying multiple files

**What It Checks:**

- Style guide violations
- Project pattern adherence
- Code organization
- Best practices
- `.github/copilot-instructions.md` compliance

**How to Use:**

```bash
# After making changes, get unstaged files
git diff --name-only

# Then invoke the agent with those files
# Reviewer should check: feature-library architecture boundaries (feature/ui/data-access/util)
# Reviewer should check: Angular 21+ standalone + modern patterns
# Reviewer should verify: project-specific UI conventions (PrimeNG/Tailwind only if installed)
```

**Example Usage:**

```
You: "I've just implemented the appointment feature. Can you review the code?"

Review assistant runs a code-review pass to:
- Check all modified files
- Verify architecture layers
- Validate Angular 21+ patterns
- Check for code smells
- Ensure `.github/copilot-instructions.md` compliance
```

---

### 2. Silent Failure Hunter Agent

**Agent:** `pr-review-toolkit:silent-failure-hunter`

**Purpose:** Identifies silent failures, inadequate error handling, and inappropriate fallback behavior.

**Use When:**

- After implementing error handling
- After adding try-catch blocks
- After adding fallback logic
- Before finalizing error-prone features (API calls, database operations)

**What It Checks:**

- Empty catch blocks
- Generic error messages
- Swallowed errors
- Missing error propagation
- Inappropriate fallbacks
- Silent failures in async operations

**Critical For:**

- Repository layer (API calls)
- Store layer (Observable subscriptions)
- Service layer (business logic errors)
- Backend controllers (request handling)

**Example Usage:**

```
You: "I've added error handling to the patient service. Can you check for silent failures?"

Claude invokes silent-failure-hunter agent to:
- Find empty catch blocks
- Check error message quality
- Verify error propagation
- Identify suppressed errors
- Suggest improvements
```

---

### 3. Code Simplifier Agent

**Agent:** `pr-review-toolkit:code-simplifier`

**Purpose:** Simplifies code for clarity, consistency, and maintainability while preserving functionality.

**Use When:**

- After writing complex logic
- After code generation
- During refactoring
- Before code review

**What It Does:**

- Removes redundant code
- Simplifies complex expressions
- Improves readability
- Maintains functionality
- Follows project patterns

**Best Used On:**

- Complex computed signals
- Long methods (>20 lines)
- Nested conditionals
- Duplicated logic

**Example Usage:**

```
You: "I've written the appointment scheduling logic. Can you simplify it?"

Claude invokes code-simplifier agent to:
- Identify complex code blocks
- Suggest simplifications
- Remove redundancy
- Improve naming
- Maintain all functionality
```

---

### 4. Comment Analyzer Agent

**Agent:** `pr-review-toolkit:comment-analyzer`

**Purpose:** Analyzes code comments for accuracy, completeness, and long-term maintainability.

**Use When:**

- After adding JSDoc comments
- After documenting complex logic
- Before finalizing a PR
- When adding public APIs

**What It Checks:**

- Comment accuracy vs. code
- Outdated comments (comment rot)
- Missing documentation
- Over-commenting obvious code
- JSDoc completeness
- Example code in comments

**Example Usage:**

```
You: "I've added documentation to the signal store. Can you verify the comments?"

Claude invokes comment-analyzer agent to:
- Check comment accuracy
- Verify JSDoc tags
- Identify comment rot
- Suggest improvements
- Check code examples
```

---

### 5. PR Test Analyzer Agent

**Agent:** `pr-review-toolkit:pr-test-analyzer`

**Purpose:** Reviews test coverage quality and completeness for pull requests.

**Use When:**

- After writing tests
- Before creating a PR
- After adding new features
- When coverage seems low

**What It Checks:**

- Test coverage completeness
- Critical path coverage
- Edge case testing
- Test quality (not just quantity)
- Missing test scenarios
- Flaky tests

**Coverage Requirements (from CLAUDE.md):**

- Services: 100%
- Repositories: 100%
- Stores: 90%
- Smart Components: 80%
- Presentational Components: 70%

**Example Usage:**

```
You: "I've added tests for the appointment feature. Are they thorough enough?"

Claude invokes pr-test-analyzer agent to:
- Analyze test coverage
- Identify missing scenarios
- Check edge cases
- Verify critical paths
- Suggest additional tests
```

---

### 6. Type Design Analyzer Agent

**Agent:** `pr-review-toolkit:type-design-analyzer`

**Purpose:** Analyzes TypeScript type design for proper encapsulation and invariant expression.

**Use When:**

- Creating new types/interfaces
- Refactoring type definitions
- Before finalizing domain models
- When types become complex

**What It Checks:**

- Type encapsulation
- Invariant expression
- Type usefulness
- Type safety enforcement
- Proper use of union types
- Generic constraints

**Example Usage:**

```
You: "I've created the Appointment type. Can you review the type design?"

Claude invokes type-design-analyzer agent to:
- Review type structure
- Check encapsulation
- Verify invariants
- Suggest improvements
- Rate design quality
```

---

## Proactive Usage Workflow

### Daily Development Workflow

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
7. Run Comment Analyzer (if docs added)
   ↓
8. Create Pull Request
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

## Integration with Project Workflow

### For Frontend Development

**After creating a component:**

```
1. Generate with NX CLI
2. Write component code
3. Run code-reviewer → Check Angular 21+ patterns
4. Run code-simplifier → Simplify template/logic
5. Add tests
6. Run pr-test-analyzer → Verify coverage
```

**After creating a store:**

```
1. Write signal store
2. Run code-reviewer → Check patterns
3. Run silent-failure-hunter → Check error handling
4. Add tests
5. Run pr-test-analyzer → Verify store tests
```

### For Backend Development

**After creating a service:**

```
1. Write NestJS service
2. Run code-reviewer → Check patterns
3. Run silent-failure-hunter → Check error handling
4. Run type-design-analyzer → Check DTOs
5. Add tests
6. Run pr-test-analyzer → Verify tests
```

**After creating an endpoint:**

```
1. Update OpenAPI spec
2. Write controller/service
3. Run code-reviewer → Check REST patterns
4. Run silent-failure-hunter → Check error responses
5. Add E2E tests
6. Run pr-test-analyzer → Verify API tests
```

---

## Review Configuration for This Project

### Project-Specific Rules

Reviewers should follow `.github/copilot-instructions.md`:

**Frontend Rules:**

- ✅ Angular 21+ standalone-first patterns
- ✅ Feature-library architecture (feature/ui/data-access/util)
- ✅ OnPush change detection
- ✅ UI kit rules only if/when a UI kit is adopted
- ✅ Reactive Forms with validators

**Backend Rules:**

- ✅ NestJS app + library layering (`apps/api` + `libs/api/*`)
- ✅ Multi-tenancy (all queries filter by tenantId)
- ✅ Repository/service/controller separation (when applicable)
- ✅ DTO validation and API docs (optional, add when the backend grows)

**Code Quality Rules:**

- ✅ TypeScript strict mode
- ✅ No 'any' types
- ✅ Function length: max 20 lines
- ✅ Class length: max 200 lines
- ✅ Cyclomatic complexity: max 10

---

## Example Scenarios

### Scenario 1: After Implementing a Feature

```bash
# You've just completed the appointment booking feature

You: "I've finished the appointment booking feature with list, form, and detail components. Can you review it before I commit?"

Review assistant:
1. Runs code-reviewer agent
   - Reviews all modified files
   - Checks architecture pattern
   - Verifies Angular 21+ usage
   - Checks for UI-kit-specific rules only if installed
   - Reports violations

2. Runs silent-failure-hunter agent
   - Checks error handling in store
   - Verifies API error handling
   - Identifies any swallowed errors

3. Runs pr-test-analyzer agent
   - Checks test coverage
   - Identifies missing tests
   - Suggests edge cases

4. Provides summary report
   - Lists all issues found
   - Suggests fixes
   - Confirms when ready to commit
```

### Scenario 2: Before Creating a PR

```bash
You: "I'm ready to create a PR for the prescription feature. Can you do a final review?"

Claude:
1. Runs code-reviewer agent → Full code review
2. Runs silent-failure-hunter agent → Error handling check
3. Runs code-simplifier agent → Simplification suggestions
4. Runs pr-test-analyzer agent → Test coverage verification
5. Runs comment-analyzer agent → Documentation review
6. Runs type-design-analyzer agent → Type design review

Provides comprehensive PR-ready report
```

### Scenario 3: During Refactoring

```bash
You: "I've refactored the patient store to use better computed signals. Can you check if it's simplified enough?"

Claude:
1. Runs code-simplifier agent
   - Analyzes refactored code
   - Suggests further simplifications
   - Maintains functionality

2. Runs code-reviewer agent
   - Verifies patterns still followed
   - Checks signal store best practices
```

---

## Best Practices

### ✅ DO

- **Run agents proactively** - Don't wait for PR review
- **Run code-reviewer** after every significant code change
- **Run silent-failure-hunter** when adding error handling
- **Run pr-test-analyzer** before creating PRs
- **Run code-simplifier** on complex code
- **Run comment-analyzer** when adding documentation
- **Run type-design-analyzer** when creating types
- **Fix issues immediately** - Don't accumulate technical debt

### ❌ DON'T

- Wait until PR review to run agents
- Ignore agent suggestions
- Skip testing agents
- Skip error handling checks
- Run agents only on final code
- Disable agents for "quick fixes"

---

## Agent Output Examples

### Code Reviewer Output

```
🔍 Code Review Results

✅ PASSED:
- Architecture pattern followed (Component → Store → Service → Repository)
- Angular 21+ features used correctly
- OnPush change detection applied
- UI conventions followed (based on installed UI kit)

⚠️ ISSUES FOUND:
1. patient-list.component.ts:45
   - Using constructor injection instead of inject()
   - Fix: Replace constructor with inject()

2. patient-form.component.ts:120
   - Form UX inconsistent with feature pattern
   - Fix: Align with the feature’s layout/conventions

3. patient.store.ts:78
   - Missing error handling in deletePatient
   - Fix: Add catchError operator

📊 Summary: 3 issues found, 0 critical
```

### Silent Failure Hunter Output

```
🔍 Silent Failure Analysis

⚠️ SILENT FAILURES FOUND:

1. patient.repository.ts:56
   ```typescript
   try {
     return this.apiClient.getPatients();
   } catch (error) {
     console.log(error); // ❌ Silent failure
   }
   ```

   Issue: Error logged but not propagated
   Fix: Throw or return error Observable

1. appointment.store.ts:92

   ```typescript
   catchError(() => of([])) // ❌ Silent failure
   ```

   Issue: Error swallowed, user not notified
   Fix: Add error notification

📊 Summary: 2 silent failures found

```

---

## Integration with Definition of Done

Add to your Definition of Done checklist:

```

✅ **Code Quality (Automated):**

- [ ] code-reviewer agent passed
- [ ] silent-failure-hunter agent passed (if error handling)
- [ ] code-simplifier suggestions applied
- [ ] pr-test-analyzer passed
- [ ] comment-analyzer passed (if docs added)
- [ ] type-design-analyzer passed (if new types)

```

---

## Related Skills

- **Skill #13** - Code Quality Standards (manual standards)
- **Skill #1** - Angular Component Architecture
- **Skill #2** - Signal Store State Management
- **Skill #5** - Angular Testing
- **Skill #10** - NestJS Testing

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

### Recommended Order

```

1. code-reviewer (always first)
2. silent-failure-hunter (if applicable)
3. code-simplifier (if applicable)
4. type-design-analyzer (if applicable)
5. pr-test-analyzer (before PR)
6. comment-analyzer (before PR)

```
