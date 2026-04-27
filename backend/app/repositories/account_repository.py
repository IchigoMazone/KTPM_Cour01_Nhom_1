

class AccountRepository:
    def __init__(self, cursor):
        self.cursor = cursor

    def get_by_username(self, username):
        self.cursor.execute(
            "SELECT user_id, username, password FROM accounts WHERE username = %s",
            (username,)
        )
        return self.cursor.fetchone()