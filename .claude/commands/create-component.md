# Create React Component

Create a React component for: $ARGUMENTS

## Files to Create

```
src/components/$ARGUMENTS/
├── $ARGUMENTS.tsx
└── index.ts
```

## Rules to Follow

### $ARGUMENTS.tsx
- Define a TypeScript props interface above the component
- Use Tailwind CSS for all styling — no inline styles
- Export the component as default export
- Handle loading state if the component fetches data
- Handle error state if the component fetches data
- If the component has a form:
  - Use react-hook-form for form state
  - Use zod for validation schema
  - Show inline validation errors under each field
  - Show loading state on submit button during API call
  - Use react-hot-toast for success and error notifications

### index.ts
- Re-export the default component
```typescript
export { default } from './$ARGUMENTS'
```

## Component Template Pattern
```typescript
interface $ARGUMENTSProps {
  // define props here
}

const $ARGUMENTS = ({}: $ARGUMENTSProps) => {
  return (
    <div>
      {/* component content */}
    </div>
  )
}

export default $ARGUMENTS
```

## After Creating Files
- Run: pnpm run lint to check for errors
