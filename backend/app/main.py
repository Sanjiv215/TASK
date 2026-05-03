from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.auth import get_firebase_auth_status, initialize_firebase
from app.config import settings
from app.database import close_mongo_connection, connect_to_mongo, get_database
from app.routes import router as task_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    initialize_firebase()
    await connect_to_mongo()
    yield
    await close_mongo_connection()


app = FastAPI(title="TASK API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_origin, "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(task_router)


@app.get("/api/health")
async def health_check() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/api/health/db")
async def database_health_check() -> dict[str, str | int]:
    db = get_database()
    await db.command("ping")
    task_count = await db.tasks.count_documents({})

    return {
        "status": "ok",
        "database": settings.mongodb_db,
        "tasks": task_count,
    }


@app.get("/api/health/auth")
async def auth_health_check() -> dict[str, str | bool]:
    return get_firebase_auth_status()
