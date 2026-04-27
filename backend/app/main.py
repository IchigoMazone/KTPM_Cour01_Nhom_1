from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from app.core.exceptions import validation_exception_handler
from app.api.router import api_router

app = FastAPI(
    title="Server fastAPI",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,    
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {
        "status": "ok",
        "message": "Server đang chạy.",
        "version": "1.0.0"
    }

app.add_exception_handler(
    RequestValidationError,
    validation_exception_handler
)

app.include_router(
    api_router,
    prefix="/api"
)