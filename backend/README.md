# TASK FastAPI Backend

This backend stores daily tasks in MongoDB.

## 1. Create a virtual environment

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
```

## 2. Install dependencies

```bash
pip install -r requirements.txt
```

## 3. Configure MongoDB

Copy the example environment file:

```bash
cp .env.example .env
```

For local MongoDB, keep:

```bash
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB=task_app
```

For MongoDB Atlas, replace `MONGODB_URI` with your Atlas connection string.

## 4. Configure Firebase Admin

The backend verifies Firebase login tokens before reading or writing tasks.

In Firebase Console:

1. Open Project Settings.
2. Open Service accounts.
3. Click Generate new private key.
4. Save the JSON file somewhere outside Git, for example:

```text
/Users/sanjiv/Desktop/TASK/firebase-service-account.json
```

Then set this in `backend/.env`:

```bash
FIREBASE_SERVICE_ACCOUNT_PATH=/Users/sanjiv/Desktop/TASK/firebase-service-account.json
```

## 5. Run the API

```bash
uvicorn app.main:app --reload
```

The API runs at:

```text
http://127.0.0.1:8000
```

## Routes

```text
GET    /api/health
GET    /api/tasks
POST   /api/tasks
PATCH  /api/tasks/{task_id}
DELETE /api/tasks/{task_id}
```

Task routes require:

```text
Authorization: Bearer <Firebase ID token>
```

## Frontend Connection

Vite proxies `/api` requests to `http://127.0.0.1:8000`, so the React app can call `/api/tasks` directly during development. The React app gets the Firebase ID token from the logged-in user and sends it with each task request.
