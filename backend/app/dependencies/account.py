from fastapi import Depends
from app.database.database import get_connection
from app.services.account_service import AccountService

def get_account_service(connect = Depends(get_connection)):
    try:
        yield AccountService(connect)
    finally:
        connect.close()