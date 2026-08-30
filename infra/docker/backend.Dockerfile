# Stage 1: Install dependencies
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY apps/frontend/package.json ./apps/frontend/package.json
COPY apps/backend/package.json ./apps/backend/package.json
RUN npm ci

# Stage 2: Build the TypeScript source
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./
COPY apps/backend ./apps/backend

# Build-time environment variables
ARG SENTRY_RELEASE
ENV SENTRY_RELEASE=$SENTRY_RELEASE

# Clean build cache
RUN rm -f apps/backend/tsconfig.tsbuildinfo
RUN rm -rf apps/backend/dist
RUN npm run build -w apps/backend

# Verify the build actually produced dist/main.js (fails fast if not)
RUN ls -la /app/apps/backend/dist/ && test -f /app/apps/backend/dist/main.js || \
    (echo "ERROR: dist/main.js not found after build!" && exit 1)

# Stage 3: Lean production image
FROM node:20-alpine AS runner
WORKDIR /app

# Copy workspace root package files (needed for npm workspaces)
COPY package.json ./
COPY apps/backend/package.json ./apps/backend/package.json

# Copy node_modules and compiled output
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/apps/backend/dist ./apps/backend/dist

# Copy SQL migrations
COPY sql ./sql

EXPOSE 4000
CMD ["npm", "run", "start", "-w", "apps/backend"]
