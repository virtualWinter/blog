# --- Base image ---
    FROM node:20-alpine AS base
    WORKDIR /app
    
    ENV NEXT_TELEMETRY_DISABLED=1
    ENV NODE_ENV=production
    
    # Install pnpm globally
    RUN npm install -g pnpm
    
    # --- Dependencies stage ---
    FROM base AS deps
    COPY package.json pnpm-lock.yaml* ./
    
    # Allow postinstall scripts (for prisma, sharp, tailwind oxide, etc.)
    RUN pnpm install --frozen-lockfile --ignore-scripts=false
    
    # --- Build stage ---
    FROM base AS builder
    COPY --from=deps /app/node_modules ./node_modules
    COPY . .
    
    RUN pnpm build
    
    # --- Production runner ---
    FROM base AS runner
    
    COPY --from=builder /app/public ./public
    COPY --from=builder /app/.next ./.next
    COPY --from=builder /app/node_modules ./node_modules
    COPY --from=builder /app/package.json ./package.json
    COPY --from=builder /app/next.config.js ./next.config.js
    
    # Prisma support (optional if used)
    COPY --from=builder /app/prisma ./prisma
    COPY --from=builder /app/.prisma ./node_modules/.prisma
    
    EXPOSE 3000
    CMD ["pnpm", "start"]
    