# Multi-stage build for optimized production image

# Development stage
FROM nginx:alpine as development

# Install basic tools for development
RUN apk add --no-cache bash

# Copy application files
WORKDIR /usr/share/nginx/html
COPY index.html .
COPY css/ ./css/
COPY js/ ./js/

# Production stage
FROM nginx:alpine as production

# Copy only necessary files
WORKDIR /usr/share/nginx/html
COPY --from=development /usr/share/nginx/html/ .

# Add custom nginx config for SPA
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]

