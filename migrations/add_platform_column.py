from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from models import db, GameAnalytics
import sqlite3

def upgrade():
    conn = sqlite3.connect('instance/game.db')
    cursor = conn.cursor()
    
    # Add platform column with default value 'web'
    cursor.execute('ALTER TABLE game_analytics ADD COLUMN platform VARCHAR(20) NOT NULL DEFAULT "web"')
    
    conn.commit()
    conn.close()

if __name__ == '__main__':
    app = Flask(__name__)
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///game.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    db.init_app(app)
    
    with app.app_context():
        upgrade()
