# SuperChat

A real-time chat application with a NestJS backend and React frontend.

## Prerequisites

- [Node.js](https://nodejs.org/)
- [pnpm](https://pnpm.io/)
- MySQL

## Setup

Copy `.env.example` to `backend/.env` and fill in the required values:

```bash
cp .env.example backend/.env
```

## Running the apps

**Backend** (http://localhost:3000):

```bash
cd backend
pnpm install
pnpm start:dev
```

**Frontend** (http://localhost:5173):

```bash
cd frontend
pnpm install
pnpm dev
```

Each app runs independently — start them in separate terminal sessions.
