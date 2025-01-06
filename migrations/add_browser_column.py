import sqlite3

def upgrade():
    # Connect to the database
    conn = sqlite3.connect('instance/game.db')
    cursor = conn.cursor()
    
    try:
        # Add browser column
        cursor.execute('ALTER TABLE game_analytics ADD COLUMN browser VARCHAR(100)')
        conn.commit()
        print("Successfully added browser column")
    except Exception as e:
        print(f"Error: {str(e)}")
    finally:
        conn.close()

def downgrade():
    # Connect to the database
    conn = sqlite3.connect('instance/game.db')
    cursor = conn.cursor()
    
    try:
        # Remove browser column
        cursor.execute('ALTER TABLE game_analytics DROP COLUMN browser')
        conn.commit()
        print("Successfully removed browser column")
    except Exception as e:
        print(f"Error: {str(e)}")
    finally:
        conn.close()

if __name__ == '__main__':
    upgrade()
