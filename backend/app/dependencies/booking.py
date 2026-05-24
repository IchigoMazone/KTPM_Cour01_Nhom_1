from fastapi import Depends
from app.database.database import get_connection
from app.services.booking_service import BookingService

def get_booking_service(connect = Depends(get_connection)):
    try:
        yield BookingService(connect)
    finally:
        connect.close()
