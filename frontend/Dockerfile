# ==============================================================================
# Stage 1: Build the React + TypeScript application with Vite
# ==============================================================================
FROM node:22-alpine AS builder

WORKDIR /app

# Cache package dependencies
COPY package*.json ./
RUN npm ci

# Copy project source and build static bundle
COPY . .
RUN npm run build

# ==============================================================================
# Stage 2: Production Nginx Server
# ==============================================================================
FROM nginx:alpine

# Clean default Nginx web root
RUN rm -rf /usr/share/nginx/html/*

# Copy built static files from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration (reverse-proxy /api -> backend + SPA fallback)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Web server port
EXPOSE 80

# Health check
HEALTHCHECK --interval=20s --timeout=5s --retries=3 --start-period=5s \
  CMD wget -qO- http://localhost:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]

