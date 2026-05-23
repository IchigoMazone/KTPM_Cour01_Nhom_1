from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from app.schemas.booking import BookingCreateRequest, BookingResponse, ServiceResponse
from app.services.booking_service import BookingService
from app.dependencies.booking import get_booking_service
from app.dependencies.auth import get_current_user

router_booking = APIRouter()

@router_booking.get("/services", response_model=List[ServiceResponse])
def get_services(service: BookingService = Depends(get_booking_service)):
    return service.get_services()

@router_booking.post("/", response_model=dict)
def create_booking(
    body: BookingCreateRequest,
    current_user: dict = Depends(get_current_user),
    service: BookingService = Depends(get_booking_service)
):
    profile = current_user.get("profile") or {}
    full_name = profile.get("full_name") or current_user["username"]
    
    result = service.create_booking(
        customer_id=str(current_user["user_id"]),
        customer_name=full_name,
        data=body.dict()
    )
    
    if not result.get("success"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result.get("message", "Không thể tạo lịch hẹn.")
        )
    return result

@router_booking.get("/", response_model=List[BookingResponse])
def get_user_bookings(
    current_user: dict = Depends(get_current_user),
    service: BookingService = Depends(get_booking_service)
):
    return service.get_user_bookings(str(current_user["user_id"]))
