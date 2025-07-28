# --- Base image ---
    FROM node:20-alpine AS base
    WORKDIR /app
    ENV NEXT_TELEMETRY_DISABLED 1
    
    # --- Dependencies stage ---
    FROM base AS deps
    COPY package.json pnpm-lock.yaml* ./
    RUN corepack enable && pnpm install --frozen-lockfile
    
    # --- Build stage ---
    FROM base AS builder
    COPY --from=deps /app/node_modules ./node_modules
    COPY . .
    RUN pnpm build
    
    # --- Production stage ---
    FROM base AS runner
    
    # Only copy necessary files
    COPY --from=builder /app/public ./public
    COPY --from=builder /app/.next ./.next
    COPY --from=builder /app/node_modules ./node_modules
    COPY --from=builder /app/package.json ./package.json
    COPY --from=builder /app/next.config.js ./next.config.js
    
    EXPOSE 3000
    CMD ["pnpm", "start"]
    