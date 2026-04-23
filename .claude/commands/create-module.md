# Create NestJS Module

Create a complete NestJS feature module for: $ARGUMENTS

## Files to Create

```
src/modules/$ARGUMENTS/
├── dto/
│   ├── create-$ARGUMENTS.dto.ts
│   └── update-$ARGUMENTS.dto.ts
├── $ARGUMENTS.module.ts
├── $ARGUMENTS.controller.ts
└── $ARGUMENTS.service.ts
```

## Rules to Follow

### module.ts
- Import TypeOrmModule.forFeature([Entity]) for the module's entities
- Register controller and service
- Export service if other modules may need it

### controller.ts
- HTTP routing only — zero business logic
- Protect all routes with JwtAuthGuard unless explicitly public
- Use @CurrentUser() to get logged-in user
- Use proper HTTP method decorators (@Get, @Post, @Patch, @Delete)
- Use DTOs with @Body(), @Param(), @Query()

### service.ts
- All business logic lives here
- All TypeORM repository calls live here
- Inject repositories using @InjectRepository(Entity)
- Throw proper NestJS exceptions:
  - NotFoundException when resource not found
  - ConflictException when duplicate detected
  - ForbiddenException when access denied
  - BadRequestException for invalid operations
- Never return password field in any response

### create-$ARGUMENTS.dto.ts and update-$ARGUMENTS.dto.ts
- Use class-validator decorators on every field
- Add custom error message to every decorator
- Use @IsOptional() on all fields in update DTO
- Make all fields in update DTO optional with ?

## Response Format (always)
```typescript
return {
  statusCode: 200,
  message: 'Success message here',
  data: result,
}
```

## After Creating Files
- Register the new module in src/app.module.ts imports array
- Run: pnpm run lint to check for errors
