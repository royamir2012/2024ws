#!/bin/bash

# Create necessary directories
mkdir -p instance logs

# Set permissions
chmod -R 755 instance logs

# Initialize the database
python3 -c "
from app import app, db
with app.app_context():
    db.create_all()
"
