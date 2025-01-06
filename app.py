from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
from models import db, GameAnalytics
import os
import logging
from logging.handlers import RotatingFileHandler
from user_agents import parse

app = Flask(__name__)
CORS(app)

# Configure logging
if not app.debug:
    if not os.path.exists('logs'):
        os.mkdir('logs')
    file_handler = RotatingFileHandler('logs/game.log', maxBytes=10240, backupCount=10)
    file_handler.setFormatter(logging.Formatter(
        '%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]'
    ))
    file_handler.setLevel(logging.INFO)
    app.logger.addHandler(file_handler)
    app.logger.setLevel(logging.INFO)
    app.logger.info('Game startup')

# Configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///game.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['GA_MEASUREMENT_ID'] = os.environ.get('GA_MEASUREMENT_ID', 'G-XXXXXXXXXX')  # Replace with your GA4 Measurement ID

# Ensure the instance folder exists
try:
    os.makedirs('instance', exist_ok=True)
except Exception as e:
    app.logger.error(f'Error creating instance directory: {str(e)}')

# Initialize database
db.init_app(app)
with app.app_context():
    try:
        db.create_all()
        app.logger.info('Database initialized successfully')
    except Exception as e:
        app.logger.error(f'Error initializing database: {str(e)}')

@app.route('/')
def index():
    return render_template('index.html', ga_measurement_id=app.config['GA_MEASUREMENT_ID'])

@app.route('/track', methods=['POST'])
def track_event():
    try:
        data = request.get_json()
        
        # Get IP address
        if request.headers.getlist("X-Forwarded-For"):
            ip_address = request.headers.getlist("X-Forwarded-For")[0]
        else:
            ip_address = request.remote_addr
            
        # Get User-Agent string
        user_agent_string = request.headers.get('User-Agent')
        
        # Parse User-Agent for detailed device information
        user_agent = parse(user_agent_string)
        
        # Determine device type
        if user_agent.is_mobile:
            device_type = f"Mobile ({user_agent.device.brand} {user_agent.device.model})"
        elif user_agent.is_tablet:
            device_type = f"Tablet ({user_agent.device.brand} {user_agent.device.model})"
        else:
            os_info = user_agent.os.family
            if "Mac" in os_info:
                device_type = "Mac"
            elif "Windows" in os_info:
                device_type = "PC"
            elif "iOS" in os_info:
                device_type = "iPad"
            else:
                device_type = f"Desktop ({os_info})"
            
        # Create analytics event
        event = GameAnalytics(
            ip_address=ip_address,
            event_type=data.get('event_type'),
            event_data=data.get('event_data'),
            platform=data.get('platform', 'web'),
            browser=user_agent.browser.family,
            device_type=device_type
        )
        
        db.session.add(event)
        db.session.commit()
        
        return jsonify({'status': 'success'})
    except Exception as e:
        app.logger.error(f'Error tracking event: {str(e)}')
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/dashboard')
def dashboard():
    try:
        stats = GameAnalytics.get_stats()
        recent_events = GameAnalytics.query.order_by(GameAnalytics.timestamp.desc()).limit(10).all()
        return render_template('dashboard.html', stats=stats, recent_events=recent_events)
    except Exception as e:
        app.logger.error(f'Error in dashboard: {str(e)}')
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/dashboard-data')
def dashboard_data():
    try:
        stats = GameAnalytics.get_stats()
        recent_events = db.session.query(GameAnalytics).order_by(GameAnalytics.timestamp.desc()).limit(10).all()
        recent_events_data = [{
            'timestamp': event.timestamp.isoformat(),
            'ip_address': event.ip_address,
            'platform': event.platform,
            'event_type': event.event_type,
            'event_data': event.event_data,
            'browser': event.browser,
            'device_type': event.device_type
        } for event in recent_events]
        
        return jsonify({
            'status': 'success',
            'stats': stats,
            'recent_events': recent_events_data
        })
    except Exception as e:
        app.logger.error(f'Error in dashboard: {str(e)}')
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.errorhandler(500)
def internal_error(error):
    app.logger.error(f'Server Error: {error}')
    db.session.rollback()
    return jsonify({'status': 'error', 'message': 'Internal server error'}), 500

@app.errorhandler(404)
def not_found_error(error):
    app.logger.error(f'Not Found: {error}')
    return jsonify({'status': 'error', 'message': 'Not found'}), 404

if __name__ == '__main__':
    app.run(debug=True, port=5001, host='0.0.0.0')
