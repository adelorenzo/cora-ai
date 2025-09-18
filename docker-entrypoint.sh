#!/bin/sh
# Docker entrypoint script to configure runtime environment

# Default SearXNG URL for Docker Compose networking
SEARXNG_URL=${SEARXNG_URL:-http://searxng:8080}

# Create runtime config file with environment variables
cat > /usr/share/nginx/html/config.js << EOF
// Runtime configuration for Cora
// Generated at container startup
window.APP_CONFIG = {
  SEARXNG_URL: '${SEARXNG_URL}'
};
EOF

echo "Configured SearXNG URL: ${SEARXNG_URL}"

# Start nginx
exec nginx -g 'daemon off;'