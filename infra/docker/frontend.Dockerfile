FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY apps/frontend/package.json ./apps/frontend/package.json
COPY apps/backend/package.json ./apps/backend/package.json
RUN npm ci

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps ./apps
COPY . .

# Build-time environment variables for Next.js
ARG NEXT_PUBLIC_API_BASE_URL
ARG NEXT_PUBLIC_MAP_PROVIDER
ARG NEXT_PUBLIC_AFFIRM_PUBLIC_KEY
ARG NEXT_PUBLIC_AFFIRM_SCRIPT_URL
ARG NEXT_PUBLIC_AFFIRM_PUBLIC_KEY_US
ARG NEXT_PUBLIC_AFFIRM_SCRIPT_URL_US
ARG NEXT_PUBLIC_AFFIRM_PUBLIC_KEY_CA
ARG NEXT_PUBLIC_AFFIRM_SCRIPT_URL_CA

ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL
ENV NEXT_PUBLIC_MAP_PROVIDER=$NEXT_PUBLIC_MAP_PROVIDER
ENV NEXT_PUBLIC_AFFIRM_PUBLIC_KEY=$NEXT_PUBLIC_AFFIRM_PUBLIC_KEY
ENV NEXT_PUBLIC_AFFIRM_SCRIPT_URL=$NEXT_PUBLIC_AFFIRM_SCRIPT_URL
ENV NEXT_PUBLIC_AFFIRM_PUBLIC_KEY_US=$NEXT_PUBLIC_AFFIRM_PUBLIC_KEY_US
ENV NEXT_PUBLIC_AFFIRM_SCRIPT_URL_US=$NEXT_PUBLIC_AFFIRM_SCRIPT_URL_US
ENV NEXT_PUBLIC_AFFIRM_PUBLIC_KEY_CA=$NEXT_PUBLIC_AFFIRM_PUBLIC_KEY_CA
ENV NEXT_PUBLIC_AFFIRM_SCRIPT_URL_CA=$NEXT_PUBLIC_AFFIRM_SCRIPT_URL_CA

RUN npm run build -w apps/frontend

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/apps/frontend/.next ./apps/frontend/.next
COPY --from=builder /app/apps/frontend/public ./apps/frontend/public
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps ./apps
COPY package.json ./
COPY apps/frontend/package.json ./apps/frontend/package.json
EXPOSE 3000
CMD ["npm", "run", "start", "-w", "apps/frontend"]
