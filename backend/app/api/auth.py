from fastapi import APIRouter, Depends
from app.schemas.auth import LoginRequest
from app.services.account_service import AccountService
from app.dependencies.account import get_account_service

router_auth = APIRouter()


@router_auth.post("/login")
def login(body: LoginRequest, service: AccountService = Depends(get_account_service)):
    return service.login(body.dict())


    