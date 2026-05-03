from datetime import datetime, timezone

from bson import ObjectId
from pydantic import BaseModel, ConfigDict, Field


class TaskCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=240)
    date: str = Field(..., min_length=1)


class TaskUpdate(BaseModel):
    completed: bool


class TaskResponse(BaseModel):
    id: str
    title: str
    date: str
    completed: bool
    user_id: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


def task_from_mongo(task: dict) -> TaskResponse:
    return TaskResponse(
        id=str(task["_id"]),
        title=task["title"],
        date=task["date"],
        completed=task.get("completed", False),
        user_id=task["user_id"],
        created_at=task["created_at"],
    )


def object_id_from_string(task_id: str) -> ObjectId:
    if not ObjectId.is_valid(task_id):
        raise ValueError("Invalid task id")

    return ObjectId(task_id)
