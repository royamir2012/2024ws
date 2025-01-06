from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
from models import db, GameAnalytics
import os

app = Flask(__name__)
CORS(app)

# Configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///game.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['GA_MEASUREMENT_ID'] = os.environ.get('GA_MEASUREMENT_ID', 'G-XXXXXXXXXX')  # Replace with your GA4 Measurement ID

# Initialize database
db.init_app(app)
with app.app_context():
    db.create_all()

@app.route('/')
def index():
    return render_template('index.html', ga_measurement_id=app.config['GA_MEASUREMENT_ID'])

@app.route('/track', methods=['POST'])
def track_event():
    data = request.json
    event = GameAnalytics(
        ip_address=request.remote_addr,
        event_type=data.get('event_type'),
        event_data=data.get('event_data')
    )
    db.session.add(event)
    db.session.commit()
    return jsonify({'status': 'success'})

@app.route('/dashboard')
def dashboard():
    stats = GameAnalytics.get_stats()
    recent_events = GameAnalytics.query.order_by(GameAnalytics.timestamp.desc()).limit(10).all()
    return render_template('dashboard.html', stats=stats, recent_events=recent_events)

@app.route('/dashboard-data')
def dashboard_data():
    stats = GameAnalytics.get_stats()
    recent_events = [
        {
            'timestamp': event.timestamp.isoformat(),
            'ip_address': event.ip_address,
            'event_type': event.event_type,
            'event_data': event.event_data
        }
        for event in GameAnalytics.query.order_by(GameAnalytics.timestamp.desc()).limit(10).all()
    ]
    return jsonify({
        'stats': stats,
        'recent_events': recent_events
    })

if __name__ == '__main__':
    app.run(debug=True, port=5001, host='0.0.0.0')
