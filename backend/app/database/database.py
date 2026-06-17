import psycopg2
from psycopg2.extras import register_uuid
from psycopg2.pool import ThreadedConnectionPool
import os
from threading import Lock
from dotenv import load_dotenv

load_dotenv()
register_uuid()

_pool = None
_pool_lock = Lock()


def _connection_config():
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

    return db_url, sslmode, channel_binding


class PooledConnection:
    def __init__(self, pool, connection):
        self._pool = pool
        self._connection = connection
        self._returned = False

    def __getattr__(self, name):
        return getattr(self._connection, name)

    def close(self):
        if self._returned:
            return

        should_close = bool(self._connection.closed)
        if not should_close:
            try:
                self._connection.rollback()
            except Exception:
                should_close = True

        self._pool.putconn(self._connection, close=should_close)
        self._returned = True


def _get_pool():
    global _pool
    if _pool is None:
        with _pool_lock:
            if _pool is None:
                db_url, sslmode, channel_binding = _connection_config()
                minconn = max(1, int(os.getenv("DB_POOL_MIN", "1")))
                maxconn = max(minconn, int(os.getenv("DB_POOL_MAX", "10")))
                _pool = ThreadedConnectionPool(
                    minconn,
                    maxconn,
                    db_url,
                    sslmode=sslmode,
                    channel_binding=channel_binding,
                )
    return _pool


def get_connection():
    if os.getenv("DB_POOL_ENABLED", "true").lower() in {"0", "false", "no"}:
        db_url, sslmode, channel_binding = _connection_config()
        return psycopg2.connect(
            db_url,
            sslmode=sslmode,
            channel_binding=channel_binding,
        )

    pool = _get_pool()
    return PooledConnection(pool, pool.getconn())
