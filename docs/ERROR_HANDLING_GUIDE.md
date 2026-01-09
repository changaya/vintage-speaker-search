# Error Handling Guide

## Overview

This document describes the error handling strategy for the Vintage Audio application, including environment-based error display, error response formats, and best practices.

---

## Environment Configuration

### Backend (.env)

```bash
# Environment (development | production)
NODE_ENV=development
```

- **development**: Shows detailed error messages, stack traces, and validation details
- **production**: Shows user-friendly error messages only, hides sensitive information

### Frontend (.env.local)

```bash
# API URL
NEXT_PUBLIC_API_URL=http://localhost:4000/api

# Optional: Enable debug mode (shows detailed console logging)
# NEXT_PUBLIC_DEBUG=true
```

- **NEXT_PUBLIC_DEBUG=true**: Enables detailed error logging in console
- **Omit or set to false**: Production mode (minimal logging)

---

## Error Response Format

All API error responses follow this standardized format:

```typescript
{
  success: false,
  error: {
    message: string,      // User-facing error message
    code: string,         // Error code for programmatic handling
    details?: any         // Detailed error info (development only)
  }
}
```

---

## Backend Error Handling

### Error Middleware

Location: `/vintage-audio-backend/src/middleware/error.middleware.ts`

The error middleware handles all errors globally and formats them according to the environment.

### Error Types Handled

#### 1. Zod Validation Errors

**Development:**
```json
{
  "success": false,
  "error": {
    "message": "Validation failed",
    "code": "VALIDATION_ERROR",
    "details": [
      {
        "path": "modelName",
        "message": "Model name is required",
        "code": "invalid_type"
      }
    ]
  }
}
```

**Production:**
```json
{
  "success": false,
  "error": {
    "message": "Invalid modelName: Model name is required",
    "code": "VALIDATION_ERROR"
  }
}
```

#### 2. Prisma Database Errors

**Common Error Codes:**

- **P2002**: Unique constraint violation
  - Development: `"Unique constraint failed on fields: modelName, brandId"`
  - Production: `"This record already exists"`

- **P2003**: Foreign key constraint violation
  - Development: `"Foreign key constraint failed on field: brandId"`
  - Production: `"Related record not found"`

- **P2025**: Record not found
  - Both: `"Record not found"`

- **P2014**: Required relation violation
  - Development: `"Required relation violation: cartridges"`
  - Production: `"Cannot delete record with existing relations"`

**Development Example:**
```json
{
  "success": false,
  "error": {
    "message": "Unique constraint failed on fields: modelName, brandId",
    "code": "P2002",
    "details": {
      "code": "P2002",
      "meta": {
        "target": ["modelName", "brandId"]
      },
      "clientVersion": "5.22.0"
    }
  }
}
```

**Production Example:**
```json
{
  "success": false,
  "error": {
    "message": "This record already exists",
    "code": "P2002"
  }
}
```

#### 3. JWT Authentication Errors

**JsonWebTokenError:**
```json
{
  "success": false,
  "error": {
    "message": "Invalid authentication token",
    "code": "JWT_INVALID"
  }
}
```

**TokenExpiredError:**
```json
{
  "success": false,
  "error": {
    "message": "Authentication token expired",
    "code": "JWT_EXPIRED"
  }
}
```

#### 4. File Upload Errors (Multer)

**File too large:**
```json
{
  "success": false,
  "error": {
    "message": "File size exceeds limit",
    "code": "UPLOAD_ERROR"
  }
}
```

**Unexpected file field:**
```json
{
  "success": false,
  "error": {
    "message": "Unexpected file field",
    "code": "UPLOAD_ERROR"
  }
}
```

#### 5. Generic Errors (500)

**Development:**
```json
{
  "success": false,
  "error": {
    "message": "Cannot read property 'id' of undefined",
    "code": "INTERNAL_SERVER_ERROR",
    "details": {
      "stack": "Error: Cannot read property...\n    at ...",
      "name": "TypeError"
    }
  }
}
```

**Production:**
```json
{
  "success": false,
  "error": {
    "message": "Something went wrong",
    "code": "INTERNAL_SERVER_ERROR"
  }
}
```

#### 6. 404 Not Found

**Development:**
```json
{
  "success": false,
  "error": {
    "message": "Route GET /api/invalid not found",
    "code": "NOT_FOUND",
    "details": {
      "method": "GET",
      "path": "/api/invalid",
      "baseUrl": ""
    }
  }
}
```

**Production:**
```json
{
  "success": false,
  "error": {
    "message": "Route GET /api/invalid not found",
    "code": "NOT_FOUND"
  }
}
```

---

## Frontend Error Handling

### API Client

Location: `/vintage-audio-frontend/lib/api.ts`

### Error Logging

**Development Mode:**
- Detailed console logging with request/response details
- Error details displayed in collapsible console groups
- Stack traces and validation details shown

```javascript
console.group('🚨 API Error');
console.error('Request:', {
  method: 'POST',
  url: '/cartridges',
  data: { ... }
});
console.error('Response:', {
  status: 400,
  data: { error: { ... } }
});
console.error('Error Details:', [ ... ]);
console.groupEnd();
```

**Production Mode:**
- Minimal console logging
- Only essential information

```javascript
console.error('API Error:', {
  status: 400,
  message: 'Validation failed'
});
```

### Toast Notifications

Admin pages use `react-hot-toast` for user-facing error messages.

**Example:**
```typescript
try {
  await api.post('/cartridges', payload);
  toast.success('Cartridge created successfully');
} catch (error: any) {
  const message = error.response?.data?.error?.message || 'Failed to create cartridge';
  toast.error(message);
}
```

**Development:**
- Shows detailed error message from backend
- Example: `"Invalid modelName: Model name is required"`

**Production:**
- Shows user-friendly error message
- Example: `"Validation failed"` or custom message

---

## Error Codes Reference

### Standard HTTP Status Codes

- **400 Bad Request**: Validation errors, malformed requests
- **401 Unauthorized**: Authentication required or invalid token
- **404 Not Found**: Resource or route not found
- **500 Internal Server Error**: Unexpected server errors

### Custom Error Codes

- **VALIDATION_ERROR**: Zod validation failed
- **PRISMA_VALIDATION_ERROR**: Prisma data validation failed
- **JWT_INVALID**: Invalid JWT token
- **JWT_EXPIRED**: Expired JWT token
- **UPLOAD_ERROR**: File upload failed
- **INTERNAL_SERVER_ERROR**: Generic server error
- **NOT_FOUND**: Route or resource not found
- **P2002**: Unique constraint violation (Prisma)
- **P2003**: Foreign key constraint violation (Prisma)
- **P2025**: Record not found (Prisma)
- **P2014**: Required relation violation (Prisma)

---

## Best Practices

### Backend

1. **Always use try-catch** in async route handlers
2. **Pass errors to next()** to trigger error middleware
   ```typescript
   try {
     // ... operation
   } catch (error) {
     next(error);  // Let error middleware handle it
   }
   ```
3. **Use Zod for validation** to get structured error details
4. **Never expose sensitive info** in production errors
5. **Log all errors** to console for debugging

### Frontend

1. **Always handle API errors** in try-catch blocks
2. **Use toast notifications** for user feedback
3. **Extract error messages** from standardized response format
   ```typescript
   const message = error.response?.data?.error?.message || 'Operation failed';
   ```
4. **Provide fallback messages** when backend message is missing
5. **Log errors in development** for debugging

### Admin Pages

Common error handling pattern:

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  try {
    setLoading(true);

    const response = await api.post('/endpoint', payload);

    // Success
    toast.success('Operation successful');
    // ... update state

  } catch (error: any) {
    console.error('Operation error:', error);
    const message = error.response?.data?.error?.message || 'Operation failed';
    toast.error(message);
  } finally {
    setLoading(false);
  }
};
```

---

## Testing Error Handling

### Development Testing

1. **Validation Errors**: Submit invalid data
   - Missing required fields
   - Invalid field types
   - Out-of-range values

2. **Database Errors**: Trigger constraint violations
   - Duplicate unique fields (P2002)
   - Invalid foreign keys (P2003)
   - Delete records with relations (P2014)

3. **Authentication Errors**: Test JWT handling
   - Expired tokens
   - Invalid tokens
   - Missing tokens

4. **File Upload Errors**: Test upload limits
   - Files exceeding size limit
   - Invalid file types
   - Network interruptions

### Production Testing

1. Verify error messages are user-friendly
2. Confirm no stack traces or sensitive data exposed
3. Check console logs are minimal
4. Validate toast messages are helpful

---

## Environment-Specific Behavior Summary

| Feature | Development | Production |
|---------|-------------|------------|
| Error Messages | Detailed, technical | User-friendly, simple |
| Stack Traces | Included | Hidden |
| Validation Details | Full Zod error array | First error only |
| Database Errors | Prisma error codes + meta | User-friendly messages |
| Console Logging | Verbose, grouped | Minimal |
| Error Details | Included in response | Omitted |
| Toast Notifications | Technical messages | Simple messages |

---

## Troubleshooting

### "Error doesn't show details in development"

- Check `NODE_ENV=development` in backend .env
- Verify `process.env.NODE_ENV === 'development'` evaluates to true

### "Too many errors in console (production)"

- Ensure `NODE_ENV=production` is set
- Remove `NEXT_PUBLIC_DEBUG=true` from frontend .env

### "Toast shows generic message instead of specific error"

- Check error response format matches standard
- Verify error extraction path: `error.response?.data?.error?.message`
- Ensure backend error middleware is applied

### "401 errors don't redirect to login"

- Verify api.ts response interceptor is registered
- Check localStorage token handling
- Ensure `window.location.href` redirect works

---

## Migration Guide

### Updating Existing Error Handling

1. **Backend Routes**: Replace custom error responses with throwing errors

   Before:
   ```typescript
   if (!record) {
     return res.status(404).json({ error: 'Not found' });
   }
   ```

   After:
   ```typescript
   if (!record) {
     throw new Error('Record not found');
     // Or use a custom error class
   }
   ```

2. **Frontend Components**: Update error message extraction

   Before:
   ```typescript
   const message = error.response?.data?.message || 'Failed';
   ```

   After:
   ```typescript
   const message = error.response?.data?.error?.message || 'Failed';
   ```

3. **Error Codes**: Use error codes for programmatic handling

   ```typescript
   if (error.response?.data?.error?.code === 'P2002') {
     toast.error('This item already exists');
   }
   ```

---

## Future Enhancements

- **Error Tracking Service**: Integrate Sentry or similar for production error tracking
- **Custom Error Classes**: Create domain-specific error classes for better categorization
- **Error Analytics**: Track error frequencies and patterns
- **User-Friendly Error Pages**: Custom 404/500 pages in frontend
- **Retry Logic**: Automatic retry for transient errors
- **Error Recovery**: Suggestions for fixing validation errors

---

## Conclusion

This error handling system provides:
- ✅ Consistent error format across all APIs
- ✅ Environment-aware error display
- ✅ Detailed debugging in development
- ✅ User-friendly messages in production
- ✅ Secure error handling (no sensitive data exposure)
- ✅ Comprehensive error type coverage

For questions or improvements, refer to the backend error middleware (`src/middleware/error.middleware.ts`) and frontend API client (`lib/api.ts`).
