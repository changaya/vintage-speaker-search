# QA Testing Guidelines

**For**: QA Tester (qa-tester subagent)
**Purpose**: Comprehensive testing guidelines to catch bugs before they reach production
**Last Updated**: 2026-01-11

---

## 📋 Testing Scope

### What to Test

**Code-Level Tests:**
- TypeScript compilation (`npx tsc --noEmit`)
- Build success (frontend & backend)
- Linting and code style
- Test suite execution

**Integration Tests:**
- API endpoint accessibility (actual HTTP requests)
- Request/response structure validation
- Error handling (404, 400, 500 responses)
- Database operations (if applicable)

**Component Tests:**
- Component rendering
- Props passing
- State management
- Error boundaries

**End-to-End Flows:**
- User workflows (signup, login, main features)
- Data persistence
- UI feedback (loading states, error messages)

---

## 🎯 Test Priority Framework

### P0 BLOCKER Tests (Must test, must pass)

**API Endpoint Tests:**
- All new/modified endpoints respond to HTTP requests
- Status codes are correct (200, 201, 404, etc.)
- Response structure matches expected format
- Routes are accessible (no 404 from route conflicts)

**Core Functionality Tests:**
- Main user workflows complete successfully
- Data saves to database
- UI displays data correctly
- Critical errors are handled

**Example P0 Test:**
```typescript
describe('POST /api/stocks/:id/fetch-price', () => {
  it('should return 200, not 404', async () => {
    const response = await request(app)
      .get(`/api/stocks/${testId}/fetch-price`);

    expect(response.status).toBe(200);  // Not 404!
    expect(response.body.status).toBe('success');
  });
});
```

### P1 CRITICAL Tests (Should test)
- Edge cases (null, empty, invalid input)
- Error messages displayed to users
- Loading states
- Race conditions

### P2 HIGH Tests (Nice to have)
- Performance benchmarks
- Accessibility
- Browser compatibility

---

## 🔍 API Endpoint Testing Checklist

**For every new or modified API endpoint:**

### 1. Route Accessibility Test
- [ ] Make actual HTTP request to endpoint
- [ ] Verify response is NOT 404 (route conflict check)
- [ ] Test with valid ID/parameters
- [ ] Test with invalid ID/parameters

**Example:**
```typescript
describe('GET /api/stocks/:id/fetch-price', () => {
  it('should be accessible (not 404)', async () => {
    const res = await request(app)
      .get('/api/stocks/test-uuid-123/fetch-price');

    expect(res.status).not.toBe(404);  // Critical!
  });
});
```

### 2. Response Structure Test
- [ ] Status code correct (200, 201, 400, 404, 500)
- [ ] Response body matches expected format
- [ ] Required fields present
- [ ] Data types correct

**Example:**
```typescript
it('should return correct structure', async () => {
  const res = await request(app).get('/api/stocks/123/fetch-price');

  expect(res.body).toHaveProperty('status', 'success');
  expect(res.body.data).toHaveProperty('price');
  expect(typeof res.body.data.price).toBe('number');
  expect(res.body.data.price).toBeGreaterThan(0);
});
```

### 3. Error Handling Test
- [ ] 404 for non-existent resources
- [ ] 400 for invalid input
- [ ] 500 for server errors
- [ ] Error messages are clear

**Example:**
```typescript
it('should return 404 for non-existent stock', async () => {
  const res = await request(app)
    .get('/api/stocks/non-existent-id/fetch-price')
    .expect(404);

  expect(res.body.message).toContain('Stock not found');
});
```

---

## 🚨 Critical Bug Patterns to Check

### 1. Express Route Conflicts

**What to Check:**
- Specific routes (`/:id/action`) defined BEFORE generic routes (`/:id`)
- Routes actually accessible via HTTP (not just defined in code)

**How to Test:**
```typescript
describe('Route Order', () => {
  it('specific route should not be shadowed by generic', async () => {
    // This should hit /:id/fetch-price, not /:id
    const res = await request(app)
      .get('/api/stocks/test-id-123/fetch-price');

    // Should return price data, not stock object
    expect(res.body.data).toHaveProperty('price');
    expect(res.body.data).not.toHaveProperty('ticker');
  });
});
```

**Red Flag**: Getting 404 on specific routes = route conflict!

### 2. Silent Failures

**What to Check:**
- Error handling that logs but doesn't notify user
- Fallback values that don't exist (null, undefined, 0)
- Missing data displayed as 0 or empty

**How to Test:**
```typescript
describe('Price Display', () => {
  it('should show "-" when price unavailable, not ¥0', async () => {
    // Mock API to fail
    mockPriceFetchToFail();

    render(<StockHeader price={null} />);

    expect(screen.queryByText('¥0')).not.toBeInTheDocument();
    expect(screen.getByText(/-|N\/A|Price unavailable/)).toBeInTheDocument();
  });
});
```

**Red Flag**: Users see "¥0" when data is missing!

### 3. API Response Structure Mismatches

**What to Check:**
- Backend response structure matches frontend expectations
- Nested `data` properties handled correctly
- Type conversions work as expected

**How to Test:**
```typescript
describe('API Integration', () => {
  it('should handle backend response structure', async () => {
    // Backend returns: { status: 'success', data: { price: 2550 } }
    const mockResponse = { status: 'success', data: { price: 2550 } };

    // Frontend should extract price correctly
    const price = mockResponse.data.price;
    expect(price).toBe(2550);
  });
});
```

---

## 🧪 Multi-Scenario Testing

**Critical**: Test with multiple instances, not just happy path!

### Why It Matters

- First test may pass due to cached/leftover data
- Second test exposes true behavior
- Edge cases often only appear with specific data

### Multi-Stock Testing Example

```typescript
describe('Stock Price Fetching', () => {
  const testStocks = [
    { id: '1', ticker: '7203', name: 'Toyota' },
    { id: '2', ticker: '4689', name: 'LINE Yahoo' },
    { id: '3', ticker: '6758', name: 'Sony' },
  ];

  testStocks.forEach(stock => {
    it(`should fetch price for ${stock.name}`, async () => {
      const res = await request(app)
        .get(`/api/stocks/${stock.id}/fetch-price`);

      expect(res.status).toBe(200);
      expect(res.body.data.price).toBeGreaterThan(0);
    });
  });
});
```

### Multi-State Testing

- **With data**: Stock with transactions
- **Without data**: Stock without transactions
- **Edge case**: Stock with deleted data
- **Invalid**: Non-existent stock ID

---

## 📊 Test Coverage Checklist

### For Each New Feature

- [ ] **Happy Path**: Feature works as intended
- [ ] **Error Cases**: Handles invalid input gracefully
- [ ] **Edge Cases**: Null, empty, boundary values
- [ ] **Multi-Instance**: Works with 2+ different data sets
- [ ] **Integration**: Works with real backend/database
- [ ] **UI Feedback**: Loading, success, error states visible

### For API Changes

- [ ] **Route Accessible**: HTTP request returns 200, not 404
- [ ] **Response Format**: Matches expected structure
- [ ] **Error Handling**: 404, 400, 500 cases covered
- [ ] **Integration Test**: Actual HTTP request, not mocked
- [ ] **Manual Test**: cURL or Postman verification

### For UI Changes

- [ ] **Rendering**: Component displays without errors
- [ ] **Data Binding**: Props/state displayed correctly
- [ ] **Error States**: Null/undefined handled gracefully
- [ ] **User Feedback**: Loading spinners, error messages visible

---

## 🔬 Test Implementation Guidelines

### Integration Test Template

```typescript
import request from 'supertest';
import app from '../app';
import prisma from '../utils/prisma';

describe('API Endpoint Tests', () => {
  let testData: any;

  beforeAll(async () => {
    // Setup: Create test data
    testData = await prisma.stock.create({
      data: { ticker: '7203', name: 'Toyota' }
    });
  });

  afterAll(async () => {
    // Cleanup: Delete test data
    await prisma.stock.delete({ where: { id: testData.id } });
  });

  describe('GET /api/stocks/:id/fetch-price', () => {
    it('should return 200 with price data', async () => {
      const res = await request(app)
        .get(`/api/stocks/${testData.id}/fetch-price`)
        .expect(200);

      expect(res.body.status).toBe('success');
      expect(res.body.data).toHaveProperty('price');
    });

    it('should return 404 for non-existent stock', async () => {
      const res = await request(app)
        .get('/api/stocks/non-existent-id/fetch-price')
        .expect(404);
    });
  });
});
```

### UI Component Test Template

```typescript
import { render, screen } from '@testing-library/react';
import StockHeader from './StockHeader';

describe('StockHeader', () => {
  it('should display price', () => {
    render(<StockHeader price={2550} name="Toyota" ticker="7203" />);

    expect(screen.getByText('¥2,550')).toBeInTheDocument();
  });

  it('should show "-" when price is null', () => {
    render(<StockHeader price={null} name="Toyota" ticker="7203" />);

    expect(screen.getByText('-')).toBeInTheDocument();
    expect(screen.queryByText('¥0')).not.toBeInTheDocument();
  });
});
```

---

## 🌐 External Service Dependency Testing

**Critical**: When code depends on external services (APIs, web scraping), test the actual data format!

### From BUG-20260111-02 (Currency Symbol Parsing Bug)

**What Happened:**
- Google Finance returned price as `"¥417.30"` (with currency symbol)
- Code only removed commas: `priceText.replace(/,/g, '')`
- `parseFloat("¥417.30")` returned `NaN`
- All price fetches silently failed

**Why QA Missed It:**
1. Tested with mocked responses that didn't include `¥` symbol
2. No data parsing unit tests for various formats
3. No real external service integration test

### External Service Testing Checklist

- [ ] **Sample Real Response**: Capture actual external service response
- [ ] **Format Verification**: Check for unexpected characters (currency symbols, spaces, etc.)
- [ ] **Parsing Test**: Test parsing function with real response format
- [ ] **Edge Cases**: Test with different locales/currencies if applicable

### Data Parsing Test Template

```typescript
describe('Price Parsing', () => {
  const testCases = [
    { input: '1,234.56', expected: 1234.56 },
    { input: '¥1,234', expected: 1234 },      // Currency symbol
    { input: '$1234.56', expected: 1234.56 }, // Dollar sign
    { input: '€1.234,56', expected: 1234.56 },// European format
    { input: '1234', expected: 1234 },        // Plain number
    { input: '  1,234  ', expected: 1234 },   // With spaces
  ];

  testCases.forEach(({ input, expected }) => {
    it(`should parse "${input}" as ${expected}`, () => {
      const result = parsePrice(input);
      expect(result).toBe(expected);
    });
  });

  it('should return null for invalid input', () => {
    expect(parsePrice('invalid')).toBeNull();
    expect(parsePrice('')).toBeNull();
  });
});
```

### External API Test Template

```typescript
describe('Google Finance Integration', () => {
  it('should handle real response format', async () => {
    // Use real API call (not mocked) for integration test
    const price = await googleFinanceService.fetchPrice('7203');

    // Should return valid number, not NaN
    expect(price).not.toBeNaN();
    expect(price).toBeGreaterThan(0);
  });
});
```

**Key Lesson**: Mock tests pass ≠ Real integration works. Always verify with actual external service response format.

---

## 🖼️ Image/File URL Testing

**Critical for frontend/backend separated architecture!**

### From BUG-20260115-01 (Thumbnail URL Bug)

**What Happened:**
- Image URL stored as `/uploads/images/xxx.jpg` (relative path)
- Frontend used `<img src={imageUrl}>` directly
- Browser requested `localhost:3000/uploads/...` → 404
- Image actually served from `localhost:4000/uploads/...`

**Why QA Missed It:**
1. Only did static code analysis and TypeScript build check
2. Didn't test in actual browser
3. Didn't check Network tab for image requests
4. Assumed "build passes = works correctly"

### Image/File URL Test Checklist

**P0 BLOCKER - For all image/file related changes:**

- [ ] **Browser Test**: Actually open the page in browser
- [ ] **Network Tab**: Check image request URLs (F12 → Network → Img)
- [ ] **Request Target**: Verify requests go to correct server (3000 vs 4000)
- [ ] **404 Check**: No broken images in console or Network tab
- [ ] **Placeholder Test**: Test with items that have no image

### How to Test

**Step 1: Open Browser DevTools**
```
F12 → Network tab → Filter: Img
```

**Step 2: Load the Page**
- Navigate to the page with images
- Watch Network tab for image requests

**Step 3: Verify Request URLs**
```
✅ CORRECT: http://localhost:4000/uploads/images/xxx.jpg → 200
❌ WRONG:   http://localhost:3000/uploads/images/xxx.jpg → 404
```

**Step 4: Check Console**
- No "Failed to load resource: 404" errors
- No broken image icons in UI

### Test Report Template for Image Features

```markdown
## Image Loading Test

**Test Environment:**
- Frontend: localhost:3000
- Backend: localhost:4000

**Test Results:**

| Page | Image Request URL | Status | Result |
|------|-------------------|--------|--------|
| /admin/cartridges | localhost:4000/uploads/... | 200 | PASS |
| /admin/turntables | localhost:4000/uploads/... | 200 | PASS |

**Network Tab Screenshot:** [attach if needed]

**Console Errors:** None / [list errors]
```

### Red Flags

🚩 **Immediate FAIL if:**
- Image requests go to wrong server (3000 instead of 4000)
- 404 errors in Network tab for image files
- Broken image icons visible in UI
- Console shows "Failed to load resource" for images

### Key Lesson

```
"TypeScript build passes" ≠ "Images load correctly"

Static analysis cannot catch runtime URL resolution issues.
Always test image features in actual browser with Network tab open.
```

---

## 🚫 Common Testing Mistakes

### From BUG-20260111-01 (LINE Yahoo Price Bug)

**Mistake 1: Not Testing Actual HTTP Requests**
```typescript
// ❌ BAD: Only checks if route is defined
it('route exists', () => {
  expect(router.stack.some(r => r.path === '/:id/fetch-price')).toBe(true);
});

// ✅ GOOD: Actually calls the endpoint
it('route is accessible', async () => {
  const res = await request(app).get('/api/stocks/123/fetch-price');
  expect(res.status).toBe(200);
});
```

**Mistake 2: Not Testing Route Order**
```typescript
// ❌ BAD: Doesn't check if route is shadowed
it('fetchPrice controller exists', () => {
  expect(typeof controller.fetchPrice).toBe('function');
});

// ✅ GOOD: Verifies route actually reaches controller
it('specific route not shadowed by generic', async () => {
  const res = await request(app).get('/api/stocks/123/fetch-price');
  // Should return price data, not stock object
  expect(res.body.data).toHaveProperty('price');
  expect(res.body.data).not.toHaveProperty('ticker');
});
```

**Mistake 3: Only Testing Happy Path**
```typescript
// ❌ BAD: Only tests one stock (might pass coincidentally)
it('fetches price for Toyota', async () => {
  const res = await request(app).get('/api/stocks/toyota-id/fetch-price');
  expect(res.status).toBe(200);
});

// ✅ GOOD: Tests multiple stocks
['toyota-id', 'line-yahoo-id', 'sony-id'].forEach(id => {
  it(`fetches price for ${id}`, async () => {
    const res = await request(app).get(`/api/stocks/${id}/fetch-price`);
    expect(res.status).toBe(200);
  });
});
```

**Mistake 4: Not Testing Error States**
```typescript
// ❌ BAD: Doesn't test what happens when fetch fails
it('displays price', () => {
  render(<StockHeader price={2550} />);
  expect(screen.getByText('¥2,550')).toBeInTheDocument();
});

// ✅ GOOD: Tests null/undefined/error cases
it('displays "-" when price is null', () => {
  render(<StockHeader price={null} />);
  expect(screen.getByText('-')).toBeInTheDocument();
});
```

---

## 📝 Test Report Template

After completing QA testing, document results:

```markdown
# QA Test Report: [Feature Name]

**Test Date**: 2026-01-XX
**Tester**: qa-tester (Claude Code)
**Test Scope**: Code-level, build, integration, UI (specify)

## Summary

- **Total Tests**: X
- **Passed**: X
- **Failed**: X
- **Warnings**: X

## P0 BLOCKER Tests

### ✅ PASSED
- [Test name]: [Brief description]

### ❌ FAILED
- [Test name]: [Brief description]
- **Impact**: [What breaks if not fixed]
- **Recommendation**: [How to fix]

## P1 CRITICAL Tests

### ✅ PASSED / ⚠️ WARNING
- [Test name]: [Brief description]

## Test Details

### 1. API Endpoint Tests

**Test**: Route Accessibility
- **Method**: Actual HTTP GET request
- **Endpoint**: `/api/stocks/:id/fetch-price`
- **Result**: ✅ PASSED (200 status code)

### 2. Integration Tests

**Test**: Response Structure
- **Expected**: `{ status, data: { price, stockId } }`
- **Actual**: Matches expected
- **Result**: ✅ PASSED

## Recommendations

1. [Priority] [Recommendation]
2. [Priority] [Recommendation]

## Known Limitations

- [Limitation 1]
- [Limitation 2]
```

---

## ✅ Final QA Checklist

Before marking feature as "READY":

- [ ] All P0 blocker tests passed
- [ ] Integration tests for new API endpoints exist and pass
- [ ] Multi-instance testing completed (2+ scenarios)
- [ ] Error cases tested (404, 400, null, invalid)
- [ ] UI error states tested (null, loading, error)
- [ ] Route order verified (if applicable)
- [ ] Silent failures reviewed and acceptable
- [ ] Test report documented

**Remember**: "READY FOR MANUAL TESTING" means all automated tests passed. Don't skip tests to speed things up!

---

**Reference**: See `/docs/current_sprint/BUG_ANALYSIS_LINE_YAHOO_PRICE.md` for case study of what happens when testing is insufficient.
