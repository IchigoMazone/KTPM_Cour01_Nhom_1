from fastapi import Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

async def validation_exception_handler(request, exc: RequestValidationError):
    err = exc.errors()[0]  
    return JSONResponse(
        status_code=422,
        content={
            "success": False,
            "message": str(err["msg"]).replace("Value error, ", "")
        }
    )