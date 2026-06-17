

class AccountRepository:
    def __init__(self, cursor):
        self.cursor = cursor

    def ensure_layout_columns(self):
        # Account layout columns are part of the managed schema now.
        # Avoid running DDL inside request paths because it can lock `accounts`
        # and stall unrelated pages such as `/home` and order updates.
        return

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

    def link_customer_profile(self, user_id, email=None, phone=None):
        self.cursor.execute("SELECT to_regclass('public.home_customers')")
        if not self.cursor.fetchone()[0]:
            return
        self.cursor.execute(
            """
            UPDATE home_customers
            SET account_id = %s, updated_at = CURRENT_TIMESTAMP
            WHERE account_id IS NULL
              AND (
                (%s IS NOT NULL AND %s <> '' AND LOWER(COALESCE(email, '')) = LOWER(%s))
                OR (%s IS NOT NULL AND %s <> '' AND COALESCE(phone, '') = %s)
              )
              AND customer_id = (
                SELECT customer_id
                FROM home_customers
                WHERE account_id IS NULL
                  AND (
                    (%s IS NOT NULL AND %s <> '' AND LOWER(COALESCE(email, '')) = LOWER(%s))
                    OR (%s IS NOT NULL AND %s <> '' AND COALESCE(phone, '') = %s)
                  )
                ORDER BY created_at
                LIMIT 1
              )
            """,
            (
                user_id,
                email, email, email,
                phone, phone, phone,
                email, email, email,
                phone, phone, phone,
            ),
        )

    def ensure_profile(self, user_id, username, role="user"):
        default_email = f"{username}@example.com"
        default_address = "Chưa cập nhật"
        default_image_url = None
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
        self.ensure_layout_columns()
        self.cursor.execute(
            "SELECT user_id, username, role, is_active, page_size, table_resize_mode, columns_config FROM accounts WHERE user_id = %s",
            (user_id,)
        )
        return self.cursor.fetchone()


    def update_password(self, user_id, password_hash):
        self.cursor.execute(
            "UPDATE accounts SET password = %s, updated_at = CURRENT_TIMESTAMP WHERE user_id = %s",
            (password_hash, user_id)
        )

    def update_profile(self, user_id, role, full_name, email, phone, address, special_notes, image_url, page_size=None, table_resize_mode=None, columns_config=None):
        self.ensure_layout_columns()
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
                page_size = COALESCE(%s, page_size),
                table_resize_mode = COALESCE(%s, table_resize_mode),
                columns_config = COALESCE(%s, columns_config),
                updated_at = CURRENT_TIMESTAMP
            WHERE user_id = %s
            """,
            (full_name, email, phone, address, special_notes, image_url, page_size, table_resize_mode, columns_config, user_id)
        )

    def sync_customer_avatar_by_account(self, user_id, image_url):
        self.cursor.execute("SELECT to_regclass('public.home_customers')")
        if not self.cursor.fetchone()[0]:
            return
        self.cursor.execute(
            """
            UPDATE home_customers
            SET image_url = %s,
                updated_at = CURRENT_TIMESTAMP
            WHERE account_id = %s
            """,
            (image_url, user_id),
        )

    def sync_customer_profile_by_account(self, user_id, full_name, email, phone, address, note=None):
        self.cursor.execute("SELECT to_regclass('public.home_customers')")
        if not self.cursor.fetchone()[0]:
            return
        self.cursor.execute(
            """
            UPDATE home_customers
            SET full_name = COALESCE(%s, full_name),
                email = %s,
                phone = COALESCE(%s, phone),
                address = %s,
                note = %s,
                updated_at = CURRENT_TIMESTAMP
            WHERE account_id = %s
            """,
            (full_name, email, phone, address, note, user_id),
        )

    def sync_account_avatar_by_customer(self, account_id, image_url):
        if not account_id:
            return
        self.cursor.execute(
            """
            UPDATE accounts
            SET image_url = %s,
                updated_at = CURRENT_TIMESTAMP
            WHERE user_id = %s
            """,
            (image_url, account_id),
        )
