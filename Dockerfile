# Multi-stage Dockerfile for Cora AI Assistant
# Optimized for small size and security

# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app
COPY web/package*.json ./
RUN npm ci --only=production

# Stage 2: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY web/package*.json ./
RUN npm ci
COPY web/ ./
RUN npm run build

# Stage 3: Production
FROM nginx:alpine-slim AS production

# Install necessary tools for health checks
RUN apk add --no-cache curl

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy built application
COPY --from=builder /app/dist /usr/share/nginx/html

# Create default nginx config
RUN if [ ! -f /etc/nginx/nginx.conf ]; then \
    echo 'server { \
        listen 8000; \
        server_name localhost; \
        root /usr/share/nginx/html; \
        index index.html; \
        \
        # Security headers \
        add_header X-Frame-Options "SAMEORIGIN" always; \
        add_header X-Content-Type-Options "nosniff" always; \
        add_header X-XSS-Protection "1; mode=block" always; \
        \
        # CSP for WebGPU and WASM \
        add_header Content-Security-Policy "default-src '\''self'\''; script-src '\''self'\'' '\''wasm-unsafe-eval'\''; style-src '\''self'\'' '\''unsafe-inline'\''; img-src '\''self'\'' data: blob:; connect-src '\''self'\'' https://cdn.jsdelivr.net https://huggingface.co;" always; \
        \
        # WASM MIME type \
        location ~ \.wasm$ { \
            add_header Content-Type application/wasm; \
        } \
        \
        # SPA routing \
        location / { \
            try_files $uri $uri/ /index.html; \
        } \
        \
        # Compression \
        gzip on; \
        gzip_vary on; \
        gzip_min_length 1024; \
        gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json application/wasm; \
    }' > /etc/nginx/conf.d/default.conf; \
    fi

# Set correct permissions
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/ || exit 1

# Switch to non-root user
USER nginx

# Start nginx
CMD ["nginx", "-g", "daemon off;"]