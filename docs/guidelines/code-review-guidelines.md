# Code Review Guidelines

**For**: Code Reviewer (code-reviewer subagent)
**Purpose**: Comprehensive guidelines for conducting effective code reviews that catch bugs before they reach production
**Last Updated**: 2026-01-11

---

## 📋 Bug Severity Classification

When reviewing code, classify all issues using this severity system:

### P0 BLOCKER (Must fix immediately - blocks all progress)
- Security vulnerabilities (SQL injection, XSS, auth bypass)
- Data loss or corruption risks
- **Core functionality broken** (API returns 404, route conflicts, broken imports)
- **Express route conflicts** (specific routes after generic routes)
- Critical performance issues (infinite loops, severe memory leaks)

**Required Actions:**
- Mark code as "BLOCKED - REQUIRES FIX"
- Do NOT proceed to next step until fixed
- Re-review after fix to verify
- **NEVER allow P0 issues to pass as "warnings" or "fix later"**

### P1 CRITICAL (Fix before production)
- Minor memory leaks
- Missing error handling for user-facing operations
- Rate limiting missing on public endpoints
- Silent failures that hide errors from users

### P2 HIGH (Fix soon)
- Suboptimal patterns
- Missing tests for new features
- Code quality issues

### P3 MEDIUM/LOW (Fix when convenient)
- Documentation gaps
- Code style improvements
- Minor refactoring opportunities

---

## 🔍 Code Review Process

### Review States

1. **SUBMITTED** - Under review
2. **CHANGES REQUESTED** - Issues found, developer must fix
3. **RE-REVIEW REQUIRED** - Developer claims fixed, reviewer must verify
4. **APPROVED** - Ready for testing/deployment

### P0 BLOCKER Review Flow

**Critical: Never approve code with known P0 blockers**

1. **Reviewer**: Mark as "CHANGES REQUESTED - P0 BLOCKER"
2. **Reviewer**: List specific fixes required
3. **Reviewer**: Do NOT approve until fix verified
4. **Developer**: Fixes issue
5. **Developer**: Requests re-review
6. **Reviewer**: Verifies fix applied
7. **Reviewer**: Re-tests functionality
8. **Reviewer**: Marks "APPROVED" only after confirming fix

### What NOT To Do

❌ **NEVER:**
- Approve with "recommendations to fix later"
- Allow P0 blockers to be "warnings" or "nice-to-haves"
- Assume manual testing will catch P0 issues
- Mark as "READY" with known route conflicts or 404 errors

---

## 🎯 Express.js Route Review Checklist

**For all Express route changes:**

- [ ] Specific routes (e.g., `/:id/fetch-price`) defined BEFORE generic routes (e.g., `/:id`)
- [ ] No route shadowing or conflicts
- [ ] Route parameters match controller expectations
- [ ] All routes tested with actual HTTP requests (not just code inspection)
- [ ] Error responses return appropriate status codes (404, 400, 500)
- [ ] Routes documented in API docs

### Route Order Example

**❌ WRONG (BLOCKER):**
```typescript
router.get('/:id', controller.getById);
router.get('/:id/fetch-price', controller.fetchPrice);  // Never reached!
```

**✅ CORRECT:**
```typescript
router.get('/:id/fetch-price', controller.fetchPrice);  // Specific first
router.get('/:id', controller.getById);                 // Generic last
```

**Why**: Express matches routes in order. `/:id` matches `/123/fetch-price` and stops.

---

## 🔬 API Endpoint Review Checklist

**For all new/modified API endpoints:**

### 1. Integration Test Required
- [ ] Test makes actual HTTP request (not just unit test)
- [ ] Test verifies response status code
- [ ] Test verifies response structure
- [ ] Test covers error cases (404, 400, etc.)

**Example:**
```typescript
describe('GET /api/stocks/:id/fetch-price', () => {
  it('should return 200 with price data', async () => {
    const response = await request(app)
      .get(`/api/stocks/${testStockId}/fetch-price`)
      .expect(200);

    expect(response.body.status).toBe('success');
    expect(response.body.data.price).toBeGreaterThan(0);
  });
});
```

### 2. Manual Verification Required
- [ ] Endpoint tested with cURL or Postman
- [ ] Successful request/response logged in PR description
- [ ] Tested with valid and invalid inputs

**Example PR Description:**
```markdown
## Manual Testing

```bash
curl http://localhost:4000/api/stocks/test-uuid/fetch-price

Response:
{
  "status": "success",
  "data": {
    "stockId": "test-uuid",
    "price": 2550,
    "recordedAt": "2026-01-10T..."
  }
}
```
```

### 3. Error Handling Review
- [ ] All error cases handled
- [ ] Error messages are user-friendly
- [ ] Error status codes are appropriate
- [ ] Errors don't expose sensitive information

---

## 🚨 Silent Failure Pattern Review

When code uses silent failures (try/catch with no user notification):

### Required Questions

1. **What's the fallback behavior?**
2. **Does the fallback always exist?**
3. **Should the user be notified?**
4. **What's the UX for missing data?**

### Examples

**✅ GOOD Silent Failure:**
```typescript
try {
  const optionalData = await fetchOptionalFeature();
  return optionalData;
} catch (error) {
  // Silent failure OK: We have default to show
  return defaultData;
}
```

**❌ BAD Silent Failure:**
```typescript
try {
  const price = await fetchPrice();
  return price;
} catch (error) {
  // Silent failure BAD: Returns undefined/null
  // UI will show ¥0 (confusing!)
  // Should show "-" or error message
}
```

**Rule**: If fallback is `null`, `undefined`, or `0`, question whether silent failure is appropriate.

---

## 📊 Code Quality Checklist

### Structure
- [ ] Code follows project patterns (see existing similar features)
- [ ] No duplicated logic (DRY principle)
- [ ] Functions/methods have single responsibility
- [ ] Naming is clear and consistent

### TypeScript
- [ ] All types properly defined (no `any` without justification)
- [ ] Type inference used where appropriate
- [ ] Interfaces/types reused across frontend/backend where applicable

### Error Handling
- [ ] All async operations have error handling
- [ ] User-facing errors have friendly messages
- [ ] Errors logged appropriately (console.error, logger)
- [ ] No sensitive data in error messages

### Testing
- [ ] Unit tests for business logic
- [ ] Integration tests for API endpoints
- [ ] Edge cases covered (null, empty, invalid input)

---

## 🔤 Regex and Data Parsing Review

**Critical**: When reviewing code that parses external data, check for incomplete data cleaning!

### Regex Review Checklist

- [ ] **What characters are removed?** List all characters the regex handles
- [ ] **What characters might exist?** Check actual data source format
- [ ] **Currency symbols?** `¥`, `$`, `€`, `£`, `₩`, `₹`
- [ ] **Whitespace?** Leading/trailing spaces, non-breaking spaces
- [ ] **Locale differences?** Comma vs period for decimals

### From BUG-20260111-02 (Currency Symbol Parsing Bug)

**What Happened:**
```typescript
// ❌ WRONG: Only removes commas
const price = parseFloat(priceText.replace(/,/g, ''));
// Input: "¥417.30" → Output: NaN (¥ not removed)

// ✅ CORRECT: Removes currency symbols and commas
const price = parseFloat(priceText.replace(/[¥$€£,\s]/g, ''));
// Input: "¥417.30" → Output: 417.30
```

**Why Code Review Missed It:**
1. Didn't verify what characters external service returns
2. Didn't question if regex covers all cases
3. Assumed numeric data would be clean

### Review Questions for Data Parsing

When you see string-to-number conversion:
1. **What is the data source?** (API, scraping, user input, file)
2. **What format does the source return?** (Check actual samples)
3. **Are all unwanted characters removed?** (Currency, spaces, locale)
4. **Are there unit tests for various formats?**

### Example Review Comment

```markdown
**P1 CRITICAL: Incomplete Data Parsing**

The regex `priceText.replace(/,/g, '')` only removes commas.

**Question**: Does Google Finance return prices with currency symbols (¥, $)?

**Required**:
1. Verify actual response format from Google Finance
2. Update regex to handle currency symbols: `/[¥$€£,\s]/g`
3. Add unit tests for various price formats

**Example test cases needed**:
- `"¥1,234"` → `1234`
- `"$1234.56"` → `1234.56`
- `"  1,234  "` → `1234`
```

---

## 🔄 Common Mistakes to Catch

Based on previous bugs in this project:

### 1. Route Conflicts (BUG-20260111-01)
**Watch For:**
- Generic routes (`:id`) defined before specific routes (`:id/action`)
- Routes that never get hit due to shadowing

**How to Catch:**
- Look at route definition order in `*.routes.ts` files
- Verify with integration test (actual HTTP request)

### 2. API Response Structure Mismatches
**Watch For:**
- Backend returns `{ status, data: { ... } }`
- Frontend expects just `{ ... }`
- Or vice versa

**How to Catch:**
- Compare backend controller response with frontend API call
- Check TypeScript types match actual runtime data

### 3. Silent Failures with No Fallback
**Watch For:**
- `try/catch` with no user notification
- Fallback that doesn't exist (null/undefined)
- 0 displayed for missing data (confusing!)

**How to Catch:**
- Search for `catch (error)` blocks
- Check if fallback is always available
- Verify UX for missing data cases

### 4. Missing Integration Tests
**Watch For:**
- New API endpoints without integration tests
- Routes only tested with unit tests
- No actual HTTP request verification

**How to Catch:**
- Look for `__tests__` folders
- Check if tests use `request(app).get(...)` or similar
- Verify tests hit actual routes, not mocked controllers

---

## 📝 Review Comment Templates

### For P0 Blocker
```markdown
**P0 BLOCKER: Route Conflict**

The route `/:id/fetch-price` is defined after `/:id`, which means it will never be reached.

**Impact**: All requests to `/api/stocks/{id}/fetch-price` will return 404.

**Required Fix**:
Move `/:id/fetch-price` before `/:id` in `stocks.routes.ts`.

**Status**: BLOCKED - Code cannot proceed until this is fixed.
```

### For Missing Integration Test
```markdown
**P1 CRITICAL: Missing Integration Test**

New API endpoint `GET /:id/fetch-price` has no integration test.

**Required**:
Add integration test that makes actual HTTP request and verifies:
- 200 status code for valid ID
- Response structure matches expected format
- 404 for invalid ID

**Example**:
```typescript
it('should return price data', async () => {
  const res = await request(app).get(`/api/stocks/${id}/fetch-price`);
  expect(res.status).toBe(200);
  expect(res.body.data.price).toBeGreaterThan(0);
});
```
```

### For Silent Failure Issue
```markdown
**P2 HIGH: Silent Failure Without Fallback**

Price fetch failure is silently caught, but there's no fallback price.

**Issue**:
```typescript
catch (error) {
  console.error('Failed to fetch price:', error);
  // No fallback - will show ¥0
}
```

**Impact**: Users see ¥0 instead of knowing price is unavailable.

**Recommendation**:
- Show "-" or "Price unavailable" instead of ¥0
- Or add user-visible error toast notification
```

---

## ✅ Final Review Checklist

Before marking code as "APPROVED":

- [ ] All P0 blockers fixed and verified
- [ ] All P1 critical issues addressed or documented
- [ ] Integration tests exist for new API endpoints
- [ ] Route order verified (specific before generic)
- [ ] Silent failures reviewed and justified
- [ ] Error handling appropriate
- [ ] TypeScript types correct
- [ ] Code follows project patterns
- [ ] Manual testing completed (if applicable)

**Remember**: It's better to request changes than to approve broken code. Your review protects users and prevents bugs from reaching production.

---

**Reference**: See `/docs/current_sprint/BUG_ANALYSIS_LINE_YAHOO_PRICE.md` for detailed case study of route conflict bug.
