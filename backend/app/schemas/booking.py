from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import date, datetime

class BookingCreateRequest(BaseModel):
    service_id: UUID
    pickup_date: date
    time_slot: str
    phone: str
    address: str
    notes: Optional[str] = None

class ServiceResponse(BaseModel):
    service_id: UUID
    name: str
    description: Optional[str] = None
    unit_type: str
    base_price: float
    turnaround_hours: int

class BookingResponse(BaseModel):
    booking_id: UUID
    customer_id: UUID
    service_id: Optional[UUID] = None
    service_name: Optional[str] = None
    pickup_date: date
    time_slot: str
    contact_name: Optional[str] = None
    phone: Optional[str] = None
    address: str
    estimated_weight: Optional[float] = None
    estimated_price: float
    status: str
    notes: Optional[str] = None
    created_at: datetime
