# Stage 1: Build/Dependency Installation
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --only=production

# Stage 2: Final Runtime Image
FROM node:20-alpine

# Install curl for healthcheck (alpine doesn't have it by default)
RUN apk add --no-cache curl

WORKDIR /app

# Copy production node_modules from builder
COPY --from=builder /app/node_modules ./node_modules
# Copy source code
COPY . .

# Create logs directory and set environment variables
RUN mkdir -p logs && chown node:node logs
ENV PORT=3000
ENV NODE_ENV=production

# Switch to non-root user for security
USER node

# Healthcheck to verify the API is responsive
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/demo || exit 1

EXPOSE 3000

CMD ["node", "server.js"]