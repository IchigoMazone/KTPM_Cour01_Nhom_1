from pydantic import BaseModel
from typing import List, Optional
from uuid import UUID

class OrderListItemResponse(BaseModel):
    order_id: UUID
    code: str
    date: str
    service: str
    total: str
    status: str
    status_display: str
    tone: str
    total_amount: float

class OrderItemResponse(BaseModel):
    name: str
    qty: str
    price: str

class TimelineEventResponse(BaseModel):
    stage: str
    time: str
    status: str
    desc: str

class OrderDetailResponse(BaseModel):
    code: str
    customerName: str
    phone: str
    address: str
    paymentMethod: str
    notes: Optional[str] = None
    weight: Optional[str] = None
    total: str
    status: str
    status_display: str
    tone: str
    items: List[OrderItemResponse]
    timeline: List[TimelineEventResponse]
