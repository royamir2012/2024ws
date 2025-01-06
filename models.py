from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from sqlalchemy import func

db = SQLAlchemy()

class GameAnalytics(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    ip_address = db.Column(db.String(45), nullable=False)
    platform = db.Column(db.String(20), nullable=False, default='web')  # 'web' or 'ios'
    browser = db.Column(db.String(100))  # Store browser information
    device_type = db.Column(db.String(100))  # Store device type (mobile, tablet, desktop, etc.)
    event_type = db.Column(db.String(50), nullable=False)  # 'move', 'new_game'
    event_data = db.Column(db.String(50))  # 'up', 'down', 'left', 'right' for moves
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    @staticmethod
    def get_stats():
        stats = {
            'total_unique_ips': db.session.query(func.count(func.distinct(GameAnalytics.ip_address))).scalar(),
            'total_commands': db.session.query(func.count(GameAnalytics.id)).scalar(),
            'new_games': db.session.query(func.count(GameAnalytics.id)).filter(GameAnalytics.event_type == 'new_game').scalar(),
            'moves_by_direction': {
                direction: db.session.query(func.count(GameAnalytics.id))
                .filter(GameAnalytics.event_type == 'move', GameAnalytics.event_data == direction)
                .scalar()
                for direction in ['up', 'down', 'left', 'right']
            },
            'platform_stats': {
                'web': db.session.query(func.count(GameAnalytics.id)).filter(GameAnalytics.platform == 'web').scalar(),
                'ios': db.session.query(func.count(GameAnalytics.id)).filter(GameAnalytics.platform == 'ios').scalar()
            },
            'browser_stats': [
                [str(row[0] or 'Unknown'), row[1]]
                for row in db.session.query(GameAnalytics.browser, func.count(GameAnalytics.id))
                .filter(GameAnalytics.browser.isnot(None))
                .group_by(GameAnalytics.browser)
                .all()
            ],
            'device_stats': [
                [str(row[0] or 'Unknown'), row[1]]
                for row in db.session.query(GameAnalytics.device_type, func.count(GameAnalytics.id))
                .filter(GameAnalytics.device_type.isnot(None))
                .group_by(GameAnalytics.device_type)
                .all()
            ]
        }
        return stats

class GlobalHighScore(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    highest_number = db.Column(db.Integer, default=0)
    best_time = db.Column(db.Integer)  # in seconds
    achieved_by = db.Column(db.String(50))  # IP address of the achiever
    achieved_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    @staticmethod
    def get_current():
        record = GlobalHighScore.query.order_by(GlobalHighScore.highest_number.desc(), GlobalHighScore.best_time.asc()).first()
        if not record:
            record = GlobalHighScore(highest_number=0, best_time=None)
            db.session.add(record)
            db.session.commit()
        return record
