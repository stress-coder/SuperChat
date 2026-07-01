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

# ── Development (Vite HMR) ─────────────────────────────────────────────────────
FROM base AS development
COPY --from=deps /app/node_modules ./node_modules
COPY package.json pnpm-lock.yaml index.html vite.config.* tsconfig*.json ./
CMD ["pnpm", "dev", "--host", "0.0.0.0"]

# ── Build ──────────────────────────────────────────────────────────────────────
FROM base AS build
ARG VITE_API_URL
ARG VITE_SOCKET_URL
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build

# ── Production (nginx serves built bundle) ─────────────────────────────────────
FROM nginx:alpine AS production
COPY --from=build /app/dist /usr/share/nginx/html
COPY .docker/nginx.conf /etc/nginx/nginx.conf
EXPOSE 80 443
