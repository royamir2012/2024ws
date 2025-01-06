from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class GameAnalytics(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    ip_address = db.Column(db.String(45), nullable=False)
    event_type = db.Column(db.String(50), nullable=False)  # 'move', 'new_game'
    event_data = db.Column(db.String(50))  # 'up', 'down', 'left', 'right' for moves
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    @staticmethod
    def get_stats():
        from sqlalchemy import func
        stats = {
            'total_unique_ips': db.session.query(func.count(func.distinct(GameAnalytics.ip_address))).scalar(),
            'total_commands': db.session.query(func.count(GameAnalytics.id)).scalar(),
            'new_games': db.session.query(func.count(GameAnalytics.id)).filter(GameAnalytics.event_type == 'new_game').scalar(),
            'moves_by_direction': {
                direction: db.session.query(func.count(GameAnalytics.id))
                .filter(GameAnalytics.event_type == 'move', GameAnalytics.event_data == direction)
                .scalar()
                for direction in ['up', 'down', 'left', 'right']
            }
        }
        return stats
