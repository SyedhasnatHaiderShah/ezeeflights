FROM node:20-alpine AS deps
WORKDIR /app
COPY apps/backend/package.json ./apps/backend/package.json
RUN cd apps/backend && npm install

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/apps/backend/node_modules ./apps/backend/node_modules
COPY apps/backend ./apps/backend
RUN cd apps/backend && npm run build

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/apps/backend/dist ./dist
COPY --from=deps /app/apps/backend/node_modules ./node_modules
EXPOSE 4000
CMD ["node", "dist/main.js"]
