# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SuperChat is a monorepo with two separate workspaces:

- **`backend/`** — NestJS 11 REST API with TypeORM + MySQL, JWT authentication via `@nestjs/passport` + `passport-jwt`
- **`frontend/`** — React 19 + Vite 8 SPA with TypeScript 6, using the React Compiler (Babel plugin)

## Package Manager

Both workspaces use **pnpm**. Run all commands from within each workspace directory (`cd backend` or `cd frontend`).

## Commands

### Backend (`cd backend`)

```bash
pnpm start:dev        # dev server with watch mode (port 3000)
pnpm build            # compile TypeScript via nest build
pnpm start:prod       # run compiled output
pnpm test             # unit tests (Jest, matches *.spec.ts in src/)
pnpm test:watch       # watch mode
pnpm test:cov         # with coverage
pnpm test:e2e         # e2e tests via test/jest-e2e.json
pnpm lint             # ESLint + auto-fix
pnpm format           # Prettier format src/ and test/
```

Run a single test file:
```bash
pnpm test -- --testPathPattern=app.controller
```

### Frontend (`cd frontend`)

```bash
pnpm dev              # Vite dev server (HMR)
pnpm build            # tsc -b && vite build
pnpm preview          # preview production build
pnpm lint             # ESLint
```

## Architecture

### Backend

NestJS follows a module/controller/service pattern. Each feature should be its own NestJS module (`@Module`) registered in `AppModule`. The current stack:

- **Database**: TypeORM with MySQL (`mysql2` driver) — entities go in feature modules, use `TypeOrmModule.forFeature([Entity])` pattern
- **Auth**: JWT-based via `@nestjs/jwt` + `@nestjs/passport` + `passport-jwt` — guards will live in an `auth` module
- **Entry point**: `src/main.ts` listens on `PORT` env var, defaulting to `3000`

### Frontend

- React 19 with the **React Compiler** enabled (automatic memoization via `babel-plugin-react-compiler`) — avoid manual `useMemo`/`useCallback` unless profiling shows a need
- Vite 8 with `@rolldown/plugin-babel` for Babel transforms
- TypeScript strict mode

## Backend Code Style

Prettier is enforced (`pnpm format` / `pnpm lint`). Config in `.prettierrc`: single quotes, trailing commas everywhere.

## Key Constraints

- The backend `AppModule` currently has no TypeORM or auth wiring — these dependencies are installed but not yet configured in `src/app.module.ts`
- MySQL connection config and JWT secrets must come from environment variables (not hardcoded)
