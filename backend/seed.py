import os
try:
    import psycopg2
except ModuleNotFoundError as exc:
    raise SystemExit(
        "Thiếu thư viện psycopg2. Hãy cài dependencies backend trước:\n"
        "  cd backend\n"
        "  python3 -m venv .venv\n"
        "  source .venv/bin/activate\n"
        "  pip install -r requirements.txt\n"
        "  python seed.py"
    ) from exc
from dotenv import load_dotenv

load_dotenv()


def seed_database():
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        db_host = os.getenv("DB_HOST", "localhost")
        db_port = os.getenv("DB_PORT", "5432")
        db_name = os.getenv("DB_NAME", "postgres")
        db_user = os.getenv("DB_USER", "postgres")
        db_password = os.getenv("DB_PASSWORD", "")
        database_url = f"postgresql://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}"

    conn = psycopg2.connect(database_url)
    cursor = conn.cursor()

    try:
        schema_path = os.path.join(os.path.dirname(__file__), "app", "database", "schema.sql")
        print(f"Đang tạo schema từ: {schema_path}")
        with open(schema_path, "r", encoding="utf-8") as f:
            cursor.execute(f.read())

        data_path = os.path.join(os.path.dirname(__file__), "app", "database", "data.sql")
        print(f"Đang seed dữ liệu từ: {data_path}")
        with open(data_path, "r", encoding="utf-8") as f:
            cursor.execute(f.read())

        home_schema_path = os.path.join(os.path.dirname(__file__), "app", "database", "website_database.sql")
        if os.path.exists(home_schema_path):
            print(f"Đang tạo các bảng /home từ: {home_schema_path}")
            with open(home_schema_path, "r", encoding="utf-8") as f:
                cursor.execute(f.read())

        conn.commit()
        print("==================================================")
        print("Khởi tạo và seed toàn bộ database thành công.")
        print("Tài khoản mẫu:")
        print("Admin:    admin_user1 / Admin@123")
        print("Manager:  manager_user1 / Manager@123")
        print("Staff:    staff_user1 / Staff@123")
        print("Driver:   driver_user1 / Driver@123")
        print("Customer: customer_user1 / Customer@123")
        print("==================================================")
    except Exception as e:
        conn.rollback()
        print(f"Có lỗi xảy ra khi seed dữ liệu: {e}")
        raise
    finally:
        cursor.close()
        conn.close()


if __name__ == "__main__":
    seed_database()
