from fastapi import Depends
from app.database.database import get_connection
from app.services.order_service import OrderService

def get_order_service(connect = Depends(get_connection)):
    try:
        yield OrderService(connect)
    finally:
        connect.close()
