# CAREER AVSAR – Ubuntu VPS Production Deployment Guide (PM2 + Nginx + MongoDB Atlas)

> **Deployment Architecture**: Direct Node.js / Next.js 14 + PM2 Process Manager + MongoDB Atlas + Existing Nginx Reverse Proxy + Let's Encrypt SSL.  
> **Strict Rule**: **NO Docker / NO Containers**. Existing PM2 applications, ports, and websites on the VPS must remain untouched.  
> **Target Process**: `career-avsar`  
> **Target Port**: `3003` (bound to `127.0.0.1`)  
> **Target Domain**: `careeravsar.in` & `www.careeravsar.in`  
> **Server Directory**: `/var/www/career-avsar`

---

## ⚠️ Critical VPS Safety Rules
The VPS hosts existing websites and PM2 processes. Adhere to these strict rules:
1. **NEVER run global PM2 commands**:
   - ❌ `pm2 restart all`
   - ❌ `pm2 delete all`
   - ❌ `pm2 kill`
   - ❌ `pm2 stop all`
2. **ALWAYS specify the process name**:
   - ✅ `pm2 restart career-avsar`
   - ✅ `pm2 reload career-avsar`
   - ✅ `pm2 logs career-avsar`
3. **NEVER modify global `/etc/nginx/nginx.conf`** or edit other domain configs in `/etc/nginx/sites-available/`.
4. **ALWAYS verify Nginx before reloading**:
   - ✅ `sudo nginx -t` (must output `test is successful`) before `sudo systemctl reload nginx`.

---

## 1. Prerequisites Check on Ubuntu VPS

Ensure Node.js (v20 LTS recommended), PM2, and Nginx are installed on your VPS:

```bash
# Check Node.js version (v18.17+ or v20 LTS required)
node -v

# Check PM2
pm2 -v

# Check Nginx
nginx -v

# Check that port 3003 is free
sudo ss -tulpn | grep :3003
```
*(If port 3003 returns no output, it is completely free to use).*

---

## 2. Clone the Repository to `/var/www/career-avsar`

```bash
# 1. Create directory and set permissions
sudo mkdir -p /var/www/career-avsar
sudo chown -R $USER:$USER /var/www/career-avsar

# 2. Clone repository from GitHub
git clone https://github.com/realfreeclub-cloud/career-avsar.git /var/www/career-avsar

# 3. Enter project directory
cd /var/www/career-avsar

# 4. Create persistent local uploads directory
mkdir -p uploads logs
```

---

## 3. Install Dependencies & Configure Environment

### A. Clean Install Production Dependencies
```bash
cd /var/www/career-avsar
npm ci
```

### B. Configure Production `.env`
Create your production `.env` file from the template:

```bash
cp .env.example .env
nano .env
```

Configure your actual MongoDB Atlas connection string and secrets:
```env
# ==============================================================================
# Career Avsar - Production Environment Configuration
# ==============================================================================
NODE_ENV=production
APP_NAME="Career Avsar"
APP_URL=https://careeravsar.in
NEXT_PUBLIC_APP_URL=https://careeravsar.in
PORT=3003
HOSTNAME=127.0.0.1

# MongoDB Atlas URI (Use your Atlas database credentials)
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/career_avsar?retryWrites=true&w=majority
MONGODB_DB_NAME=career_avsar

# Secret Key (32+ random characters)
AUTH_SECRET=9f83bf4e8c10a3d42b91950e1823908f7b5394e1d23485ac60e71928374a5b6c
AUTH_TRUST_HOST=true
SESSION_MAX_AGE_SECONDS=604800

# File Storage
FILE_STORAGE_PROVIDER=local
FILE_STORAGE_LOCAL_DIR=./uploads

# Performance & Telemetry
LOG_LEVEL=info
NEXT_TELEMETRY_DISABLED=1
```
*(Press `Ctrl + O` then `Enter` to save, and `Ctrl + X` to exit).*

---

## 4. Production Build & Atlas Database Initialization

```bash
cd /var/www/career-avsar

# 1. Compile Next.js 14 Production Build
npm run build

# 2. Seed Initial 6 UP Districts & Career Avsar Brand in MongoDB Atlas
node scripts/migrate-to-career-avsar.js
```

---

## 5. PM2 Process Startup

The project includes an optimized [`ecosystem.config.js`](./ecosystem.config.js) configured specifically for a 1 CPU Core / 3.8 GB RAM VPS:

```bash
cd /var/www/career-avsar

# Start application under PM2 in fork mode
pm2 start ecosystem.config.js

# Save PM2 process list so it survives VPS reboots
pm2 save

# Verify the process is running on port 3003
pm2 status career-avsar

# Test local response on 127.0.0.1:3003
curl -I http://127.0.0.1:3003/api/health
```
*(You should see `HTTP/1.1 200 OK`).*

---

## 6. Nginx Virtual Host Configuration

We isolate Career Avsar's configuration so existing websites remain completely undisturbed.

### Step 1: Copy Initial HTTP Config
```bash
sudo cp /var/www/career-avsar/deploy/nginx/careeravsar.in.initial-http.conf /etc/nginx/sites-available/careeravsar.in

# Enable site via symlink
sudo ln -sf /etc/nginx/sites-available/careeravsar.in /etc/nginx/sites-enabled/

# Test Nginx syntax (CRITICAL: Must report successful)
sudo nginx -t

# Reload Nginx (safe, zero interruption to existing sites)
sudo systemctl reload nginx
```

### Step 2: Issue Let's Encrypt SSL Certificate
```bash
# Obtain SSL certificate for careeravsar.in and www.careeravsar.in
sudo certbot --nginx -d careeravsar.in -d www.careeravsar.in
```
Certbot will verify your DNS and automatically configure SSL certificates and HTTP→HTTPS redirection.

### Step 3: Install Full Production Hardened Nginx Config
Once the SSL certificates exist at `/etc/letsencrypt/live/careeravsar.in/`, activate the hardened configuration with caching, rate limits, and security headers:

```bash
sudo cp /var/www/career-avsar/deploy/nginx/careeravsar.in.conf /etc/nginx/sites-available/careeravsar.in

# Verify syntax
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

---

## 7. How to Update Application in the Future

When you push new commits to GitHub (`https://github.com/realfreeclub-cloud/career-avsar.git`), update the VPS with zero downtime:

```bash
cd /var/www/career-avsar

# 1. Pull latest code from GitHub
git pull origin main

# 2. Install any new dependencies
npm ci

# 3. Build production bundle
npm run build

# 4. Zero-downtime PM2 reload (targets ONLY career-avsar)
pm2 reload career-avsar

# 5. Check logs to confirm clean startup
pm2 logs career-avsar --lines 25 --nostream
```

---

## 8. Rollback Procedure

If a deployed update ever encounters an issue:

```bash
cd /var/www/career-avsar

# 1. Roll back to the previous commit
git log --oneline -n 5
git reset --hard HEAD~1

# 2. Re-install and rebuild
npm ci
npm run build

# 3. Reload PM2
pm2 reload career-avsar
```

---

## 9. Troubleshooting & Diagnostics

| Symptom | Diagnosis Command | Solution |
| :--- | :--- | :--- |
| **502 Bad Gateway** | `pm2 status career-avsar` | If stopped, check `pm2 logs career-avsar --err` and restart with `pm2 restart career-avsar`. |
| **MongoDB Atlas Connection Error** | `node -e "require('./src/lib/db/mongoose').connectToDatabase()"` | In Atlas Dashboard: ensure VPS public IP is whitelisted under **Network Access** (or `0.0.0.0/0` with strong password). |
| **Port Conflict** | `sudo ss -tulpn \| grep :3003` | Confirm only `node` (career-avsar) is bound to `127.0.0.1:3003`. |
| **Nginx Config Error** | `sudo nginx -t` | Inspect line number reported in error and check `/var/log/nginx/error.log`. |
| **High Memory Usage** | `pm2 monit` | `ecosystem.config.js` automatically restarts process if RAM exceeds 700 MB. |
| **View Live Logs** | `pm2 logs career-avsar` | View combined access and error stream in real-time. |
