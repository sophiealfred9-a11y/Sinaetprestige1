# Frontend Configuration
CADDY_EMAIL=contact@sinaetprestige.fr
CADDY_AUTO_HTTPS=on

# Backend Configuration
ADMIN_EMAIL=contact@sinaetprestige.fr
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
FLASK_ENV=production

# Database Configuration
DATABASE_URL=sqlite:////data/submissions.db
# For PostgreSQL (optional upgrade):
# DATABASE_URL=postgresql://user:password@db:5432/sinaprestige

# Timezone
TZ=Europe/Paris

# Docker Configuration
DOCKER_REGISTRY=docker.io
DOCKER_USERNAME=your-docker-username
DOCKER_PASSWORD=your-docker-password
