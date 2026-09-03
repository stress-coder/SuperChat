# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What is this project?
Real-time chat application like WhatsApp and Telegram.
Single repository with two independent projects: backend and frontend.
No shared packages or workspaces — each app manages its own dependencies.

Each sub-project has its own `CLAUDE.md` with detailed architecture:
- `backend/CLAUDE.md` — module structure, entities, controller/service patterns, WebSocket events, env vars
- `frontend/CLAUDE.md` — folder structure, env config rules, component/form/store patterns, routing

## Implementation Status
`backend/CLAUDE.md` and `frontend/CLAUDE.md` describe the **target** architecture for each sub-project — treat them as conventions to follow when building things out, not a description of what already exists. Check actual files before assuming a module or library is present:

- **Backend**: the `auth` module is fully implemented and tested (register/login/JWT access+refresh, unit specs for controller/service/strategies/guards), backed by a `Session` entity (`entities/session.entity.ts`) for multi-device refresh-token support rather than a single token on the user row. Supporting `common/` infrastructure (guards, passport strategies, HTTP exception filter, response interceptor, cookie/sanitize-user utils) is also implemented. `chat`, `message`, `user`, and `gateway` are still scaffolded placeholders only (empty `dto/` + `.gitkeep`) and are not yet wired into `app.module.ts`. Redis, Socket.io, Helmet, `@nestjs/throttler`, and Multer/Cloudinary — all mentioned in `backend/CLAUDE.md`'s tech stack — are still not added as dependencies.
- **Frontend**: `src/` is still the default Vite/React scaffold. Tailwind, Zustand, react-router, axios, socket.io-client, react-hook-form/zod, react-hot-toast, lucide-react, and date-fns are documented conventions in `frontend/CLAUDE.md` but none are installed yet; no `src/config/env.ts` or `.env` files exist yet.

## Package Manager
Always use **pnpm** — never npm or yarn.

See each app's `package.json` scripts for backend/frontend commands (`pnpm lint`, `pnpm test`, `pnpm build`, etc.) and `.claude/commands/` for custom slash commands. Docker workflow: see the `docker-dev` skill.

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
