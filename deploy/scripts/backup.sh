#!/usr/bin/env bash
set -e

# ==============================================================================
# Production Database & Document Backup Script
# Indian Teacher Recruitment & Placement Platform
# ==============================================================================

BACKUP_DIR="/var/backups/itr_platform"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
DUMP_DEST="${BACKUP_DIR}/dump_${TIMESTAMP}"
ARCHIVE_NAME="itr_backup_${TIMESTAMP}.tar.gz"

mkdir -p "$BACKUP_DIR"

echo "=========================================================="
echo "Starting Database & Document Backup: ${TIMESTAMP}"
echo "=========================================================="

# 1. Dump MongoDB through Docker container
echo "Dumping MongoDB collections..."
docker compose exec -T mongo mongodump --db indian_teacher_recruitment --out /backup/temp_dump

# 2. Archive MongoDB dump and uploaded files
echo "Creating compressed tarball archive..."
tar -czf "${BACKUP_DIR}/${ARCHIVE_NAME}" \
    -C /var/lib/docker/volumes/indian-teacher-recruitment_mongo_backup_data/_data/temp_dump .

# Cleanup temporary dump directory inside volume
docker compose exec -T mongo rm -rf /backup/temp_dump

# 3. Prune backups older than 30 days
echo "Pruning backups older than 30 days..."
find "$BACKUP_DIR" -name "itr_backup_*.tar.gz" -type f -mtime +30 -exec rm -f {} \;

ARCHIVE_SIZE=$(du -sh "${BACKUP_DIR}/${ARCHIVE_NAME}" | awk '{print $1}')
echo "✓ Backup created successfully: ${BACKUP_DIR}/${ARCHIVE_NAME} (${ARCHIVE_SIZE})"
echo "=========================================================="
