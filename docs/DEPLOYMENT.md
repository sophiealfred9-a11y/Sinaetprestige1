# 🚀 Deployment Guide - Sina & Prestige

Complete guide to deploy Sina & Prestige to production environments.

## 📋 Prerequisites

- Docker & Docker Compose (for containerized deployment)
- OR FTP access to OVH Cloud
- Domain: sinaetprestige.fr (or your domain)

---

## 🐳 Docker Deployment (RECOMMENDED)

### 1. Build Docker Image

```bash
cd sina&prestige
docker build -t sina-prestige:latest docker/
```

### 2. Run with Docker Compose

```bash
cd docker
docker-compose up -d
```

**Access:** http://localhost:8080

### 3. Environment Variables

Edit `docker/docker-compose.yml`:
```yaml
environment:
  - NGINX_HOST=sinaetprestige.fr
  - NGINX_PORT=80
  - TZ=Europe/Paris
```

### 4. Health Check

```bash
curl http://localhost:8080/health
# Response: healthy
```

---

## ☁️ OVH Cloud Deployment (FTP)

### 1. Connect via FTP

```
Host: ftp.sinaetprestige.fr
User: your_username
Password: your_password
```

### 2. Upload Files

```bash
cd frontend/
ftp> put -r ./* /www/
```

Or using FileZilla/Cyberduck:
1. Connect to FTP server
2. Navigate to `/www/` folder
3. Drag & drop all frontend files

### 3. Configure Apache (.htaccess)

File: `frontend/.htaccess` is already configured for:
- Clean URLs (/formations instead of /formations.html)
- GZIP compression
- Caching headers
- Security headers

### 4. Configure Document Root

In OVH Control Panel:
1. Go to Web Hosting > Multisite
2. Select domain: sinaetprestige.fr
3. Set Document Root: `/www/`
4. Save changes

### 5. SSL Certificate

OVH provides Let's Encrypt SSL:
1. Control Panel > SSL Certificate
2. Install Let's Encrypt (free)
3. Auto-renew enabled ✓

### 6. Test Deployment

```
https://sinaetprestige.fr
https://sinaetprestige.fr/formations
https://sinaetprestige.fr/contact
```

---

## 🔄 CI/CD Pipeline (GitHub Actions)

### 1. Create GitHub Workflow

File: `.github/workflows/deploy.yml`

```yaml
name: Deploy to OVH

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Upload to OVH
        uses: appleboy/sftp-action@master
        with:
          host: ${{ secrets.OVH_HOST }}
          username: ${{ secrets.OVH_USER }}
          password: ${{ secrets.OVH_PASSWORD }}
          local_path: ./frontend/*
          remote_path: /www/
```

### 2. Add GitHub Secrets

Settings > Secrets and variables:
- `OVH_HOST`: ftp.sinaetprestige.fr
- `OVH_USER`: your_username
- `OVH_PASSWORD`: your_password

---

## 🛠️ Production Checklist

- [ ] All 15 HTML pages uploaded
- [ ] CSS minified (21KB)
- [ ] JavaScript minified (7.4KB)
- [ ] Images optimized
- [ ] PDFs in /pdfs/ folder
- [ ] .htaccess configured
- [ ] robots.txt present
- [ ] sitemap.xml updated
- [ ] SSL certificate active
- [ ] Domain pointing to server
- [ ] DNS records configured
  - A record: your_ip
  - CNAME: www points to sinaetprestige.fr
- [ ] Email configured (contact@sinaetprestige.fr)
- [ ] Analytics tracking (if needed)
- [ ] Backup strategy in place

---

## 📊 Performance Tuning

### Nginx Caching Headers

Already configured in `docker/nginx.conf`:

```
HTML: 2 hours
CSS/JS: 30 days
Images: 1 year
Fonts: 1 year
```

### GZIP Compression

Enabled for:
- text/plain
- text/css
- application/javascript
- application/json
- image/svg+xml

### HTTP/2 Support

Available in production Nginx configuration.

---

## 🔍 Monitoring

### Docker Health Check

```bash
docker ps
# STATUS should show "healthy"
```

### Log Monitoring

```bash
# Nginx access logs
docker logs sina-prestige-web

# Web server logs
docker exec sina-prestige-web tail -f /var/log/nginx/access.log
```

### SSL Certificate

```bash
# Check expiration
echo | openssl s_client -servername sinaetprestige.fr -connect sinaetprestige.fr:443 2>/dev/null | openssl x509 -noout -dates
```

---

## 🆘 Troubleshooting

### 404 Errors on Clean URLs

**Problem:** /formations returns 404
**Solution:** Ensure .htaccess is in web root and `mod_rewrite` is enabled

```bash
# Check .htaccess
cat .htaccess

# Enable mod_rewrite (OVH automatically enables it)
```

### Slow Page Load

**Check:**
1. Image optimization: `frontend/images/`
2. CSS minification: `styles.min.css`
3. Browser cache: Clear Ctrl+Shift+Delete

### SSL Certificate Issues

**Renew Let's Encrypt:**
```bash
# OVH handles auto-renewal
# If manual: certbot renew
```

---

## 📈 Scaling

For future scaling with backend services:

```yaml
# docker-compose.yml
services:
  web:
    # Nginx
  api:
    # Node.js/Python backend
  db:
    # Database if needed
```

---

## 🔐 Security Hardening

- [ ] Enable HTTPS only (HTTP → HTTPS redirect)
- [ ] Add HSTS header (Strict-Transport-Security)
- [ ] Update CSP headers
- [ ] Regular backups (daily)
- [ ] Monitor SSL logs
- [ ] Disable directory listing
- [ ] Sanitize user inputs (forms)
- [ ] Update dependencies regularly

---

## 📞 Support

- **OVH Support:** support.ovh.net
- **Issue Tracker:** GitHub Issues
- **Email:** contact@sinaetprestige.fr

---

**Last Updated:** 2026-07-19
**Version:** 1.0.0
