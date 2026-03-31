# ═══════════════════════════════════════════════════════════════════
#  Cosmic Weight Calculator — Dockerfile
#  Multi-stage: dev (hot-reload) → build (production) → serve (nginx)
# ═══════════════════════════════════════════════════════════════════

# ── Stage 1: Base with dependencies ─────────────────────────────
FROM node:22-alpine AS base
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .

# ── Stage 2: Development (hot-reload via Vite) ──────────────────
FROM base AS dev
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

# ── Stage 3: Test runner ────────────────────────────────────────
FROM base AS test
CMD ["npx", "vitest", "run"]

# ── Stage 4: Production build ───────────────────────────────────
FROM base AS build
RUN npm run build

# ── Stage 5: Production server (Nginx) ──────────────────────────
FROM nginx:1.27-alpine AS production
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget -qO- http://localhost/ || exit 1
CMD ["nginx", "-g", "daemon off;"]
