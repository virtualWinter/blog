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
    
    # Allow postinstall scripts (important for Prisma)
    RUN pnpm install --frozen-lockfile --ignore-scripts=false
    
    # --- Build stage ---
    FROM base AS builder
    
    # Copy dependencies
    COPY --from=deps /app/node_modules ./node_modules
    
    # Copy everything else
    COPY . .
    
    # Generate Prisma client (custom output to src/generated)
    RUN pnpm db:generate
    
    # Build Next.js app
    RUN pnpm build
    
    # --- Production runner ---
    FROM base AS runner
    
    # Copy only necessary files
    COPY --from=builder /app/public ./public
    COPY --from=builder /app/.next ./.next
    COPY --from=builder /app/node_modules ./node_modules
    COPY --from=builder /app/package.json ./package.json
    COPY --from=builder /app/next.config.js ./next.config.js
    
    # Copy generated Prisma client
    COPY --from=builder /app/src/generated ./src/generated
    
    EXPOSE 3000
    CMD ["pnpm", "start"]
    