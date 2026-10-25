# Multi-stage production build for Olympido NestJS Backend

# Stage 1: Build & Prisma generation
FROM node:20-alpine AS builder

WORKDIR /app

# Install system utilities needed for building node-gyp native addons if any
RUN apk add --no-cache libc6-compat python3 make g++

COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies (including devDependencies for TypeScript compilation)
RUN npm ci

COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Compile TypeScript to dist/
RUN npm run build

# Prune devDependencies to keep image lean
RUN npm prune --production

# Stage 2: Minimal Production Runtime
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4000

# Install openssl for Prisma runtime
RUN apk add --no-cache openssl

# Create uploads directory and non-root application user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001 && \
    mkdir -p /app/uploads && \
    chown -R nestjs:nodejs /app

COPY --from=builder --chown=nestjs:nodejs /app/package*.json ./
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/prisma ./prisma

USER nestjs

EXPOSE 4000

VOLUME ["/app/uploads"]

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]
