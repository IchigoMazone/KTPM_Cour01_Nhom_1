

class AccountRepository:
    def __init__(self, cursor):
        self.cursor = cursor

    def get_by_username(self, username):
        self.cursor.execute(
            """
            SELECT user_id, username, password, role, is_active
            FROM accounts
            WHERE username = %s
            """,
            (username,)
        )
        return self.cursor.fetchone()

    def create_account(
        self,
        username,
        password_hash,
        role="user",
        full_name=None,
        email=None,
        phone=None,
        address=None,
        image_url=None,
    ):
        self.cursor.execute(
            """
            INSERT INTO accounts (
                username, password, role, full_name, email, phone, address, image_url
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING user_id
            """,
            (username, password_hash, role, full_name, email, phone, address, image_url)
        )
        return self.cursor.fetchone()[0]

    def create_profile(self, user_id, full_name, email, phone=None, address=None, role="user", image_url=None):
        self.cursor.execute(
            """
            UPDATE accounts
            SET full_name = %s,
                email = %s,
                phone = %s,
                address = %s,
                image_url = %s,
                updated_at = CURRENT_TIMESTAMP
            WHERE user_id = %s
            RETURNING user_id
            """,
            (full_name, email, phone, address, image_url, user_id)
        )
        return self.cursor.fetchone()[0]

    def ensure_profile(self, user_id, username, role="user"):
        default_email = f"{username}@example.com"
        default_address = "Chưa cập nhật"
        default_image_url = "https://pub-40f0fd53a3c74462bfbb6e9fbe66aece.r2.dev/default_avatar.jfif"
        self.cursor.execute(
            """
            UPDATE accounts
            SET full_name = COALESCE(NULLIF(full_name, ''), %s),
                email = COALESCE(NULLIF(email, ''), %s),
                address = COALESCE(NULLIF(address, ''), %s),
                image_url = COALESCE(NULLIF(image_url, ''), %s),
                loyalty_points = COALESCE(loyalty_points, 0),
                member_tier = COALESCE(NULLIF(member_tier, ''), 'Thường')
            WHERE user_id = %s
            """,
            (username, default_email, default_address, default_image_url, user_id)
        )

    def get_profile_by_user_id(self, user_id, role="user"):
        self.cursor.execute(
            """
            SELECT
                user_id,
                full_name,
                email,
                phone,
                address,
                loyalty_points,
                member_tier,
                special_notes,
                image_url
            FROM accounts
            WHERE user_id = %s
            """,
            (user_id,)
        )
        return self.cursor.fetchone()

    def get_by_email(self, email):
        self.cursor.execute(
            "SELECT user_id FROM accounts WHERE email = %s",
            (email,)
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

    def update_profile(self, user_id, role, full_name, email, phone, address, special_notes, image_url):
        if role == "admin":
            special_notes = None

        self.cursor.execute(
            """
            UPDATE accounts
            SET full_name = %s,
                email = %s,
                phone = %s,
                address = %s,
                special_notes = %s,
                image_url = %s,
                updated_at = CURRENT_TIMESTAMP
            WHERE user_id = %s
            """,
            (full_name, email, phone, address, special_notes, image_url, user_id)
        )
