

class AccountRepository:
    def __init__(self, cursor):
        self.cursor = cursor

    def get_by_username(self, username):
        self.cursor.execute(
            "SELECT user_id, username, password, role FROM accounts WHERE username = %s",
            (username,)
        )
        return self.cursor.fetchone()

    def create_account(self, username, password_hash, role="user"):
        self.cursor.execute(
            "INSERT INTO accounts (username, password, role) VALUES (%s, %s, %s) RETURNING user_id",
            (username, password_hash, role)
        )
        return self.cursor.fetchone()[0]

    def create_profile(self, user_id, full_name, email, phone=None, address=None, role="user"):
        if role == "admin":
            self.cursor.execute(
                "INSERT INTO admin_profiles (user_id, full_name, email, phone, address) VALUES (%s, %s, %s, %s, %s) RETURNING profile_id",
                (user_id, full_name, email, phone, address)
            )
        else:
            self.cursor.execute(
                "INSERT INTO user_profiles (user_id, full_name, email, phone, address) VALUES (%s, %s, %s, %s, %s) RETURNING profile_id",
                (user_id, full_name, email, phone, address)
            )
        return self.cursor.fetchone()[0]

    def get_profile_by_user_id(self, user_id, role="user"):
        if role == "admin":
            self.cursor.execute(
                "SELECT profile_id, full_name, email, phone, address, 0, 'Thường', NULL FROM admin_profiles WHERE user_id = %s",
                (user_id,)
            )
        else:
            self.cursor.execute(
                "SELECT profile_id, full_name, email, phone, address, loyalty_points, member_tier, special_notes FROM user_profiles WHERE user_id = %s",
                (user_id,)
            )
        return self.cursor.fetchone()

    def get_by_email(self, email):
        self.cursor.execute(
            """
            SELECT profile_id FROM user_profiles WHERE email = %s
            UNION ALL
            SELECT profile_id FROM admin_profiles WHERE email = %s
            """,
            (email, email)
        )
        return self.cursor.fetchone()

    def get_by_id(self, user_id):
        self.cursor.execute(
            "SELECT user_id, username, role, is_active FROM accounts WHERE user_id = %s",
            (user_id,)
        )
        return self.cursor.fetchone()


    def update_password(self, user_id, password_hash):
        self.cursor.execute(
            "UPDATE accounts SET password = %s, updated_at = CURRENT_TIMESTAMP WHERE user_id = %s",
            (password_hash, user_id)
        )

    def update_profile(self, user_id, role, full_name, email, phone, address, special_notes):
        if role == "admin":
            self.cursor.execute(
                """
                UPDATE admin_profiles
                SET full_name = %s,
                    email = %s,
                    phone = %s,
                    address = %s,
                    updated_at = CURRENT_TIMESTAMP
                WHERE user_id = %s
                """,
                (full_name, email, phone, address, user_id)
            )
        else:
            self.cursor.execute(
                """
                UPDATE user_profiles
                SET full_name = %s,
                    email = %s,
                    phone = %s,
                    address = %s,
                    special_notes = %s,
                    updated_at = CURRENT_TIMESTAMP
                WHERE user_id = %s
                """,
                (full_name, email, phone, address, special_notes, user_id)
            )
