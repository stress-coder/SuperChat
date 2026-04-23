# Create React Custom Hook

Create a custom React hook for: $ARGUMENTS

## File to Create

```
src/hooks/use$ARGUMENTS.ts
```

## Rules to Follow

- Hook name must start with `use` prefix
- Hook must return typed values — no `any`
- Handle loading state with `useState<boolean>`
- Handle error state with `useState<string | null>`
- Clean up side effects in useEffect return function
- If the hook uses socket events, remove listeners on unmount
- If the hook makes API calls, use the axios instance from services/api.ts
- If the hook uses Zustand store, import from store/ folder

## Hook Template Pattern

```typescript
import { useState, useEffect } from 'react'

interface Use$ARGUMENTSReturn {
  // define return type here
  isLoading: boolean
  error: string | null
}

const use$ARGUMENTS = (): Use$ARGUMENTSReturn => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // side effects here

    return () => {
      // cleanup here
    }
  }, [])

  return {
    isLoading,
    error,
  }
}

export default use$ARGUMENTS
```

## After Creating
- Run: pnpm run lint to check for errors
