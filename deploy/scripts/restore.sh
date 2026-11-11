#!/usr/bin/env bash
set -e

# ==============================================================================
# Production Database Restore Script
# Indian Teacher Recruitment & Placement Platform
# ==============================================================================

if [ -z "$1" ]; then
    echo "Usage: $0 /path/to/itr_backup_YYYYMMDD_HHMMSS.tar.gz"
    exit 1
fi

ARCHIVE_PATH="$1"

if [ ! -f "$ARCHIVE_PATH" ]; then
    echo "❌ Error: Backup archive not found at ${ARCHIVE_PATH}"
    exit 1
fi

echo "=========================================================="
echo "⚠️  WARNING: You are about to RESTORE the database!"
echo "Target archive: ${ARCHIVE_PATH}"
echo "This will replace current collections in 'indian_teacher_recruitment'."
echo "=========================================================="

read -p "Are you sure you want to proceed? (yes/no): " CONFIRM
if [ "$CONFIRM" != "yes" ]; then
    echo "Restore cancelled."
    exit 0
fi

TEMP_EXTRACT_DIR=$(mktemp -d)

echo "Step 1: Extracting backup archive..."
tar -xzf "$ARCHIVE_PATH" -C "$TEMP_EXTRACT_DIR"

echo "Step 2: Restoring into MongoDB container with --drop..."
# Copy into container and execute mongorestore
docker compose cp "${TEMP_EXTRACT_DIR}/." mongo:/tmp/restore_dump/
docker compose exec -T mongo mongorestore --db indian_teacher_recruitment --drop /tmp/restore_dump/indian_teacher_recruitment
docker compose exec -T mongo rm -rf /tmp/restore_dump

# Clean local temp
rm -rf "$TEMP_EXTRACT_DIR"

echo "=========================================================="
echo "✓ Database restoration completed successfully!"
echo "=========================================================="
