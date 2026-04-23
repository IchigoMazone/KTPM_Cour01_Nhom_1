from fastapi import APIRouter
from pydantic import BaseModel

router_auth = APIRouter()

class LoginRequest(BaseModel):
    username: str
    password: str

@router_auth.post("/login")
def login(body: LoginRequest):
    return {
        "username": body.username,
        "password": body.password,
        "message": "Đăng nhập thành công."
    }