# 📋 CI/CD Deployment Checklist for Client

Print this and fill it out with your client to gather all necessary information.

---

## 🔴 CRITICAL - MUST HAVE

### OVH Account & Instance
- [ ] **OVH Account Email:** ___________________________
- [ ] **OVH Project ID:** ___________________________
- [ ] **Instance Name:** ___________________________
- [ ] **Instance IP Address:** ___________________________
- [ ] **SSH Username:** ___________________________
- [ ] **Region:** ___________________________

### SSH Access
- [ ] **SSH Key File (.pem):** ___________________________
- [ ] **SSH Key Password (if encrypted):** ___________________________
- [ ] **SSH Access Tested:** ✓ (Run: `ssh -i key.pem user@IP`)

### Domain
- [ ] **Domain Name:** ___________________________
- [ ] **Current A Record IP:** ___________________________
- [ ] **DNS Provider:** ___________________________
- [ ] **DNS Administrator Contact:** ___________________________

### Email / SMTP
- [ ] **SMTP Server:** ___________________________
- [ ] **SMTP Port:** ___________________________
- [ ] **SMTP Username/Email:** ___________________________
- [ ] **SMTP Password/App Password:** ___________________________
- [ ] **SMTP Tested:** ✓ (Can send test email)

---

## 🟠 IMPORTANT - HIGHLY RECOMMENDED

### Docker Registry
- [ ] **Docker Hub Username:** ___________________________
- [ ] **Docker Hub Password/Token:** ___________________________
- [ ] **Container Visibility:** ☐ Public  ☐ Private

### Backup & Security
- [ ] **Backup Strategy Defined:** ___________________________
- [ ] **Daily backup frequency:** ✓
- [ ] **Backup Storage Location:** ___________________________
- [ ] **Database Type:** ☐ SQLite (current)  ☐ PostgreSQL (recommended)

### Monitoring
- [ ] **Uptime Monitoring:** ☐ Yes  ☐ No
- [ ] **Alert Email:** ___________________________
- [ ] **Log Retention Period:** ___________________________

---

## 🟡 OPTIONAL - NICE TO HAVE

### SSL Certificate
- [ ] **SSL Type:** ☐ Let's Encrypt (automatic)  ☐ Paid Certificate
- [ ] **Certificate Email:** ___________________________

### Performance
- [ ] **Expected Monthly Traffic:** ___________________________
- [ ] **Peak Concurrent Users:** ___________________________
- [ ] **Required Uptime SLA:** ___________________________

### Auto-Scaling
- [ ] **Auto-restart on crash:** ✓ (Enabled by default)
- [ ] **Resource limits needed:** ___________________________

---

## 📝 Deployment Configuration Summary

```
Production Environment:
├── Server IP: _____________________________
├── Domain: _____________________________
├── SSH User: _____________________________
├── App Path: /opt/sina-prestige
├── Database: SQLite (/data/submissions.db)
├── API Port: 5000 (internal)
├── Web Port: 8080 (external)
└── Timezone: Europe/Paris
```

---

## 🔐 GitHub Secrets to Add

**Repository:** https://github.com/YOUR_ORG/sina-prestige

**Settings → Secrets and variables → Actions**

```
1. DOCKER_USERNAME = ___________________________
2. DOCKER_PASSWORD = ___________________________
3. OVH_SERVER_IP = ___________________________
4. OVH_SSH_USER = ___________________________
5. OVH_SSH_KEY = [Paste full .pem file content]
6. OVH_APP_PATH = /opt/sina-prestige
7. SMTP_USER = ___________________________
8. SMTP_PASSWORD = ___________________________
```

---

## ✅ Pre-Deployment Testing

**Run these commands on your OVH instance:**

```bash
# SSH Access
ssh -i your-key.pem ubuntu@195.154.XX.XX

# Docker Check
docker --version
docker compose version

# Clone & Test
cd /opt/sina-prestige
git clone [repo-url] .
cp .env.example .env
# Edit .env with actual values
nano .env

# Start containers
docker compose -f docker/docker-compose.yml up -d

# Health check
curl http://localhost:8080/health
# Expected: "healthy"

# Check logs
docker compose -f docker/docker-compose.yml logs

# View running containers
docker ps
```

---

## 🚀 First Deployment Process

1. **Setup OVH Instance** (following OVH_SETUP_GUIDE.md)
2. **Add GitHub Secrets** (all 8 secrets above)
3. **Push to main branch** on GitHub
4. **GitHub Actions runs:**
   - ✓ Tests backend
   - ✓ Builds Docker images
   - ✓ Pushes to Docker Hub
   - ✓ SSHes to OVH instance
   - ✓ Pulls latest images
   - ✓ Restarts containers
5. **Monitor deployment** in GitHub Actions tab
6. **Verify:** https://sinaetprestige.fr

---

## 📞 Support Contact Information

**For OVH Issues:**
- [ ] OVH Support Ticket #: ___________________________
- [ ] OVH Support Email: ___________________________

**For Application Issues:**
- [ ] Developer Contact: ___________________________
- [ ] Developer Email: ___________________________
- [ ] On-Call Phone: ___________________________

---

## 📅 Sign-Off

- [ ] Client Information Collected: ✓
- [ ] OVH Instance Prepared: ✓
- [ ] GitHub Secrets Added: ✓
- [ ] First Deployment Successful: ✓
- [ ] DNS Verified: ✓
- [ ] SMTP Verified: ✓

**Date Completed:** ___________________________

**Verified By:** ___________________________

**Notes/Issues:**
_____________________________________________________________
_____________________________________________________________
_____________________________________________________________

