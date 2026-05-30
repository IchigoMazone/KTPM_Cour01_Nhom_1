import os
from fastapi import APIRouter, Depends, UploadFile, File
from fastapi import HTTPException, status
from app.schemas.auth import LoginRequest, RegisterRequest, UserMeResponse, ForgotPasswordRequest, RefreshTokenRequest, ResetPasswordRequest, UpdateMeRequest
from app.services.account_service import AccountService
from app.dependencies.account import get_account_service
from app.dependencies.auth import get_current_user
from app.utils.r2 import upload_file_to_r2

router_auth = APIRouter()


@router_auth.post("/login")
def login(body: LoginRequest, service: AccountService = Depends(get_account_service)):
    return service.login(body.dict())


@router_auth.post("/register")
def register(body: RegisterRequest, service: AccountService = Depends(get_account_service)):
    return service.register(body.dict())


@router_auth.post("/refresh")
def refresh(body: RefreshTokenRequest, service: AccountService = Depends(get_account_service)):
    result = service.refresh_access_token(body.refresh_token)
    if not result.get("success"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=result.get("message", "Refresh token không hợp lệ.")
        )
    return result


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


@router_auth.post("/upload-avatar")
async def upload_avatar(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
    service: AccountService = Depends(get_account_service)
):
    try:
        contents = await file.read()
        if not file.content_type.startswith("image/"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Tập tin không phải là hình ảnh hợp lệ."
            )
        
        public_url = upload_file_to_r2(contents, file.filename, file.content_type)
        
        result = service.update_me(current_user["user_id"], {"image_url": public_url})
        if not result:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Không tìm thấy hồ sơ người dùng."
            )
        
        return {
            "success": True,
            "message": "Cập nhật ảnh đại diện thành công.",
            "image_url": public_url,
            "user": result
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi khi tải ảnh lên Cloudflare R2: {str(e)}"
        )


@router_auth.post("/forgot-password")
def forgot_password(body: ForgotPasswordRequest, service: AccountService = Depends(get_account_service)):
    return service.forgot_password(body.username, body.email)



@router_auth.post("/reset-password")
def reset_password(body: ResetPasswordRequest, service: AccountService = Depends(get_account_service)):
    return service.reset_password(body.token, body.password)






    
