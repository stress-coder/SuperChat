# syntax=docker/dockerfile:1

ARG NODE_VERSION=22

# ── Base ───────────────────────────────────────────────────────────────────────
FROM node:${NODE_VERSION}-alpine AS base
RUN npm install -g pnpm@10.33.0
WORKDIR /app

# ── Dependencies ───────────────────────────────────────────────────────────────
FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install

# ── Development (hot reload) ───────────────────────────────────────────────────
FROM base AS development
COPY --from=deps /app/node_modules ./node_modules
COPY package.json pnpm-lock.yaml nest-cli.json tsconfig*.json ./
CMD ["pnpm", "start:dev"]

# ── Build ──────────────────────────────────────────────────────────────────────
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build

# ── Production ─────────────────────────────────────────────────────────────────
FROM node:${NODE_VERSION}-alpine AS production
RUN npm install -g pnpm@10.33.0
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --prod
COPY --from=build /app/dist ./dist
EXPOSE 3000
CMD ["node", "dist/main"]
