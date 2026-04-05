FROM node:20-alpine AS deps
WORKDIR /app
COPY apps/frontend/package.json ./apps/frontend/package.json
RUN cd apps/frontend && npm install

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/apps/frontend/node_modules ./apps/frontend/node_modules
COPY apps/frontend ./apps/frontend
RUN cd apps/frontend && npm run build

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/apps/frontend/.next ./.next
COPY --from=builder /app/apps/frontend/public ./public
COPY --from=deps /app/apps/frontend/node_modules ./node_modules
COPY apps/frontend/package.json ./package.json
EXPOSE 3000
CMD ["npm", "start"]
