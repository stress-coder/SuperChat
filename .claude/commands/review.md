# Code Review

Review this code: $ARGUMENTS

## What to Check

### TypeScript
- [ ] No `any` type used anywhere
- [ ] All variables and functions have proper types
- [ ] All interfaces are properly defined
- [ ] No TypeScript errors

### General Code Quality
- [ ] No `console.log` left in the code
- [ ] No commented-out code left behind
- [ ] No hardcoded secrets, URLs, or magic numbers
- [ ] No unused variables or imports
- [ ] Error handling is in place — no unhandled promises

### Backend Specific (if applicable)
- [ ] Controller has zero business logic
- [ ] Service handles all business logic
- [ ] DTOs are used for all request bodies
- [ ] All DTO fields have class-validator decorators
- [ ] All DTO decorators have custom error messages
- [ ] Protected routes use JwtAuthGuard
- [ ] Proper NestJS exceptions are thrown (not generic Error)
- [ ] Password is never returned in any response
- [ ] API response follows { statusCode, message, data } format

### Frontend Specific (if applicable)
- [ ] Props interface is defined for every component
- [ ] No inline styles — Tailwind CSS only
- [ ] Forms use react-hook-form + zod
- [ ] Loading state is handled
- [ ] Error state is handled
- [ ] API calls are in services/ not directly in components

### Security
- [ ] No secrets or API keys exposed
- [ ] No sensitive data returned in responses
- [ ] Auth guards applied where needed

## Output Format

```
✅ Good
- [List what is done well]

❌ Must Fix
- [List issues that must be fixed before merging]

💡 Suggestions
- [List optional improvements]
```
