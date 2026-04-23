from fastapi import APIRouter
from app.api.auth import router_auth

api_router = APIRouter()

api_router.include_router(
    router_auth, prefix="/auth"
)