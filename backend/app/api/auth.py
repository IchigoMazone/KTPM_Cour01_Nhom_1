import os
from fastapi import APIRouter, Depends
from fastapi import HTTPException, status
from app.schemas.auth import LoginRequest, RegisterRequest, UserMeResponse, ForgotPasswordRequest, ResetPasswordRequest, GoogleLoginRequest, UpdateMeRequest
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


@router_auth.post("/google")
def google_login(body: GoogleLoginRequest, service: AccountService = Depends(get_account_service)):
    # 1. Hỗ trợ Mock Token để kiểm thử tự động offline / phát triển
    if body.id_token.startswith("mock_google_token_"):
        email = f"{body.id_token.replace('mock_google_token_', '')}@gmail.com"
        full_name = "Người dùng Thử nghiệm Google"
        return service.login_or_register_google(email, full_name)

    # 2. Thực thi xác thực Google Token thực tế
    google_client_id = body.client_id or os.getenv("GOOGLE_CLIENT_ID", "")
    if (
        not google_client_id
        or "mockclientid" in google_client_id
        or "REPLACE_WITH" in google_client_id
        or not google_client_id.endswith(".apps.googleusercontent.com")
    ):
        return {
            "success": False,
            "message": "Chưa cấu hình GOOGLE_CLIENT_ID thật cho đăng nhập Google."
        }

    try:
        from google.oauth2 import id_token
        from google.auth.transport import requests as google_requests

        id_info = id_token.verify_oauth2_token(
            body.id_token,
            google_requests.Request(),
            google_client_id
        )

        email = id_info.get("email")
        full_name = id_info.get("name") or email
        if not email:
            return {
                "success": False,
                "message": "Google không trả về email tài khoản."
            }

        return service.login_or_register_google(email, full_name)
    except Exception as e:
        return {
            "success": False,
            "message": f"Xác thực Google ID Token thất bại: {str(e)}"
        }



    
