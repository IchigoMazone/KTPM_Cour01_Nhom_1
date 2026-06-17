from fastapi import APIRouter
from app.api.auth import router_auth
from app.api.home import router_home

api_router = APIRouter()

api_router.include_router(
    router_auth, prefix="/auth"
)

api_router.include_router(
    router_home, prefix="/home"
)
