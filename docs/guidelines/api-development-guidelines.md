# API Development Guidelines

**For**: Backend Developer (backend-developer subagent)
**Purpose**: Best practices for developing reliable, testable API endpoints
**Last Updated**: 2026-01-11

---

## 🎯 Core Principles

1. **Routes are accessible** - Endpoints must respond to HTTP requests
2. **Routes are ordered correctly** - Specific before generic
3. **Errors are handled** - All failure modes covered
4. **Tests exist** - Integration tests for all endpoints
5. **Documentation exists** - API documented and examples provided

---

## 🛤️ Express Route Development

### Critical Rule: Route Order Matters

**Express matches routes in definition order. Specific routes MUST come before generic routes.**

### ❌ WRONG (P0 BLOCKER)

```typescript
// stocks.routes.ts
router.get('/:id', controller.getById);
router.get('/:id/fetch-price', controller.fetchPrice);  // ❌ Never reached!
router.put('/:id', controller.update);
router.delete('/:id', controller.delete);
```

**Problem**: Express matches `GET /stocks/123/fetch-price` to `/:id` route, treating "123/fetch-price" as the ID.

### ✅ CORRECT

```typescript
// stocks.routes.ts
router.get('/', controller.getAll);
router.get('/:id/fetch-price', controller.fetchPrice);  // ✅ Specific first
router.get('/:id', controller.getById);                 // ✅ Generic last
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.delete);
```

**Rule**: List routes from most specific to least specific:
1. Static routes (`/health`, `/version`)
2. Parameterized with subpath (`/:id/fetch-price`, `/:id/transactions`)
3. Generic parameterized (`/:id`)

---

## 📋 Route Development Checklist

**For every new or modified route:**

### 1. Route Definition
- [ ] Route placed in correct order (specific before generic)
- [ ] Route path follows REST conventions
- [ ] HTTP method appropriate (GET, POST, PUT, DELETE)
- [ ] Parameter names clear (`:id`, `:stockId`, not `:x`)

### 2. Controller Implementation
- [ ] Controller method exists and is exported
- [ ] Request validation (Zod schema or similar)
- [ ] Business logic in service layer (not controller)
- [ ] Error handling with `next(error)`
- [ ] Appropriate status codes (200, 201, 400, 404, 500)

### 3. Response Structure
- [ ] Consistent format: `{ status: 'success', data: {...} }`
- [ ] Error format: `{ status: 'error', message: '...' }`
- [ ] TypeScript types defined for responses

### 4. Testing
- [ ] Integration test exists (actual HTTP request)
- [ ] Tests success case (200/201)
- [ ] Tests error cases (404, 400)
- [ ] Tests route accessibility (not shadowed)

### 5. Documentation
- [ ] API documented (OpenAPI/Swagger or markdown)
- [ ] Example request/response in docs
- [ ] Error codes documented

---

## 🔧 Controller Development Pattern

### Standard Controller Structure

```typescript
// controllers/stocks.controller.ts
import { Request, Response, NextFunction } from 'express';
import stockService from '../services/stock.service';
import { createStockSchema } from '../schemas/stock.schema';

export class StocksController {
  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      // Validation (if needed)
      if (!id) {
        return res.status(400).json({
          status: 'error',
          message: 'Stock ID is required'
        });
      }

      // Business logic in service layer
      const stock = await stockService.getStockById(id);

      // Return consistent format
      res.json({
        status: 'success',
        data: stock
      });
    } catch (error) {
      // Error handling
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      // Validate request body with Zod
      const validatedData = createStockSchema.parse(req.body);

      // Business logic
      const stock = await stockService.createStock(validatedData);

      // Return 201 for creation
      res.status(201).json({
        status: 'success',
        data: stock
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new StocksController();
```

### Key Points

1. **Always use try/catch** - Don't let errors crash the server
2. **Use `next(error)`** - Let error middleware handle errors
3. **Validate input** - Use Zod schemas for type safety
4. **Business logic in services** - Keep controllers thin
5. **Consistent response format** - Makes frontend integration easier

---

## 🧪 Integration Testing

### Why Integration Tests Are Critical

**Unit tests alone are NOT enough:**
- Unit tests mock HTTP layer → can't catch route conflicts
- Integration tests make actual HTTP requests → catch real issues

### Integration Test Template

```typescript
// routes/__tests__/stocks.routes.test.ts
import request from 'supertest';
import app from '../../app';
import prisma from '../../utils/prisma';

describe('Stocks Routes', () => {
  let testStock: any;

  beforeAll(async () => {
    // Setup: Create test data
    testStock = await prisma.stock.create({
      data: { ticker: '7203', name: 'Toyota Motor Corporation' }
    });
  });

  afterAll(async () => {
    // Cleanup: Delete test data
    await prisma.stock.delete({ where: { id: testStock.id } });
    await prisma.$disconnect();
  });

  describe('GET /api/stocks/:id', () => {
    it('should return stock by id', async () => {
      const res = await request(app)
        .get(`/api/stocks/${testStock.id}`)
        .expect(200);

      expect(res.body.status).toBe('success');
      expect(res.body.data).toHaveProperty('id', testStock.id);
      expect(res.body.data).toHaveProperty('ticker', '7203');
    });

    it('should return 404 for non-existent stock', async () => {
      const res = await request(app)
        .get('/api/stocks/non-existent-id')
        .expect(404);

      expect(res.body.status).toBe('error');
      expect(res.body.message).toContain('not found');
    });
  });

  describe('GET /api/stocks/:id/fetch-price', () => {
    it('should be accessible (route not shadowed)', async () => {
      const res = await request(app)
        .get(`/api/stocks/${testStock.id}/fetch-price`);

      // Should NOT be 404 (would mean route conflict)
      expect(res.status).not.toBe(404);

      // Should return price data, not stock object
      expect(res.body.data).toHaveProperty('price');
      expect(res.body.data).not.toHaveProperty('ticker');
    });
  });

  describe('POST /api/stocks', () => {
    it('should create new stock', async () => {
      const newStock = { ticker: '6758', name: 'Sony Group Corporation' };

      const res = await request(app)
        .post('/api/stocks')
        .send(newStock)
        .expect(201);

      expect(res.body.status).toBe('success');
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data.ticker).toBe('6758');

      // Cleanup
      await prisma.stock.delete({ where: { id: res.body.data.id } });
    });

    it('should return 400 for invalid data', async () => {
      const invalidStock = { ticker: '' };  // Missing name

      const res = await request(app)
        .post('/api/stocks')
        .send(invalidStock)
        .expect(400);

      expect(res.body.status).toBe('error');
    });
  });
});
```

### What Makes a Good Integration Test

1. **Actually calls HTTP endpoint** - Uses `request(app).get(...)`
2. **Tests success case** - Verifies 200/201 response
3. **Tests error cases** - Verifies 404, 400 responses
4. **Checks response structure** - Verifies `{ status, data }`
5. **Cleans up test data** - Deletes created records

---

## 🚨 Error Handling Best Practices

### Error Middleware Pattern

```typescript
// middleware/error.middleware.ts
export class AppError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Default to 500 if no status code
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal server error';

  // Log error
  logger.error({
    message: error.message,
    stack: error.stack,
    statusCode,
    path: req.path,
  });

  // Send response
  res.status(statusCode).json({
    status: 'error',
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
  });
};
```

### Using AppError in Controllers

```typescript
// Service layer
async getStockById(id: string) {
  const stock = await prisma.stock.findUnique({ where: { id } });

  if (!stock) {
    throw new AppError('Stock not found', 404);
  }

  return stock;
}

// Controller automatically catches and handles via error middleware
async getById(req: Request, res: Response, next: NextFunction) {
  try {
    const stock = await stockService.getStockById(req.params.id);
    res.json({ status: 'success', data: stock });
  } catch (error) {
    next(error);  // Error middleware handles it
  }
}
```

---

## 📊 Response Format Standards

### Success Responses

```typescript
// Single resource (GET /api/stocks/:id)
{
  "status": "success",
  "data": {
    "id": "123",
    "ticker": "7203",
    "name": "Toyota Motor Corporation"
  }
}

// Resource list (GET /api/stocks)
{
  "status": "success",
  "data": [
    { "id": "123", "ticker": "7203", "name": "Toyota" },
    { "id": "456", "ticker": "6758", "name": "Sony" }
  ]
}

// Creation (POST /api/stocks)
{
  "status": "success",
  "data": {
    "id": "789",
    "ticker": "4689",
    "name": "LINE Yahoo"
  }
}
```

### Error Responses

```typescript
// 404 Not Found
{
  "status": "error",
  "message": "Stock not found"
}

// 400 Bad Request
{
  "status": "error",
  "message": "Validation failed",
  "errors": [
    { "field": "ticker", "message": "Ticker is required" }
  ]
}

// 500 Internal Server Error
{
  "status": "error",
  "message": "Internal server error"
}
```

---

## 🔍 Common Pitfalls

### From BUG-20260111-01 (LINE Yahoo Price Bug)

**Pitfall 1: Route Order**
```typescript
// ❌ WRONG
router.get('/:id', getById);
router.get('/:id/fetch-price', fetchPrice);  // Never reached!

// ✅ CORRECT
router.get('/:id/fetch-price', fetchPrice);
router.get('/:id', getById);
```

**Pitfall 2: No Integration Test**
```typescript
// ❌ BAD: Only unit test
it('fetchPrice service works', () => {
  const price = await service.fetchPrice('7203');
  expect(price).toBeGreaterThan(0);
});

// ✅ GOOD: Integration test
it('fetch-price endpoint accessible', async () => {
  const res = await request(app).get('/api/stocks/123/fetch-price');
  expect(res.status).toBe(200);  // Not 404!
});
```

**Pitfall 3: Silent Failure Without Fallback**
```typescript
// ❌ BAD
async fetchAndSavePrice(stockId: string) {
  try {
    const price = await this.fetchPrice(ticker);
    return price;
  } catch (error) {
    logger.error('Failed to fetch price');
    return null;  // Frontend shows ¥0 (confusing!)
  }
}

// ✅ GOOD
async fetchAndSavePrice(stockId: string) {
  const price = await this.fetchPrice(ticker);

  if (price === null) {
    throw new AppError('Failed to fetch price from Google Finance', 500);
  }

  return price;
}
```

---

## ✅ Pre-Commit Checklist

Before committing API changes:

- [ ] Routes in correct order (specific before generic)
- [ ] Integration tests exist and pass
- [ ] Manual test with cURL/Postman successful
- [ ] Error cases handled (404, 400, 500)
- [ ] Response format consistent
- [ ] TypeScript types defined
- [ ] API documented

**Quick Test:**
```bash
# Test endpoint accessibility
curl http://localhost:4000/api/stocks/test-id/fetch-price

# Should NOT return:
# - 404 (route conflict)
# - 500 (unhandled error)
# - HTML (wrong content type)

# Should return:
# - 200 with JSON: { "status": "success", "data": {...} }
```

---

## 📝 API Documentation Template

```markdown
## GET /api/stocks/:id/fetch-price

Fetches current price from Google Finance and saves to database.

**Parameters:**
- `id` (path, required): Stock UUID

**Response: 200 OK**
```json
{
  "status": "success",
  "data": {
    "stockId": "123e4567-e89b-12d3-a456-426614174000",
    "price": 2550,
    "recordedAt": "2026-01-10T10:30:00Z"
  }
}
```

**Response: 404 Not Found**
```json
{
  "status": "error",
  "message": "Stock not found"
}
```

**Response: 500 Internal Server Error**
```json
{
  "status": "error",
  "message": "Failed to fetch price from Google Finance"
}
```

**Example:**
```bash
curl http://localhost:4000/api/stocks/123e4567-e89b-12d3-a456-426614174000/fetch-price
```
```

---

## 🛠️ Development Workflow

### Step-by-Step Process

1. **Plan**
   - Define endpoint: method, path, parameters
   - Design request/response format
   - Identify error cases

2. **Implement Route**
   - Add route in correct order (specific before generic)
   - Register in router file

3. **Implement Controller**
   - Add controller method
   - Validate input
   - Call service layer
   - Return consistent response

4. **Implement Service**
   - Business logic here (not in controller)
   - Throw AppError for error cases
   - Log important events

5. **Write Integration Test**
   - Test success case (200/201)
   - Test error cases (404, 400)
   - Test route accessibility

6. **Manual Test**
   - Test with cURL or Postman
   - Verify response format
   - Test error cases

7. **Document**
   - Add to API documentation
   - Include example request/response
   - Document error codes

8. **Commit**
   - Run integration tests
   - Verify route order
   - Log in work order

---

**Remember**: A route that works in development but returns 404 in production is a P0 BLOCKER. Always verify routes are accessible!

**Reference**: See `/docs/current_sprint/BUG_ANALYSIS_LINE_YAHOO_PRICE.md` for detailed case study.
