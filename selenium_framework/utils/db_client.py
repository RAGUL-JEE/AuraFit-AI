import sqlite3

class DBClient:
    def __init__(self, db_path="history.db"):
        self.db_path = db_path

    def get_user_count(self):
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            cursor.execute("SELECT COUNT(*) FROM users")
            count = cursor.fetchone()[0]
            conn.close()
            return count
        except Exception as e:
            return -1
