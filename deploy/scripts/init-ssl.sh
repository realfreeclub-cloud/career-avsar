#!/usr/bin/env bash
set -e

# ==============================================================================
# Career Avsar - Let's Encrypt SSL Initializer (careeravsar.in)
# ==============================================================================

DOMAIN="${1:-careeravsar.in}"
EMAIL="${2:-support@careeravsar.in}"

echo "=========================================================="
echo "Initializing Let's Encrypt SSL for ${DOMAIN}"
echo "=========================================================="

mkdir -p ./deploy/certbot/conf/live/${DOMAIN} ./deploy/certbot/www

# Check if real certificate already exists; if not, create temporary self-signed cert
if [ ! -f "./deploy/certbot/conf/live/${DOMAIN}/fullchain.pem" ]; then
    echo "Creating temporary self-signed certificate for Nginx startup..."
    openssl req -x509 -nodes -newkey rsa:2048 -days 1 \
      -keyout "./deploy/certbot/conf/live/${DOMAIN}/privkey.pem" \
      -out "./deploy/certbot/conf/live/${DOMAIN}/fullchain.pem" \
      -subj "/CN=localhost"
fi

echo "Starting Nginx..."
docker compose up -d nginx

echo "Requesting official Let's Encrypt certificate..."
docker compose run --rm --entrypoint "\
  certbot certonly --webroot -w /var/www/certbot \
    --email ${EMAIL} \
    -d ${DOMAIN} -d www.${DOMAIN} \
    --rsa-key-size 4096 \
    --agree-tos \
    --no-eff-email \
    --force-renewal" certbot

echo "✓ Certificate issued successfully!"
echo "Reloading Nginx..."
docker compose exec nginx nginx -s reload

echo "=========================================================="
echo "SSL is active and configured for auto-renewal via Certbot."
echo "=========================================================="
