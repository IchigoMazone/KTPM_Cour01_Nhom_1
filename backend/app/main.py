from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from app.core.exceptions import validation_exception_handler
from app.api.router import api_router
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(
    title="Server fastAPI",
    version="1.0.0"
)

@app.on_event("startup")
def startup_db_init():
    import os
    from app.database.database import get_connection

    conn = get_connection()
    cursor = conn.cursor()
    try:
        db_dir = os.path.join(os.path.dirname(__file__), "database")
        migrations = (
            ("home_inventory_items", "home_staff_inventory_machines.sql", False),
            ("home_inventory_items", "seed_inventory_demo_item.sql", True),
            ("home_services", "home_services.sql", True),
            ("home_orders", "home_orders.sql", True),
            ("home_promotions", "home_promotions.sql", False),
            ("home_finance_records", "home_finance_records.sql", True),
            ("home_support_tickets", "home_support_tickets.sql", True),
            ("home_memos", "home_memos.sql", True),
        )
        for table_name, file_name, always_run in migrations:
            cursor.execute("SELECT to_regclass(%s)", (table_name,))
            if cursor.fetchone()[0] is not None and not always_run:
                continue
            file_path = os.path.join(db_dir, file_name)
            if os.path.exists(file_path):
                print(f"Applying {table_name} migration from {file_path}...")
                with open(file_path, "r", encoding="utf-8") as f:
                    cursor.execute(f.read())
        conn.commit()
    except Exception as e:
        conn.rollback()
        print(f"Error applying home database migrations: {e}")
    finally:
        cursor.close()
        conn.close()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,    
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {
        "status": "ok",
        "message": "Server đang chạy.",
        "version": "1.0.0"
    }

app.add_exception_handler(
    RequestValidationError,
    validation_exception_handler
)

app.include_router(
    api_router,
    prefix="/api"
)
