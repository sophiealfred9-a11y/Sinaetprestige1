# Sina & Prestige - Production Dockerfile
# Multi-stage build for optimized image size

FROM node:18-alpine AS builder
WORKDIR /app
RUN npm install -g http-server

# Production stage
FROM nginx:alpine
LABEL maintainer="Sina & Prestige"
LABEL description="Sina & Prestige - Professional Training Organization Website"

# Copy nginx configuration
COPY docker/nginx.conf /etc/nginx/nginx.conf

# Copy frontend files
COPY frontend/ /usr/share/nginx/html/

# Create cache busting headers
RUN echo "map \$sent_http_content_type \$expires { default off; text/html epoch; text/css max; application/javascript max; image/jpeg max; image/png max; image/svg+xml max; application/font-woff max; application/font-woff2 max; } server { expires \$expires; }" > /etc/nginx/conf.d/expires.conf

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
