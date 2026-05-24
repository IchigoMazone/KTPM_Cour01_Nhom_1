import psycopg2
from psycopg2.extras import register_uuid
import os
from dotenv import load_dotenv

load_dotenv()
register_uuid()

def get_connection():
    db_url = os.getenv("DATABASE_URL", "")
    if not db_url:
        db_host = os.getenv("DB_HOST", "localhost")
        db_port = os.getenv("DB_PORT", "5432")
        db_name = os.getenv("DB_NAME", "postgres")
        db_user = os.getenv("DB_USER", "postgres")
        db_password = os.getenv("DB_PASSWORD", "")
        db_url = f"postgresql://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}"

    sslmode = os.getenv("DB_SSLMODE", "require")
    channel_binding = os.getenv("DB_CHANNEL_BINDING", "require")
    
    # Bỏ bắt buộc SSL nếu đang chạy kết nối cục bộ (localhost/127.0.0.1) để phát triển local
    if "localhost" in db_url or "127.0.0.1" in db_url:
        sslmode = "prefer"
        channel_binding = "prefer"
        
    return psycopg2.connect(
        db_url,
        sslmode=sslmode,
        channel_binding=channel_binding
    )