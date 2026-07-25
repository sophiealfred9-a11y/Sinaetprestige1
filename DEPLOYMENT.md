# 🎯 Client Information Needed for CI/CD Deployment

## Quick Summary: What to Ask Your Client

Print this document and use it as a conversation guide with your client.

---

## 📌 Priority 1: CRITICAL - Cannot Deploy Without This

### 1️⃣ OVH Instance Details
**What:** Cloud server details on OVH
**Where to find:** OVH Control Panel > Cloud > Instances
**Ask the client:**
- "What's the public IP address of your OVH instance?" 
  - *Example: `195.154.45.67`*
- "What OS are you running?" 
  - *Example: Ubuntu 20.04 LTS*

### 2️⃣ SSH Access
**What:** Secure shell key to connect remotely
**Where to find:** OVH Instances > [Instance Name] > Console
**Ask the client:**
- "Do you have the SSH private key (.pem file) for accessing your instance?"
- "What's your SSH username?" 
  - *Example: `ubuntu` or `root`*
- **ACTION:** Download the .pem file from OVH control panel if not available

### 3️⃣ Domain Name
**What:** Your website domain
**Where to find:** Your domain registrar (Gandi, OVH, Namecheap, etc.)
**Ask the client:**
- "What's your website domain?"
  - *Example: `sinaetprestige.fr`*
- "Who manages your DNS?"
  - *Example: OVH, Cloudflare, or other provider*

### 4️⃣ Email (SMTP) Credentials
**What:** Email server details for contact form notifications
**Where to find:** Email provider account
**Ask the client:**
- "What email should we use for sending contact form messages?"
  - *Example: `contact@sinaetprestige.fr`*
- "What SMTP server does your email provider use?"
  - *Example: Gmail uses `smtp.gmail.com:587`*
- **⚠️ IMPORTANT:** For Gmail, they must generate an "App Password" (not their regular password)
  - Google Account > Security > App passwords
  - Create for "Mail" and "Windows Computer"

---

## 📌 Priority 2: IMPORTANT - Strongly Recommended

### 5️⃣ Docker Hub Account (for image registry)
**What:** Container image storage/distribution
**Where to find:** https://hub.docker.com/
**Ask the client:**
- "Do you have a Docker Hub account?"
  - If NO: "Create one at hub.docker.com (free)"
- "What's your Docker Hub username?"
- **ACTION:** Generate a Docker access token (not password):
  - Account Settings > Security > New Access Token > Select "Read & Write"

### 6️⃣ Database Upgrade (Optional but Recommended)
**What:** Currently using SQLite, but for production should consider PostgreSQL
**Ask the client:**
- "Do you want to upgrade from SQLite to PostgreSQL?"
  - SQLite: Simple, works for small traffic, data in single file
  - PostgreSQL: Professional, better for multiple instances, advanced features

---

## 📌 Priority 3: OPTIONAL - Nice to Have

### 7️⃣ Monitoring & Alerts
**What:** Get notified if website goes down
**Ask the client:**
- "Do you want uptime monitoring/alerts?"
- "What email should alerts go to?"
- "Should we monitor response time?"

### 8️⃣ Backups
**What:** Automatic database backups
**Ask the client:**
- "How often should we backup the database?"
  - Recommended: Daily
- "Where should backups be stored?"
  - OVH S3 object storage or local disk

---

## 🗂️ Information Collection Template

Print and fill this out with your client:

```
┌─────────────────────────────────────────────────────┐
│         CLIENT DEPLOYMENT INFORMATION               │
├─────────────────────────────────────────────────────┤
│ Company/Project: _________________________________  │
│ Client Contact: __________________________________  │
│ Client Email: ____________________________________  │
│ Client Phone: ____________________________________  │
│                                                     │
│ OVH Instance IP: __________________________________│
│ SSH Username: _____________________________________│
│ Domain Name: ______________________________________│
│                                                     │
│ Email for Notifications: ___________________________│
│ SMTP Server: ______________________________________│
│ SMTP Port: ________________________________________│
│                                                     │
│ Docker Hub Username: _______________________________│
│ Docker Hub Token: _________________________________│
│                                                     │
│ Deployment Date: __________________________________│
│ Go-Live Date: _____________________________________│
└─────────────────────────────────────────────────────┘
```

---

## 🔗 Links to Share With Client

**OVH Documentation:**
- Instance Management: https://docs.ovhcloud.com/gb/en/public-cloud/
- Control Panel: https://ca.ovh.com/en/auth/

**Gmail App Password (for SMTP):**
- https://myaccount.google.com/apppasswords
- (Requires 2FA enabled)

**Docker Hub (for image registry):**
- https://hub.docker.com/

**DNS Setup (if using OVH DNS):**
- https://docs.ovhcloud.com/gb/en/domains/

---

## ⚠️ Common Mistakes to Avoid

| ❌ WRONG | ✅ RIGHT |
|---------|---------|
| Use regular Gmail password | Use App Password from Google Account settings |
| Store SSH key in password manager | Store in secure location, share .pem file |
| Use SQLite for high traffic | Use PostgreSQL for production |
| Forget to update DNS | Update A record to point to OVH instance IP |
| Hardcode secrets in code | Use GitHub Actions secrets |
| No database backups | Setup automatic daily backups |

---

## 📋 Step-by-Step: What to Do Next

1. **Print DEPLOYMENT_CHECKLIST.md** and fill it out with client
2. **Collect all Priority 1 information** (4 items)
3. **Verify SSH access works** by testing connection
4. **Setup OVH instance** (run commands from OVH_SETUP_GUIDE.md)
5. **Add GitHub Secrets** (8 secrets total)
6. **First deployment test** by pushing to main branch
7. **Verify website is live** at domain

---

## 🎓 Learning Resources for Client

**If client wants to understand the setup:**

1. **What is CI/CD?**
   - CI = Continuous Integration (automated testing)
   - CD = Continuous Deployment (automated deployment)
   - On every git push, tests run and code deploys automatically

2. **What is Docker Compose?**
   - Tool to run multiple containers together
   - Used for API (Flask backend) and Web (Caddy frontend)
   - Easier than managing containers individually

3. **What is GitHub Actions?**
   - GitHub's automation tool
   - Runs scripts automatically when you push code
   - Builds, tests, and deploys your app

4. **Why OVH?**
   - European cloud provider (GDPR compliant)
   - Good pricing
   - Fast support
   - Public Cloud for flexibility

---

## 📞 When You Have All Information

Once you have Priority 1 information, you can:
- [ ] Setup OVH instance (follow OVH_SETUP_GUIDE.md)
- [ ] Configure GitHub secrets
- [ ] Do first deployment test
- [ ] Setup automatic deployments on git push

**Estimated setup time:** 1-2 hours (first time)
**Deployment time per update:** 3-5 minutes (automatic)

---

## 💡 Pro Tips

✨ **Save the client's information** in a secure password manager (1Password, Bitwarden, etc.)

✨ **Document everything** in a internal wiki so future developers know the setup

✨ **Test SSH access** before deployment to catch key issues early

✨ **Keep DNS TTL low (300 seconds)** while setting up, increase after verification

✨ **Monitor first deployment** in GitHub Actions → Actions tab → latest workflow

