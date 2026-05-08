from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    mongodb_uri: str = "mongodb://localhost:27017"
    mongodb_db: str = "task_app"
    frontend_origin: str = "http://127.0.0.1:5173"
    firebase_project_id: str = "code-876cd"
    firebase_service_account_json: str = ""
    firebase_service_account_path: str = ""

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")


settings = Settings()
