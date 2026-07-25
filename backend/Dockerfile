FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app.py .

ENV FLASK_ENV=production
ENV ADMIN_EMAIL=contact@sinaetprestige.fr
ENV SMTP_SERVER=smtp.gmail.com
ENV SMTP_PORT=587
ENV DATABASE_URL=sqlite:////data/submissions.db

RUN mkdir -p /data

EXPOSE 5000

CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--workers", "4", "--worker-class", "sync", "--timeout", "30", "app:app"]
