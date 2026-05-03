from fastapi import APIRouter, Depends, HTTPException, status

from app.auth import get_current_user
from app.database import get_database
from app.schemas import TaskCreate, TaskResponse, TaskUpdate, object_id_from_string, task_from_mongo, utc_now


router = APIRouter(prefix="/api/tasks", tags=["tasks"])


@router.get("", response_model=list[TaskResponse])
async def list_tasks(current_user: dict = Depends(get_current_user)) -> list[TaskResponse]:
    db = get_database()
    cursor = db.tasks.find({"user_id": current_user["uid"]}).sort("created_at", -1)
    tasks = await cursor.to_list(length=100)
    return [task_from_mongo(task) for task in tasks]


@router.post("", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
async def create_task(payload: TaskCreate, current_user: dict = Depends(get_current_user)) -> TaskResponse:
    db = get_database()
    task = {
        "user_id": current_user["uid"],
        "title": payload.title.strip(),
        "date": payload.date,
        "completed": False,
        "created_at": utc_now(),
    }

    result = await db.tasks.insert_one(task)
    created_task = await db.tasks.find_one({"_id": result.inserted_id})
    return task_from_mongo(created_task)


@router.patch("/{task_id}", response_model=TaskResponse)
async def update_task(
    task_id: str,
    payload: TaskUpdate,
    current_user: dict = Depends(get_current_user),
) -> TaskResponse:
    try:
        object_id = object_id_from_string(task_id)
    except ValueError as error:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(error)) from error

    db = get_database()
    query = {"_id": object_id, "user_id": current_user["uid"]}
    await db.tasks.update_one(query, {"$set": {"completed": payload.completed}})
    updated_task = await db.tasks.find_one(query)

    if updated_task is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

    return task_from_mongo(updated_task)


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(task_id: str, current_user: dict = Depends(get_current_user)) -> None:
    try:
        object_id = object_id_from_string(task_id)
    except ValueError as error:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(error)) from error

    db = get_database()
    result = await db.tasks.delete_one({"_id": object_id, "user_id": current_user["uid"]})

    if result.deleted_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
