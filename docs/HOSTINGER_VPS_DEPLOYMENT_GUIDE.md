# Hostinger VPS Production Deployment Guide
**Indian Teacher Recruitment & Placement Platform**

This guide provides step-by-step instructions for deploying and maintaining the application on a **Hostinger VPS** running **Ubuntu 22.04 LTS or Ubuntu 24.04 LTS**.

---

## 1. System Requirements

- **Operating System**: Ubuntu 22.04 / 24.04 LTS (64-bit)
- **CPU**: 2 vCPU or higher (Hostinger KVM 2 / KVM 4 recommended)
- **Memory**: Minimum 4 GB RAM (8 GB recommended for concurrent traffic)
- **Storage**: Minimum 40 GB NVMe SSD
- **Network**: Static IPv4 with DNS pointing to your target domain (e.g., `recruitment.gov.in` / `teachers.yourdomain.com`)

---

## 2. Server Provisioning & Initial Hardening

Connect to your VPS via SSH:
```bash
ssh root@YOUR_SERVER_IP
```

### A. Update & Upgrade System Packages
```bash
apt-get update && apt-get upgrade -y
apt-get install -y curl wget git ufw htop net-tools ca-certificates gnupg lsb-release
```

### B. Configure Firewall (UFW)
Allow SSH, HTTP, and HTTPS traffic only:
```bash
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
ufw status verbose
```

---

## 3. Docker & Docker Compose Installation

Install official Docker Engine and Docker Compose v2:
```bash
# Add Docker official GPG key
mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Add Docker repository
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker packages
apt-get update
apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Verify installation
docker --version
docker compose version
systemctl enable docker
systemctl start docker
```

---

## 4. Repository Setup & Environment Configuration

Clone the repository to the production directory:
```bash
mkdir -p /var/www
cd /var/www
git clone https://github.com/your-org/indian-teacher-recruitment.git
cd /var/www/indian-teacher-recruitment
```

Create production `.env` file:
```bash
cp .env.example .env
nano .env
```

Ensure the following production values are configured:
```ini
# Application Configuration
NODE_ENV=production
PORT=3000
APP_NAME="Indian Teacher Recruitment Platform"
NEXT_PUBLIC_APP_URL="https://your-domain.com"

# MongoDB Database (Internal Docker network)
MONGODB_URI=mongodb://mongo:27017/indian_teacher_recruitment

# Security Secrets (Generate 64-char random hex: `openssl rand -hex 32`)
SESSION_SECRET=YOUR_64_CHARACTER_RANDOM_SESSION_SECRET
PASSWORD_PEPPER=YOUR_64_CHARACTER_RANDOM_PEPPER_SECRET

# Multi-Channel Gateway Credentials
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=YOUR_SENDGRID_OR_HOSTINGER_SMTP_KEY
SMTP_FROM="Indian Teacher Recruitment <noreply@your-domain.com>"

SMS_DLT_ENTITY_ID=1101234567890123456
SMS_DLT_SENDER_ID=ITRREC
SMS_GATEWAY_API_KEY=YOUR_DLT_SMS_API_KEY

WHATSAPP_PHONE_NUMBER_ID=YOUR_WABA_PHONE_ID
WHATSAPP_ACCESS_TOKEN=YOUR_META_BUSINESS_WABA_TOKEN
```

---

## 5. SSL Certificate Issuance (Let's Encrypt)

Run the bundled initialization script to issue a free SSL certificate:
```bash
chmod +x deploy/scripts/*.sh
./deploy/scripts/init-ssl.sh your-domain.com admin-email@your-domain.com
```

Certbot will generate certificates into `./deploy/certbot/conf` and configure automated 12-hour renewal sidecar in Docker Compose.

---

## 6. Launching Application Services

Execute the production deployment script:
```bash
./deploy/scripts/deploy.sh
```

Verify running containers:
```bash
docker compose ps
```
You should see 5 healthy containers running:
1. `app` (Next.js standalone on port 3000)
2. `mongo` (MongoDB 7.0 database)
3. `mongo_backup` (Automated 24h cron backup sidecar)
4. `nginx` (Reverse proxy on ports 80 & 443)
5. `certbot` (Automated SSL renewal)

Verify health status:
```bash
curl -i https://your-domain.com/api/health
```

---

## 7. Automated Backups & System Maintenance

### Daily Backups
The `mongo_backup` container automatically performs a full database dump every 24 hours into the persistent volume `mongo_backup_data` and automatically deletes dumps older than 30 days.

### Manual Backup
To create an instant snapshot:
```bash
./deploy/scripts/backup.sh
```
Backups are archived in `/var/backups/itr_platform/`.

### Restoration
To restore the platform to a previous snapshot:
```bash
./deploy/scripts/restore.sh /var/backups/itr_platform/itr_backup_YYYYMMDD_HHMMSS.tar.gz
```

---

## 8. Zero-Downtime Application Updates

Whenever updates are pushed to the codebase, deploy seamlessly with:
```bash
cd /var/www/indian-teacher-recruitment
git pull origin main
./deploy/scripts/deploy.sh
```
