import logging
from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

logger = logging.getLogger(__name__)


def register_exception_handlers(app: FastAPI) -> None:
    """Register custom exception handlers to ensure consistent error response shape:
    {
        "detail": str,
        "status_code": int
    }
    """
    
    @app.exception_handler(StarletteHTTPException)
    async def http_exception_handler(request: Request, exc: StarletteHTTPException) -> JSONResponse:
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "detail": exc.detail if isinstance(exc.detail, str) else str(exc.detail),
                "status_code": exc.status_code,
            },
        )

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
        error_messages = []
        for error in exc.errors():
            loc = " -> ".join([str(loc_item) for loc_item in error.get("loc", []) if loc_item != "body"])
            msg = error.get("msg", "Invalid value")
            if loc:
                error_messages.append(f"{loc}: {msg}")
            else:
                error_messages.append(msg)
        
        detail_message = "; ".join(error_messages) if error_messages else "Request validation failed"
        
        return JSONResponse(
            status_code=422,
            content={
                "detail": detail_message,
                "status_code": 422,
            },
        )

    @app.exception_handler(Exception)
    async def generic_exception_handler(request: Request, exc: Exception) -> JSONResponse:
        logger.error(f"Unhandled exception: {exc}", exc_info=True)
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "detail": "Internal server error",
                "status_code": status.HTTP_500_INTERNAL_SERVER_ERROR,
            },
        )
