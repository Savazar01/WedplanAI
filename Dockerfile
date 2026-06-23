FROM node:22-bookworm-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci && npm cache clean --force

FROM node:22-bookworm-slim AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:22-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/src/db/migrations ./src/db/migrations
COPY --from=builder /app/src/db/migrate-prod.js ./src/db/migrate-prod.js

EXPOSE 3044

CMD ["sh", "-c", "node src/db/migrate-prod.js && node server.js"]

