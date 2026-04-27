from app.database.database import get_connection

conn = get_connection()
curr =  conn.cursor()
curr.execute("SELECT * FROM accounts")
print(curr.fetchall())
curr.close()
conn.close()
