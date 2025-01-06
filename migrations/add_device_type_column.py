import os
import sys
import sqlite3

def upgrade():
    # Connect to the database
    conn = sqlite3.connect('instance/game.db')
    cursor = conn.cursor()
    
    try:
        # Add device_type column
        cursor.execute('ALTER TABLE game_analytics ADD COLUMN device_type VARCHAR(100)')
        conn.commit()
        print("Successfully added device_type column")
    except Exception as e:
        print(f"Error: {str(e)}")
    finally:
        conn.close()

def downgrade():
    # Connect to the database
    conn = sqlite3.connect('instance/game.db')
    cursor = conn.cursor()
    
    try:
        # Remove device_type column
        cursor.execute('ALTER TABLE game_analytics DROP COLUMN device_type')
        conn.commit()
        print("Successfully removed device_type column")
    except Exception as e:
        print(f"Error: {str(e)}")
    finally:
        conn.close()

if __name__ == '__main__':
    upgrade()
