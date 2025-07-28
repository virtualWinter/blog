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

# Copy all project files
COPY . .

# Generate Prisma client (custom output to src/generated)
RUN pnpm db:generate

# Build Next.js app
RUN pnpm build

# --- Production runner ---
FROM base AS runner

# Copy entire app from builder (not just build output)
COPY --from=builder /app ./

EXPOSE 3000
CMD ["pnpm", "start"]

    
