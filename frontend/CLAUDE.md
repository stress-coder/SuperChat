# Frontend Context

## Tech Stack
- **Framework:** React 19 + Vite + TypeScript (strict mode)
- **Styling:** Tailwind CSS — no inline styles, ever
- **State Management:** Zustand
- **HTTP Client:** Axios — base URL from `VITE_API_URL` env variable
- **Real-time:** socket.io-client
- **Forms:** react-hook-form + zod
- **Notifications:** react-hot-toast
- **Icons:** lucide-react
- **Date Formatting:** date-fns

## Folder Structure
```
src/
├── components/
│   ├── ui/                # Base reusable components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Avatar.tsx
│   │   └── Modal.tsx
│   └── shared/            # Compound components
│       ├── ChatBubble.tsx
│       └── UserCard.tsx
├── config/
│   └── env.ts             # Central env config — read all env vars here
├── pages/
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx
│   └── ChatPage.tsx
├── features/
│   ├── auth/              # Auth logic + hooks + components
│   └── chat/              # Chat logic + hooks + components
├── hooks/                 # Custom React hooks
│   ├── useAuth.ts
│   ├── useSocket.ts
│   └── useChat.ts
├── services/              # API calls and socket setup
│   ├── api.ts             # Axios instance
│   └── socket.ts          # Socket.io-client instance
├── store/                 # Zustand global stores
│   ├── authStore.ts
│   └── chatStore.ts
├── types/                 # TypeScript interfaces
│   ├── user.types.ts
│   ├── chat.types.ts
│   └── message.types.ts
├── utils/                 # Helper functions
├── router/
│   └── index.tsx          # React Router config
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
- Always use Tailwind CSS — never inline styles
- Always export component as default export
- Always handle loading state (show spinner or skeleton)
- Always handle error state (show error message)
- API calls never go directly in components — use services/

```typescript
// ✅ Correct component pattern
interface MessageBubbleProps {
  content: string
  isSent: boolean
  createdAt: Date
}

const MessageBubble = ({ content, isSent, createdAt }: MessageBubbleProps) => {
  return (
    <div className={`flex ${isSent ? 'justify-end' : 'justify-start'}`}>
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

## Zustand Store Pattern

```typescript
// authStore.ts
interface AuthStore {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  login: (user: User, token: string) => void
  logout: () => void
}

// chatStore.ts
interface ChatStore {
  chats: Chat[]
  activeChat: Chat | null
  messages: Message[]
  setActiveChat: (chat: Chat) => void
  addMessage: (message: Message) => void
}
```

## Axios Instance Pattern
```typescript
// services/api.ts
import { env } from '@/config/env'

const api = axios.create({
  baseURL: env.apiUrl,    // ✅ from env — never hardcoded
})

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})
```

## Socket Pattern
```typescript
// services/socket.ts
import { env } from '@/config/env'

const socket = io(env.socketUrl, {    // ✅ from env — never hardcoded
  auth: { token: useAuthStore.getState().token },
  autoConnect: false,
})
```

## Routing Rules
- `/login`    → public, redirect to /chat if authenticated
- `/register` → public, redirect to /chat if authenticated
- `/chat`     → protected, redirect to /login if not authenticated
