import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()
db_url = os.getenv("DATABASE_URL")
try:
    conn = psycopg2.connect(db_url)
    cur = conn.cursor()
    cur.execute("ALTER TABLE accounts ADD COLUMN IF NOT EXISTS page_size INTEGER DEFAULT 10;")
    cur.execute("ALTER TABLE accounts ADD COLUMN IF NOT EXISTS table_resize_mode VARCHAR(20) DEFAULT 'fit';")
    cur.execute("ALTER TABLE accounts ADD COLUMN IF NOT EXISTS columns_config TEXT DEFAULT '{}';")
    conn.commit()
    print("Success adding columns to accounts!")
    
    # Let's verify by describing the table
    cur.execute("SELECT * FROM accounts LIMIT 1;")
    row = cur.fetchone()
    print("New Accounts Columns:", [desc[0] for desc in cur.description])
    
    cur.close()
    conn.close()
except Exception as e:
    print("Error:", e)
