# Chat Application — Claude Code Context

## What is this project?
Real-time chat application like WhatsApp and Telegram.
Single repository with two independent projects: backend and frontend.
No shared packages or workspaces — each app manages its own dependencies.

## Repository Structure
```
chat-application/
├── backend/           # NestJS + TypeScript + TypeORM + MySQL + Redis
├── frontend/          # React + Vite + TypeScript + Tailwind + Zustand
├── docker-compose.yml # Run everything locally with one command
├── .gitignore
├── .env.example
├── RULES.md
├── CONTEXT.md
├── AGENT.md
└── CLAUDE.md
```

## Running the Project

```bash
# Backend only
cd backend && pnpm start:dev       # http://localhost:3000

# Frontend only
cd frontend && pnpm dev            # http://localhost:5173

# Everything via Docker
docker-compose up                  # from root
```

## Package Manager
Always use **pnpm** — never npm or yarn.

## Plan Mode — Mandatory Workflow (CRITICAL)

When operating in plan mode, always follow this exact workflow.
Never skip any step. Never start coding before approval.

### Step 1 — Always Create a Plan First
Before writing a single line of code, always present a detailed
plan in this exact format:

```
📋 PLAN

🎯 Goal:
[What we are building or fixing — one clear sentence]

📁 Files to Create:
- path/to/file.ts — reason why this file is needed

📝 Files to Modify:
- path/to/file.ts — what will change and why

🔢 Steps:
1. [First thing to do]
2. [Second thing to do]
3. [Continue until all steps are listed]

⚠️ Risks or Considerations:
- [Anything that could go wrong or needs attention]

❓ Awaiting your approval to begin coding.
```

### Step 2 — Stop and Wait for Approval
After presenting the plan, stop completely.
- Do NOT write any code
- Do NOT create any files
- Do NOT run any commands
- Wait for the user to explicitly approve

Approval words to look for:
"yes", "approved", "go ahead", "looks good", "ok", "proceed", "start"

### Step 3 — Code Only After Approval
Only begin writing code after receiving explicit approval.
Follow the approved plan exactly — do not deviate from it.

### Step 4 — Handle Plan Change Requests
If the user requests changes to the plan before approving,
first understand the size and scope of the change, then respond accordingly.

**Small improvement** — user tweaks one or two things (e.g. rename a file,
add one step, adjust a description):
- Keep the entire existing plan
- Only update the specific parts that changed
- Clearly mark what was updated with (updated) next to the change
- Present the full updated plan and wait for approval

**Big improvement** — user changes a significant portion of the plan
(e.g. different approach, new files added, steps reordered):
- Keep the parts of the plan that were not affected
- Rework only the sections that changed
- Present the full updated plan and wait for approval

**Full change** — user wants to go in a completely different direction:
- Discard the previous plan entirely
- Build a brand new plan from scratch based on the new direction
- Present the new plan in the Step 1 format and wait for approval

**In all cases:**
- Always present the full updated plan — never just the changed parts
- Always wait for approval again before writing any code
- Never assume the change is approved — always wait for explicit confirmation

### What Is Never Allowed in Plan Mode
- Writing code before the plan is approved
- Skipping the plan and going straight to coding
- Partially coding while waiting for approval
- Assuming approval — always wait for an explicit confirmation
- Asking "should I proceed?" and then proceeding without a clear yes

---

## Non-Negotiable Rules (always follow)
- TypeScript strict mode — never use `any` type
- No `console.log` left in production code
- Always handle errors — no unhandled promise rejections
- Never commit `.env` files — only `.env.example`
- Never hardcode secrets, API keys, URLs, or ports — always use env variables
- Commits must follow Conventional Commits: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`
- Branch naming: `feature/*`, `bugfix/*`, `hotfix/*`

## API Response Format (backend — always)
```typescript
{
  statusCode: number,
  message: string,
  data: T
}
```

## Error Response Format (backend — always)
```typescript
{
  statusCode: number,
  message: string,
  error: string
}
```
