from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from app.schemas.order import OrderListItemResponse, OrderDetailResponse
from app.services.order_service import OrderService
from app.dependencies.order import get_order_service
from app.dependencies.auth import get_current_user

router_order = APIRouter()

@router_order.get("/", response_model=List[OrderListItemResponse])
def get_user_orders(
    current_user: dict = Depends(get_current_user),
    service: OrderService = Depends(get_order_service)
):
    return service.get_user_orders(str(current_user["user_id"]))

@router_order.get("/{order_id_or_code}", response_model=OrderDetailResponse)
def get_user_order_detail(
    order_id_or_code: str,
    current_user: dict = Depends(get_current_user),
    service: OrderService = Depends(get_order_service)
):
    detail = service.get_user_order_detail(order_id_or_code, str(current_user["user_id"]))
    if not detail:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Đơn hàng không tồn tại hoặc bạn không có quyền truy cập."
        )
    return detail

@router_order.post("/{order_id_or_code}/cancel", response_model=dict)
def cancel_user_order(
    order_id_or_code: str,
    current_user: dict = Depends(get_current_user),
    service: OrderService = Depends(get_order_service)
):
    result = service.cancel_user_order(order_id_or_code, str(current_user["user_id"]))
    if not result.get("success"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result.get("message")
        )
    return result
