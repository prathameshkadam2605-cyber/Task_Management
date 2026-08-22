from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import Base, engine
from app.core.exceptions import register_exception_handlers
from app.routes.task_routes import router as task_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database tables on startup
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="RESTful API for the Task Management Dashboard, supporting full task lifecycle management, filtering, searching, sorting, pagination, and dashboard statistics.",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS if isinstance(settings.CORS_ORIGINS, list) else [settings.CORS_ORIGINS],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register uniform error response handlers
register_exception_handlers(app)

# Register API routes under /api/v1
app.include_router(task_router, prefix=settings.API_V1_PREFIX)


@app.get("/", tags=["Health"], summary="API Root / Health Check")
def health_check():
    return {
        "status": "online",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "docs": "/docs",
        "api_v1": settings.API_V1_PREFIX,
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
