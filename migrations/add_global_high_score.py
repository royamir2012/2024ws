import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from models import db, GlobalHighScore

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///game.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

def upgrade():
    with app.app_context():
        # Create the GlobalHighScore table
        GlobalHighScore.__table__.create(db.engine)

if __name__ == '__main__':
    upgrade()
