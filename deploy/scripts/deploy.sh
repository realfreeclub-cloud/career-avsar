#!/usr/bin/env bash
set -e

# ==============================================================================
# Hostinger VPS Zero-Downtime Deployment Script
# Career Avsar - Teacher Recruitment & Placement Platform
# ==============================================================================

PROJECT_DIR="${1:-/var/www/career-avsar}"
ENV_FILE="${PROJECT_DIR}/.env"

echo "=========================================================="
echo "Starting Production Deployment: Career Avsar (careeravsar.in)"
echo "Timestamp: $(date '+%Y-%m-%d %H:%M:%S')"
echo "=========================================================="

# Check if environment file exists
if [ ! -f "$ENV_FILE" ]; then
    echo "❌ Error: Production .env file not found at ${ENV_FILE}"
    echo "Please configure .env before deploying."
    exit 1
fi

cd "$PROJECT_DIR"

echo "Step 1: Pulling latest container images and building..."
docker compose build --pull app

echo "Step 2: Starting database & infrastructure services..."
docker compose up -d mongo mongo_backup

# Wait for MongoDB healthcheck
echo "Waiting for MongoDB to be healthy..."
until [ "`docker inspect -f {{.State.Health.Status}} $(docker compose ps -q mongo)`"=="healthy" ]; do
    sleep 2;
done
echo "✓ MongoDB is healthy."

echo "Step 3: Starting application service..."
docker compose up -d --no-deps app

# Wait for Application healthcheck
echo "Waiting for Next.js Application healthcheck..."
MAX_RETRIES=20
COUNT=0
HEALTHY=false

while [ $COUNT -lt $MAX_RETRIES ]; do
    if curl -f -s http://localhost:3000/api/health > /dev/null; then
        HEALTHY=true
        break
    fi
    echo "Checking /api/health... ($((COUNT+1))/$MAX_RETRIES)"
    sleep 3
    COUNT=$((COUNT+1))
done

if [ "$HEALTHY" = false ]; then
    echo "❌ Health check failed after deployment! Inspecting logs..."
    docker compose logs --tail=50 app
    exit 1
fi
echo "✓ Next.js Application is healthy and responding."

echo "Step 4: Reloading Nginx reverse proxy..."
docker compose up -d nginx certbot
docker compose exec nginx nginx -s reload || true

echo "=========================================================="
echo "✓ Deployment completed successfully!"
echo "Service is live and serving traffic."
echo "=========================================================="
