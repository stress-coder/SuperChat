# Create NestJS DTO

Create a DTO file for: $ARGUMENTS

## Rules to Follow

- Use class-validator decorators on every single field
- Add a custom error message to every decorator
- Use @IsOptional() for non-required fields
- For update DTOs: all fields must be optional with ?
- Never use `any` type
- Import all decorators from 'class-validator'

## Common Decorators Reference

```typescript
// Strings
@IsString({ message: 'X must be a string' })
@IsNotEmpty({ message: 'X is required' })
@MinLength(2, { message: 'X must be at least 2 characters' })
@MaxLength(100, { message: 'X must not exceed 100 characters' })

// Email
@IsEmail({}, { message: 'Please provide a valid email' })

// UUID
@IsUUID('4', { message: 'X must be a valid UUID' })

// URL
@IsUrl({}, { message: 'X must be a valid URL' })

// Numbers
@IsNumber({}, { message: 'X must be a number' })
@Min(1, { message: 'X must be at least 1' })
@Max(100, { message: 'X must not exceed 100' })

// Boolean
@IsBoolean({ message: 'X must be true or false' })

// Arrays
@IsArray({ message: 'X must be an array' })
@ArrayMinSize(1, { message: 'X must have at least 1 item' })

// Optional
@IsOptional()

// Password pattern
@Matches(/^(?=.*[A-Z])(?=.*[0-9])/, {
  message: 'Password must contain at least one uppercase letter and one number',
})
```

## DTO Template Pattern

```typescript
import { IsString, IsNotEmpty, IsOptional } from 'class-validator'

export class Create$ARGUMENTSDto {
  @IsString({ message: 'field must be a string' })
  @IsNotEmpty({ message: 'field is required' })
  field: string
}

export class Update$ARGUMENTSDto {
  @IsString({ message: 'field must be a string' })
  @IsOptional()
  field?: string
}
```

## After Creating
- Run: pnpm run lint to check for errors
