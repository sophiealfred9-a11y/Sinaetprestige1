# OVH Cloud Deployment Setup Guide

## 📋 Overview
This guide will help you set up Continuous Integration/Continuous Deployment (CI/CD) for automatic deployment to OVH Cloud Europe FR using GitHub Actions and Docker Compose.

---

## 🔧 What You Need to Collect FROM Your CLIENT

### 1. **OVH Account Access** 
**Where to get it:**
- OVH Control Panel: https://www.ovh.com/auth/
- Navigate to: Cloud → Public Cloud → Instances (or Compute)

**Information to collect:**
- [ ] OVH Project ID (visible in control panel)
- [ ] OVH Project Name
- [ ] Region used (GRA, BHS, SBG, etc.) - check in Instances tab

---

### 2. **OVH Instance/VM Details**
**Where to get it:**
- OVH Control Panel → Cloud → Instances

**Information to collect:**
- [ ] **Instance IP Address** (Public IPv4) - e.g., `195.154.XX.XX`
- [ ] **Instance Name** - e.g., `sina-prestige-prod`
- [ ] **Operating System** - (Ubuntu 20.04 LTS / 22.04 LTS recommended)
- [ ] **Instance RAM** - e.g., 4GB, 8GB
- [ ] **Storage Size** - e.g., 50GB, 100GB
- [ ] **Current SSH Key** - if already configured

---

### 3. **SSH Access Credentials**
**Where to get it:**
- OVH Control Panel → Cloud → Instances → [Instance Name] → Console

**Information to collect:**
- [ ] **SSH Username** - (usually `ubuntu` or `root`, check your instance)
- [ ] **SSH Key Pair** - Download the private key (`.pem` file)
  - If you don't have one: OVH Control Panel → SSH Keys → Create New Key
- [ ] Test connection: `ssh -i your-key.pem ubuntu@195.154.XX.XX`

---

### 4. **Domain & SSL Certificate**
**Where to get it:**
- Your domain registrar (Gandi, OVH, Namecheap, etc.)
- OVH Control Panel → Domains (if using OVH DNS)

**Information to collect:**
- [ ] **Domain Name** - e.g., `sinaetprestige.fr`
- [ ] **DNS Provider** - (OVH, Cloudflare, other)
- [ ] **Current A Record IP** - Should point to your OVH instance
- [ ] **SSL Certificate Type** - (Let's Encrypt free / Paid)
  - *Caddy handles Let's Encrypt automatically*

---

### 5. **Email/SMTP Configuration**
**Where to get it:**
- Gmail: https://myaccount.google.com/apppasswords
- Or your email provider

**Information to collect:**
- [ ] **SMTP Server** - e.g., `smtp.gmail.com`
- [ ] **SMTP Port** - e.g., `587`
- [ ] **SMTP Username** - e.g., `contact@sinaetprestige.fr`
- [ ] **SMTP Password / App Password** - (for Gmail, use app password, not regular password)

---

### 6. **Docker Registry Access** *(Optional - if using private registry)*
**Where to get it:**
- Docker Hub: https://hub.docker.com/
- OVH Harbor Registry (if available)

**Information to collect:**
- [ ] **Docker Registry URL** - e.g., `docker.io` or `your-registry.ovh.net`
- [ ] **Docker Username** 
- [ ] **Docker Password / Access Token**

---

## 🚀 Step-by-Step OVH Setup

### Step 1: Prepare Your OVH Instance

```bash
# Connect to your OVH instance
ssh -i your-key.pem ubuntu@195.154.XX.XX

# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo apt install docker-compose-plugin -y

# Add current user to docker group
sudo usermod -aG docker $USER
newgrp docker

# Verify installation
docker --version
docker compose version
```

### Step 2: Set Up Application Directory

```bash
# Create app directory
sudo mkdir -p /opt/sina-prestige
sudo chown $USER:$USER /opt/sina-prestige
cd /opt/sina-prestige

# Clone repository
git clone https://github.com/YOUR_USERNAME/sina-prestige.git .

# Create .env file with SMTP credentials
cat > .env << 'EOF'
ADMIN_EMAIL=contact@sinaetprestige.fr
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
FLASK_ENV=production
DATABASE_URL=sqlite:////data/submissions.db
TZ=Europe/Paris
EOF

# Edit if needed
nano .env
```

**⚠️ Important:** The `.env` file stays on the OVH server and is NOT in GitHub. GitHub Actions only deploys code via SSH.

### Step 3: Secure the .env File

```bash
cd /opt/sina-prestige

# Make .env readable only by owner
chmod 600 .env

# Add .env to .gitignore (never commit credentials)
echo ".env" >> .gitignore
git add .gitignore
git commit -m "Add .env to gitignore"
git push origin main
```

### Step 4: Initial Deployment

```bash
cd /opt/sina-prestige

# Start containers (reads from .env automatically)
docker compose -f docker/docker-compose.yml up -d

# Check logs
docker compose -f docker/docker-compose.yml logs -f

# Verify it's running
curl http://localhost:8080/health
```

### Step 4: Configure Firewall

```bash
# Allow HTTP and HTTPS
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS
sudo ufw enable
```

### Step 5: Set Up DNS

**In your DNS provider (OVH, Cloudflare, etc.):**

```
A Record:
  Name: sinaetprestige.fr (or @)
  Value: 195.154.XX.XX  (your OVH instance IP)
  TTL: 300

www.sinaetprestige.fr (optional):
  Name: www
  Type: CNAME
  Value: sinaetprestige.fr
  TTL: 300
```

---

## 🔐 GitHub Secrets Setup

**Add these secrets to your GitHub repository:**

Settings → Secrets and variables → Actions → New repository secret

| Secret Name | Value | Example |
|---|---|---|
| `DOCKER_USERNAME` | Your Docker Hub username | `yourusername` |
| `DOCKER_PASSWORD` | Docker access token or password | From Docker Hub |
| `OVH_SERVER_IP` | Your OVH instance public IP | `195.154.XX.XX` |
| `OVH_SSH_USER` | SSH username on OVH instance | `ubuntu` |
| `OVH_SSH_KEY` | Full private SSH key content | (Entire `.pem` file) |
| `OVH_APP_PATH` | Path to app on server | `/opt/sina-prestige` |
| `SMTP_USER` | Email for sending messages | `contact@sinaetprestige.fr` |
| `SMTP_PASSWORD` | Email app password | (Gmail app password) |

### How to Add SSH Key as Secret:

```bash
# Read your private key
cat ~/.ssh/deploy_key.pem

# Copy entire output and paste into GitHub secret: OVH_SSH_KEY
# Make sure to include the BEGIN and END lines
```

---

## ✅ Verification Checklist

**Before first deployment, verify:**

- [ ] OVH instance is running and accessible
- [ ] SSH access works: `ssh -i key.pem ubuntu@IP`
- [ ] Docker is installed on instance
- [ ] Domain DNS points to OVH instance IP
- [ ] GitHub secrets are all configured
- [ ] SMTP credentials are correct (tested locally)
- [ ] Docker registry credentials work

---

## 📊 Monitoring & Maintenance

### View Live Logs
```bash
ssh -i key.pem ubuntu@195.154.XX.XX
cd /opt/sina-prestige
docker compose -f docker/docker-compose.yml logs -f
```

### Check Container Status
```bash
docker compose -f docker/docker-compose.yml ps
```

### Restart Services
```bash
docker compose -f docker/docker-compose.yml restart
```

### Backup Database
```bash
docker compose -f docker/docker-compose.yml exec api cp /data/submissions.db /data/submissions.db.backup
```

---

## 🐛 Troubleshooting

### Issue: "Permission denied" when connecting via SSH
**Solution:** Check SSH key permissions
```bash
chmod 600 ~/.ssh/deploy_key.pem
```

### Issue: Docker images not pulling
**Solution:** Verify Docker credentials
```bash
docker login -u your-username
docker pull your-username/sina-prestige-api
```

### Issue: Port 8080 already in use
**Solution:** Change port in docker-compose.yml or stop conflicting container
```bash
sudo lsof -i :8080
docker ps -a
docker stop container_id
```

### Issue: SMTP emails not sending
**Solution:** 
- Verify SMTP credentials are correct
- Check firewall rules allow outbound port 587
- For Gmail, use App Password (not regular password)

---

## 📞 OVH Support Resources

- **OVH Help Center:** https://help.ovhcloud.com/
- **OVH Cloud Documentation:** https://docs.ovhcloud.com/
- **OVH Community Forum:** https://community.ovh.com/
- **OVH Support Tickets:** https://www.ovh.com/manager/dedicated/

---

## 🎯 What Happens on Each Git Push

1. **Tests Run** - Backend Python tests execute
2. **Docker Images Build** - API and Web images are created
3. **Push to Registry** - Images pushed to Docker Hub
4. **Deploy to OVH** - SSH into instance and pull latest images
5. **Containers Restart** - docker-compose restarts services
6. **Health Check** - Verifies deployment succeeded

**Total time:** ~3-5 minutes per deployment

