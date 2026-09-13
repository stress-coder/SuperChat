# Frontend Context

## Tech Stack
- **Framework:** React 19 + Vite + TypeScript (strict mode)
- **Styling:** Plain CSS with BEM-style class names, one file per area in `src/assets/css/` — no inline styles, ever
- **State Management:** Redux Toolkit (`configureStore`) with hand-written switch-case reducers
- **HTTP Client:** Axios — base URL from `VITE_API_URL` env variable
- **Real-time:** socket.io-client
- **Forms:** react-hook-form + zod
- **Notifications:** react-hot-toast — the single place backend messages are shown
- **Icons:** lucide-react
- **Date Formatting:** date-fns

## Folder Structure
```
src/
├── apis/                  # All API + logic code — never put logic in pages
│   ├── client.ts          # Shared axios instance + interceptors + ApiError
│   └── auth.api.ts        # ONE file per module: login/register/refresh/logout
├── assets/
│   ├── css/               # All stylesheets live here
│   │   ├── global.css     # Design tokens + resets (imported once in main.tsx)
│   │   ├── auth.css
│   │   ├── button.css
│   │   └── chat.css
│   └── images/            # All images live here
├── components/
│   ├── ui/                # Base reusable components
│   │   └── Button.tsx
│   └── shared/            # Compound components + route guards
│       ├── ProtectedRoute.tsx
│       └── PublicOnlyRoute.tsx
├── config/
│   └── env.ts             # Central env config — read all env vars here
├── pages/
│   ├── auth/
│   │   ├── LoginPage.tsx
│   │   └── RegisterPage.tsx
│   └── ChatPage.tsx
├── store/                 # Redux
│   ├── constants/         # ACTION_TYPE constants, block letters
│   │   └── authConstants.ts
│   ├── actions/           # Dispatchers — API calls + side effects live here
│   │   └── authActions.ts
│   ├── slices/            # Pure switch-case reducers
│   │   └── authSlice.ts
│   ├── hooks.ts           # Typed useAppDispatch / useAppSelector
│   └── index.ts           # configureStore
├── hooks/                 # Custom React hooks (useSocket, useChat, …)
├── types/                 # TypeScript interfaces
│   ├── api.types.ts       # ApiResponse<T> envelope
│   └── user.types.ts
├── validations/           # zod schemas — ONE file per schema
│   ├── login.validation.ts
│   └── register.validation.ts
├── utils/                 # Helper functions
│   └── authStorage.ts
├── App.tsx                # React Router config
└── main.tsx
```

## Environment Variables Rules (CRITICAL)
- **Never hardcode** URLs, ports, secrets, or any config values
- Always read values from `.env` file using `import.meta.env`
- All Vite env variables must be prefixed with `VITE_`
- Never use `import.meta.env` directly in components or services
- Always go through `src/config/env.ts` — one central place for all env vars
- Always add a runtime check — throw a clear error if a required variable is missing

```typescript
// ✅ Correct — read from env via central config
import { env } from '@/config/env'
const api = axios.create({ baseURL: env.apiUrl })

// ❌ Wrong — never hardcode any URL or value
const api = axios.create({ baseURL: 'http://localhost:3000' })

// ❌ Wrong — never use import.meta.env directly outside of config/env.ts
const api = axios.create({ baseURL: import.meta.env.VITE_API_URL })
```

### `src/config/env.ts` — Central Env Config (always use this file)
```typescript
// All env variables are read and validated in ONE place
// Import { env } from '@/config/env' everywhere you need a config value

const requiredEnvVars = {
  apiUrl: import.meta.env.VITE_API_URL,
  socketUrl: import.meta.env.VITE_SOCKET_URL,
} as const

// Validate all required variables are present at app startup
Object.entries(requiredEnvVars).forEach(([key, value]) => {
  if (!value) {
    throw new Error(
      `Missing required environment variable: VITE_${key.replace(/([A-Z])/g, '_$1').toUpperCase()}`
    )
  }
})

export const env = requiredEnvVars
```

### Required `.env` file (at frontend root — never commit this)
```
VITE_API_URL=http://localhost:3000
VITE_SOCKET_URL=http://localhost:3000
```

### Required `.env.example` file (committed to git — no values)
```
VITE_API_URL=
VITE_SOCKET_URL=
```

## Component Rules
- Every component must have a TypeScript props interface
- Always use plain CSS classes from `src/assets/css/` — never inline styles
- Always export component as default export
- Always handle loading state (show spinner or skeleton)
- Always handle error state (show error message)
- API calls never go directly in components — use `src/apis/`

```typescript
// ✅ Correct component pattern
interface MessageBubbleProps {
  content: string
  isSent: boolean
  createdAt: Date
}

const MessageBubble = ({ content, isSent, createdAt }: MessageBubbleProps) => {
  return (
    <div className={`bubble${isSent ? ' bubble--sent' : ''}`}>
      ...
    </div>
  )
}

export default MessageBubble
```

## Form Rules
- Always use react-hook-form for form state
- Always use zod for schema validation
- Always show inline validation errors
- Always show loading state on submit button

```typescript
// ✅ Correct form pattern
const schema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

type FormData = z.infer<typeof schema>

const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
  resolver: zodResolver(schema),
})
```

## API Rules

- **One API file per module** — `apis/auth.api.ts`, `apis/chat.api.ts`. The shared
  axios instance lives once in `apis/client.ts`; never create another.
- **Never write user-facing message text in the frontend.** Every success and
  error string comes from the backend envelope's `message`. `client.ts` has a
  response interceptor that rejects with an `ApiError` carrying that message;
  actions just pass it to a toast.
- Type every call with the envelope: `apiClient.post<ApiResponse<LoginData>>(...)`.
- Show messages with `toast.success()` / `toast.error()` from the dispatcher —
  never duplicate the same message in an inline banner as well.

```typescript
// apis/auth.api.ts — return the backend's message alongside the data
export const loginRequest = async (values: LoginFormValues): Promise<AuthResult> => {
  const { data } = await apiClient.post<ApiResponse<LoginData>>('/auth/login', values)
  return { message: data.message, user: data.data.user, accessToken: data.data.accessToken }
}

// store/actions/authActions.ts — the message is displayed, never invented
toast.success(message)          // ✅ from the backend
toast.error((error as Error).message)
toast.error('Login failed')     // ❌ never hardcode message text
```

## Validation Rules

- All zod schemas live in `src/validations/`, **one file per schema**:
  `login.validation.ts`, `register.validation.ts`.
- Each file exports the schema and its inferred type.
- Schemas mirror the backend DTO rules, since the backend's validation messages
  are not currently usable (see the note in the API Rules above).

## Redux Pattern (always follow this flow)

State changes always travel the same four steps, one per file:

```
event handler  →  dispatcher  →  ACTION constant  →  switch case
   (page)         (actions/)      (constants/)        (slices/)
```

**Rules**
- Dispatch from the event itself — the submit handler, the click handler. No wrapper hooks.
- Action types are block-letter constants in `store/constants/`, never inline strings.
- Reducers are **pure**: no API calls, no localStorage, no navigation. Always return a new object — there is no Immer, so mutating state silently skips re-renders.
- All side effects live in `store/actions/`.
- Never use `createSlice`. Plain reducers keep the action types visible.

```typescript
// store/constants/authConstants.ts
export const AUTH_LOGIN_SUCCESS = 'AUTH_LOGIN_SUCCESS'
export const AUTH_LOGOUT = 'AUTH_LOGOUT'

// store/slices/authSlice.ts — pure, returns new objects
export type AuthAction =
  | { type: typeof AUTH_LOGIN_SUCCESS; payload: Credentials }
  | { type: typeof AUTH_LOGOUT }

const authReducer = (state: AuthState = initialState, action: UnknownAction): AuthState => {
  const authAction = action as AuthAction

  switch (authAction.type) {
    case AUTH_LOGIN_SUCCESS:
      return { ...state, user: authAction.payload.user, isAuthenticated: true }
    case AUTH_LOGOUT:
      return { ...state, user: null, isAuthenticated: false }
    default:
      return state
  }
}

// store/actions/authActions.ts — side effects belong here
export const loginUser =
  (values: LoginFormValues) =>
  async (dispatch: Dispatch): Promise<void> => {
    try {
      const { message, user, accessToken } = await loginRequest(values)
      writeStoredAuth(accessToken, user)
      dispatch({ type: AUTH_LOGIN_SUCCESS, payload: { user, accessToken } })
      toast.success(message)        // backend's message
    } catch (error) {
      toast.error((error as Error).message)
    }
  }

// pages/auth/LoginPage.tsx — dispatch at the point of the event
const dispatch = useAppDispatch()

const submit = async (values: LoginFormValues) => {
  await dispatch(loginUser(values))
}
```

## Axios Instance Pattern (`src/apis/client.ts`)
```typescript
// apis/client.ts
import { env } from '@/config/env'
import { store } from '@/store'

export const apiClient = axios.create({
  baseURL: env.apiUrl,    // ✅ from env — never hardcoded
  withCredentials: true,  // required: refresh token is an httpOnly cookie
})

apiClient.interceptors.request.use((config) => {
  const { accessToken } = store.getState().auth
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`
  return config
})

// Failures reject with ApiError carrying the BACKEND's message — never ours
apiClient.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(new ApiError(error.response?.data?.message ?? error.message, status)),
)
```

## Socket Pattern
```typescript
// apis/socket.ts
import { env } from '@/config/env'
import { store } from '@/store'

const socket = io(env.socketUrl, {    // ✅ from env — never hardcoded
  auth: { token: store.getState().auth.accessToken },
  autoConnect: false,
})
```

## Routing Rules
- `/login`    → public, redirect to /chat if authenticated
- `/register` → public, redirect to /chat if authenticated
- `/chat`     → protected, redirect to /login if not authenticated
