import os
from fastapi import APIRouter, Depends
from fastapi import HTTPException, status
from app.schemas.auth import LoginRequest, RegisterRequest, UserMeResponse, ForgotPasswordRequest, ResetPasswordRequest, UpdateMeRequest
from app.services.account_service import AccountService
from app.dependencies.account import get_account_service
from app.dependencies.auth import get_current_user

router_auth = APIRouter()


@router_auth.post("/login")
def login(body: LoginRequest, service: AccountService = Depends(get_account_service)):
    return service.login(body.dict())


@router_auth.post("/register")
def register(body: RegisterRequest, service: AccountService = Depends(get_account_service)):
    return service.register(body.dict())


@router_auth.get("/me", response_model=UserMeResponse)
def get_me(current_user: dict = Depends(get_current_user)):
    return current_user


@router_auth.put("/me", response_model=UserMeResponse)
def update_me(
    body: UpdateMeRequest,
    current_user: dict = Depends(get_current_user),
    service: AccountService = Depends(get_account_service)
):
    result = service.update_me(current_user["user_id"], body.dict(exclude_unset=True))
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy hồ sơ người dùng."
        )
    if result.get("success") is False:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result.get("message", "Không thể cập nhật hồ sơ.")
        )
    return result


@router_auth.post("/forgot-password")
def forgot_password(body: ForgotPasswordRequest, service: AccountService = Depends(get_account_service)):
    return service.forgot_password(body.username, body.email)



@router_auth.post("/reset-password")
def reset_password(body: ResetPasswordRequest, service: AccountService = Depends(get_account_service)):
    return service.reset_password(body.token, body.password)






    
