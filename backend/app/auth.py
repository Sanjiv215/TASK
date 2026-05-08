import asyncio
import json

import firebase_admin
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from firebase_admin import auth as firebase_auth
from firebase_admin import credentials

from app.config import settings


bearer_scheme = HTTPBearer(auto_error=False)


def initialize_firebase() -> None:
    if firebase_admin._apps:
        return

    if settings.firebase_service_account_json:
        service_account_info = json.loads(settings.firebase_service_account_json)
        credential = credentials.Certificate(service_account_info)
        firebase_admin.initialize_app(credential, {"projectId": settings.firebase_project_id})
        return

    if settings.firebase_service_account_path:
        credential = credentials.Certificate(settings.firebase_service_account_path)
        firebase_admin.initialize_app(credential, {"projectId": settings.firebase_project_id})
        return

    firebase_admin.initialize_app(options={"projectId": settings.firebase_project_id})


def get_firebase_auth_status() -> dict[str, str | bool]:
    has_service_account_json = bool(settings.firebase_service_account_json)
    has_service_account_path = bool(settings.firebase_service_account_path)

    return {
        "status": "configured" if has_service_account_json or has_service_account_path else "missing_credentials",
        "project_id": settings.firebase_project_id,
        "has_service_account_json": has_service_account_json,
        "has_service_account_path": has_service_account_path,
    }


async def get_current_user(
    credentials_value: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
) -> dict:
    if credentials_value is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing Firebase token",
        )

    try:
        decoded_token = await asyncio.to_thread(
            firebase_auth.verify_id_token,
            credentials_value.credentials,
        )
    except Exception as error:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid Firebase token: {error}",
        ) from error

    return decoded_token
