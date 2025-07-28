# --- Base image ---
    FROM node:20-alpine AS base
    WORKDIR /app
    
    # Disable telemetry for smaller image and less noise
    ENV NEXT_TELEMETRY_DISABLED=1
    
    # Install pnpm globally
    RUN npm install -g pnpm
    
    # --- Dependencies stage ---
    FROM base AS deps
    COPY package.json pnpm-lock.yaml* ./
    
    # Install dependencies non-interactively
    RUN pnpm install --frozen-lockfile
    
    # Approve build scripts for packages like Prisma, Tailwind, etc.
    RUN pnpm dlx pnpm-approve-builds auto-approve
    
    # --- Build stage ---
    FROM base AS builder
    COPY --from=deps /app/node_modules ./node_modules
    COPY . .
    
    # Build the Next.js app
    RUN pnpm build
    
    # --- Production runner ---
    FROM base AS runner
    
    # Set NODE_ENV to production
    ENV NODE_ENV=production
    
    # Only copy what's needed
    COPY --from=builder /app/public ./public
    COPY --from=builder /app/.next ./.next
    COPY --from=builder /app/node_modules ./node_modules
    COPY --from=builder /app/package.json ./package.json
    COPY --from=builder /app/next.config.js ./next.config.js
    
    # If using Prisma with "output: 'standalone'", include generated client
    COPY --from=builder /app/prisma ./prisma
    COPY --from=builder /app/.prisma ./node_modules/.prisma
    
    # Expose Next.js default port
    EXPOSE 3000
    
    # Start the app
    CMD ["pnpm", "start"]
    