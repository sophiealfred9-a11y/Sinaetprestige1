#!/usr/bin/env python3
"""
Sina & Prestige - Contact Form Backend (Production-Ready)
Handles contact submissions with database persistence and proper error handling
"""

from flask import Flask, request, jsonify, session
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_wtf.csrf import CSRFProtect
import smtplib
import secrets
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
import logging
from datetime import datetime
import re
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)

# ===========================
# CONFIGURATION
# ===========================

# Secret key for CSRF and sessions
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', secrets.token_hex(32))

# Database configuration
DATABASE_URL = os.getenv('DATABASE_URL', 'sqlite:///submissions.db')
app.config['SQLALCHEMY_DATABASE_URI'] = DATABASE_URL
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JSON_SORT_KEYS'] = False
app.config['WTF_CSRF_TIME_LIMIT'] = None

# Email configuration
ADMIN_EMAIL = os.getenv('ADMIN_EMAIL', 'contact@sinaetprestige.fr')
SMTP_SERVER = os.getenv('SMTP_SERVER', 'smtp.gmail.com')
SMTP_PORT = int(os.getenv('SMTP_PORT', '587'))
SMTP_USER = os.getenv('SMTP_USER', '')
SMTP_PASSWORD = os.getenv('SMTP_PASSWORD', '')

# Environment
ENVIRONMENT = os.getenv('ENVIRONMENT', 'development')
DEBUG_MODE = ENVIRONMENT == 'development'

# Initialize extensions
CORS(app)
db = SQLAlchemy(app)
csrf = CSRFProtect(app)

# CSRF Configuration
if DEBUG_MODE:
    app.config['WTF_CSRF_CHECK_DEFAULT'] = False  # Disable CSRF for development/testing
limiter = Limiter(
    app=app,
    key_func=get_remote_address,
    default_limits=["200 per day", "50 per hour"],
    storage_uri="memory://"
)

# ===========================
# LOGGING SETUP
# ===========================

logging.basicConfig(
    level=logging.INFO if not DEBUG_MODE else logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ===========================
# DATABASE MODELS
# ===========================

class ContactSubmission(db.Model):
    """Contact form submission model"""
    __tablename__ = 'contact_submissions'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    email = db.Column(db.String(255), nullable=False)
    profil = db.Column(db.String(100))
    telephone = db.Column(db.String(20))
    entreprise = db.Column(db.String(255))
    type_demande = db.Column(db.String(100))
    format_souhaite = db.Column(db.String(100))
    budget = db.Column(db.String(255))
    delai = db.Column(db.String(100))
    message = db.Column(db.Text, nullable=False)
    rgpd = db.Column(db.Boolean, default=False)
    newsletter = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    ip_address = db.Column(db.String(45))
    status = db.Column(db.String(50), default='received')

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'profil': self.profil,
            'telephone': self.telephone,
            'entreprise': self.entreprise,
            'type_demande': self.type_demande,
            'format_souhaite': self.format_souhaite,
            'budget': self.budget,
            'delai': self.delai,
            'message': self.message,
            'rgpd': self.rgpd,
            'newsletter': self.newsletter,
            'created_at': self.created_at.isoformat(),
            'status': self.status
        }

# ===========================
# UTILITY FUNCTIONS
# ===========================

def validate_email(email):
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def sanitize_input(text):
    """Sanitize user input to prevent XSS"""
    if not isinstance(text, str):
        return text
    # Remove potentially dangerous HTML tags
    dangerous_chars = ['<', '>', '"', "'", '&']
    for char in dangerous_chars:
        if char == '&':
            text = text.replace(char, '&amp;')
        elif char == '<':
            text = text.replace(char, '&lt;')
        elif char == '>':
            text = text.replace(char, '&gt;')
    return text

def send_email(recipient, subject, html_body):
    """Send email via SMTP"""
    try:
        if not SMTP_USER or not SMTP_PASSWORD:
            logger.warning("Email not configured - skipping email send")
            return True

        msg = MIMEMultipart('alternative')
        msg['Subject'] = subject
        msg['From'] = SMTP_USER
        msg['To'] = recipient

        part = MIMEText(html_body, 'html')
        msg.attach(part)

        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        server.login(SMTP_USER, SMTP_PASSWORD)
        server.sendmail(SMTP_USER, recipient, msg.as_string())
        server.quit()

        logger.info(f"Email sent successfully to {recipient}")
        return True
    except Exception as e:
        logger.error(f"Email send failed: {str(e)}")
        return False

def get_client_ip():
    """Get client IP address"""
    if request.environ.get('HTTP_X_FORWARDED_FOR'):
        return request.environ['HTTP_X_FORWARDED_FOR'].split(',')[0]
    return request.remote_addr

# ===========================
# API ENDPOINTS
# ===========================

@app.route('/api/csrf-token', methods=['GET'])
def get_csrf_token():
    """Get CSRF token for form submission"""
    from flask_wtf.csrf import generate_csrf
    token = generate_csrf()
    return jsonify({'csrf_token': token}), 200

@app.route('/api/contact', methods=['POST'])
@limiter.limit("5 per hour")
def contact():
    """Handle contact form submissions"""
    try:
        data = request.get_json()

        if not data:
            return jsonify({'error': 'No JSON data provided'}), 400

        # Validate CSRF token (skip in development)
        if not DEBUG_MODE:
            csrf_token = data.get('csrf_token')
            if not csrf_token:
                return jsonify({'error': 'CSRF token required'}), 403

            try:
                csrf.validate_csrf(csrf_token)
            except Exception as e:
                logger.warning(f"CSRF validation failed: {str(e)}")
                return jsonify({'error': 'Invalid CSRF token'}), 403

        # Extract and sanitize input
        name = sanitize_input(data.get('name', '').strip())
        email = sanitize_input(data.get('email', '').strip())
        profil = sanitize_input(data.get('profil', '').strip())
        telephone = sanitize_input(data.get('telephone', '').strip())
        entreprise = sanitize_input(data.get('entreprise', '').strip())
        type_demande = sanitize_input(data.get('type', '').strip())
        format_souhaite = sanitize_input(data.get('format', '').strip())
        budget = sanitize_input(data.get('budget', '').strip())
        delai = sanitize_input(data.get('delai', '').strip())
        message = sanitize_input(data.get('message', '').strip())
        rgpd = data.get('rgpd', False)
        newsletter = data.get('newsletter', False)

        # Validation
        if not name or len(name) < 2 or len(name) > 255:
            logger.warning(f"Invalid name submitted: {name[:50]}")
            return jsonify({'error': 'Name required (2-255 characters)'}), 400

        if not email or not validate_email(email):
            logger.warning(f"Invalid email submitted: {email}")
            return jsonify({'error': 'Valid email required'}), 400

        if not message or len(message) < 10 or len(message) > 5000:
            logger.warning(f"Invalid message length: {len(message)}")
            return jsonify({'error': 'Message required (10-5000 characters)'}), 400

        if not rgpd:
            return jsonify({'error': 'RGPD consent required'}), 400

        # Create submission record
        submission = ContactSubmission(
            name=name,
            email=email,
            profil=profil,
            telephone=telephone,
            entreprise=entreprise,
            type_demande=type_demande,
            format_souhaite=format_souhaite,
            budget=budget,
            delai=delai,
            message=message,
            rgpd=rgpd,
            newsletter=newsletter,
            ip_address=get_client_ip(),
            status='received'
        )

        db.session.add(submission)
        db.session.commit()

        logger.info(f"New submission received from {email} (ID: {submission.id})")

        # Send confirmation email to user
        user_html = f"""
        <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #2c4f73 0%, #1a2d42 100%); color: white; padding: 2rem; border-radius: 8px 8px 0 0;">
                    <h2 style="margin: 0;">Merci, {name}! ✓</h2>
                    <p style="margin: 0.5rem 0 0 0; font-size: 0.95rem;">Nous avons bien reçu votre demande</p>
                </div>
                <div style="background: #f9f9f9; padding: 2rem; border-radius: 0 0 8px 8px;">
                    <p>Nous avons reçu votre message et notre équipe vous recontacterons sous <strong>24 à 48 heures ouvrées</strong>.</p>
                    <hr style="border: none; border-top: 1px solid #ddd; margin: 1.5rem 0;">
                    <h4 style="color: #2c4f73; margin-top: 1.5rem;">Récapitulatif de votre demande:</h4>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr><td style="padding: 0.5rem 0; border-bottom: 1px solid #eee;"><strong>Profil:</strong></td><td style="padding: 0.5rem 0 0.5rem 1rem; border-bottom: 1px solid #eee;">{profil or '-'}</td></tr>
                        <tr><td style="padding: 0.5rem 0; border-bottom: 1px solid #eee;"><strong>Entreprise:</strong></td><td style="padding: 0.5rem 0 0.5rem 1rem; border-bottom: 1px solid #eee;">{entreprise or '-'}</td></tr>
                        <tr><td style="padding: 0.5rem 0; border-bottom: 1px solid #eee;"><strong>Téléphone:</strong></td><td style="padding: 0.5rem 0 0.5rem 1rem; border-bottom: 1px solid #eee;">{telephone or '-'}</td></tr>
                        <tr><td style="padding: 0.5rem 0; border-bottom: 1px solid #eee;"><strong>Type de demande:</strong></td><td style="padding: 0.5rem 0 0.5rem 1rem; border-bottom: 1px solid #eee;">{type_demande or '-'}</td></tr>
                        <tr><td style="padding: 0.5rem 0; border-bottom: 1px solid #eee;"><strong>Format souhaité:</strong></td><td style="padding: 0.5rem 0 0.5rem 1rem; border-bottom: 1px solid #eee;">{format_souhaite or '-'}</td></tr>
                        <tr><td style="padding: 0.5rem 0; border-bottom: 1px solid #eee;"><strong>Budget estimé:</strong></td><td style="padding: 0.5rem 0 0.5rem 1rem; border-bottom: 1px solid #eee;">{budget or '-'}</td></tr>
                        <tr><td style="padding: 0.5rem 0; border-bottom: 1px solid #eee;"><strong>Délai souhaité:</strong></td><td style="padding: 0.5rem 0 0.5rem 1rem; border-bottom: 1px solid #eee;">{delai or '-'}</td></tr>
                    </table>
                    <h4 style="color: #2c4f73; margin-top: 1.5rem;">Votre message:</h4>
                    <p style="background: white; padding: 1rem; border-left: 4px solid #2c4f73; white-space: pre-wrap;">{message}</p>
                    <hr style="border: none; border-top: 1px solid #ddd; margin: 1.5rem 0;">
                    <p style="font-size: 0.85rem; color: #999;">© 2026 SINA & PRESTIGE - Tous droits réservés</p>
                </div>
            </body>
        </html>
        """

        # Send admin notification
        admin_html = f"""
        <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 700px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #2c4f73 0%, #1a2d42 100%); color: white; padding: 2rem; border-radius: 8px 8px 0 0;">
                    <h2 style="margin: 0;">🔔 Nouvelle demande de contact</h2>
                </div>
                <div style="background: #f9f9f9; padding: 2rem; border-radius: 0 0 8px 8px;">
                    <h4 style="color: #2c4f73; margin-top: 0;">Informations du contact:</h4>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr><td style="padding: 0.5rem 0; border-bottom: 1px solid #ddd; width: 150px;"><strong>Nom:</strong></td><td style="padding: 0.5rem 0 0.5rem 1rem; border-bottom: 1px solid #ddd;">{name}</td></tr>
                        <tr><td style="padding: 0.5rem 0; border-bottom: 1px solid #ddd;"><strong>Email:</strong></td><td style="padding: 0.5rem 0 0.5rem 1rem; border-bottom: 1px solid #ddd;"><a href="mailto:{email}">{email}</a></td></tr>
                        <tr><td style="padding: 0.5rem 0; border-bottom: 1px solid #ddd;"><strong>Profil:</strong></td><td style="padding: 0.5rem 0 0.5rem 1rem; border-bottom: 1px solid #ddd;">{profil or '-'}</td></tr>
                        <tr><td style="padding: 0.5rem 0; border-bottom: 1px solid #ddd;"><strong>Entreprise:</strong></td><td style="padding: 0.5rem 0 0.5rem 1rem; border-bottom: 1px solid #ddd;">{entreprise or '-'}</td></tr>
                        <tr><td style="padding: 0.5rem 0; border-bottom: 1px solid #ddd;"><strong>Téléphone:</strong></td><td style="padding: 0.5rem 0 0.5rem 1rem; border-bottom: 1px solid #ddd;"><a href="tel:{telephone}">{telephone or '-'}</a></td></tr>
                        <tr><td style="padding: 0.5rem 0; border-bottom: 1px solid #ddd;"><strong>Type de demande:</strong></td><td style="padding: 0.5rem 0 0.5rem 1rem; border-bottom: 1px solid #ddd;">{type_demande or '-'}</td></tr>
                        <tr><td style="padding: 0.5rem 0; border-bottom: 1px solid #ddd;"><strong>Format souhaité:</strong></td><td style="padding: 0.5rem 0 0.5rem 1rem; border-bottom: 1px solid #ddd;">{format_souhaite or '-'}</td></tr>
                        <tr><td style="padding: 0.5rem 0; border-bottom: 1px solid #ddd;"><strong>Budget estimé:</strong></td><td style="padding: 0.5rem 0 0.5rem 1rem; border-bottom: 1px solid #ddd;">{budget or '-'}</td></tr>
                        <tr><td style="padding: 0.5rem 0; border-bottom: 1px solid #ddd;"><strong>Délai souhaité:</strong></td><td style="padding: 0.5rem 0 0.5rem 1rem; border-bottom: 1px solid #ddd;">{delai or '-'}</td></tr>
                        <tr><td style="padding: 0.5rem 0; border-bottom: 1px solid #ddd;"><strong>Newsletter:</strong></td><td style="padding: 0.5rem 0 0.5rem 1rem; border-bottom: 1px solid #ddd;">{'Oui ✓' if newsletter else 'Non'}</td></tr>
                    </table>
                    <h4 style="color: #2c4f73; margin-top: 1.5rem;">Message:</h4>
                    <p style="background: white; padding: 1rem; border-left: 4px solid #d32f2f; white-space: pre-wrap;">{message}</p>
                    <hr style="border: none; border-top: 1px solid #ddd; margin: 1.5rem 0;">
                    <p style="font-size: 0.85rem; color: #999;">Reçu: {datetime.now().strftime('%d/%m/%Y à %H:%M:%S')}</p>
                    <p style="font-size: 0.85rem; color: #999;">IP: {get_client_ip()}</p>
                </div>
            </body>
        </html>
        """

        send_email(email, "Demande de contact reçue - Sina & Prestige", user_html)
        send_email(ADMIN_EMAIL, f"[CONTACT] {type_demande} - {name}", admin_html)

        return jsonify({
            'success': True,
            'message': 'Message sent successfully!',
            'id': submission.id
        }), 200

    except Exception as e:
        logger.error(f"Error processing contact form: {str(e)}", exc_info=True)
        return jsonify({'error': 'An error occurred. Please try again later.'}), 500

@app.route('/api/submissions', methods=['GET'])
def get_submissions():
    """Get all submissions (admin only - add auth in production)"""
    try:
        # TODO: Add authentication check
        submissions = ContactSubmission.query.order_by(
            ContactSubmission.created_at.desc()
        ).limit(100).all()

        return jsonify({
            'success': True,
            'count': len(submissions),
            'submissions': [s.to_dict() for s in submissions]
        }), 200
    except Exception as e:
        logger.error(f"Error fetching submissions: {str(e)}")
        return jsonify({'error': 'Failed to fetch submissions'}), 500

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    try:
        # Check database connection
        from sqlalchemy import text
        db.session.execute(text('SELECT 1'))
        db_status = 'ok'
    except Exception as e:
        logger.error(f"Database health check failed: {str(e)}")
        db_status = 'error'

    return jsonify({
        'status': 'healthy' if db_status == 'ok' else 'degraded',
        'service': 'contact-api',
        'database': db_status,
        'environment': ENVIRONMENT
    }), 200

@app.route('/', methods=['GET'])
def index():
    """API info endpoint"""
    return jsonify({
        'name': 'Sina & Prestige - Contact API',
        'version': '2.0.0',
        'environment': ENVIRONMENT,
        'endpoints': {
            'POST /api/contact': 'Submit contact form',
            'GET /api/submissions': 'View submissions (admin)',
            'GET /health': 'Health check'
        }
    }), 200

# ===========================
# ERROR HANDLERS
# ===========================

@app.errorhandler(404)
def not_found(e):
    """Handle 404 errors"""
    logger.warning(f"404 Not Found: {request.path}")
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def server_error(e):
    """Handle 500 errors"""
    logger.error(f"500 Server Error: {str(e)}")
    db.session.rollback()
    return jsonify({'error': 'Internal server error'}), 500

# ===========================
# DATABASE INITIALIZATION
# ===========================

def init_db():
    """Initialize database tables"""
    with app.app_context():
        db.create_all()
        logger.info("Database initialized successfully")

# ===========================
# APP INITIALIZATION
# ===========================

# Initialize database on startup
with app.app_context():
    try:
        db.create_all()
        logger.info("Database tables created/verified")
    except Exception as e:
        logger.error(f"Failed to initialize database: {str(e)}")

# ===========================
# MAIN
# ===========================

if __name__ == '__main__':
    logger.info(f"Starting Sina & Prestige API in {ENVIRONMENT} mode")
    app.run(host='0.0.0.0', port=5000, debug=DEBUG_MODE)
