from app import app, db

with app.app_context():
    db.drop_all()  # Drop all existing tables
    db.create_all()  # Create tables with new schema
    print("Database initialized successfully!")
