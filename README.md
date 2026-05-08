# TASK

Daily task app with React, Firebase Authentication, FastAPI, and MongoDB.

## Local Run Commands

Run the backend:

```bash
cd /Users/sanjiv/Desktop/TASK/task/backend
source ../.venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Run the frontend in another terminal:

```bash
cd /Users/sanjiv/Desktop/TASK/task
npm install
npm run dev
```

Open:

```text
http://127.0.0.1:5173
```

Backend health checks:

```text
http://127.0.0.1:8000/api/health
http://127.0.0.1:8000/api/health/db
http://127.0.0.1:8000/api/health/auth
```

## Local Environment Files

Create `.env` in the project root:

```env
VITE_API_BASE_URL=
VITE_FIREBASE_API_KEY=your_firebase_web_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_firebase_web_app_id
```

Create `backend/.env`:

```env
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB=task_app
FRONTEND_ORIGIN=http://127.0.0.1:5173
FIREBASE_PROJECT_ID=code-876cd
FIREBASE_SERVICE_ACCOUNT_JSON=
FIREBASE_SERVICE_ACCOUNT_PATH=/absolute/path/to/firebase-service-account.json
```

For local development you can use `FIREBASE_SERVICE_ACCOUNT_PATH`. For Render deployment, use `FIREBASE_SERVICE_ACCOUNT_JSON`.

## Deploy From GitHub On Render

This repo includes `render.yaml`, so you can deploy both services from GitHub as a Render Blueprint.

1. Push this repo to GitHub.
2. Open Render Dashboard.
3. Click **New > Blueprint**.
4. Connect this GitHub repo.
5. Render will create:
   - `task-api` FastAPI web service
   - `task-frontend` React static site

### Required Render Environment Variables

For `task-api`:

```env
MONGODB_URI=your_mongodb_atlas_connection_string
MONGODB_DB=task_app
FIREBASE_PROJECT_ID=code-876cd
FIREBASE_SERVICE_ACCOUNT_JSON=paste_full_firebase_admin_json_here
```

For `task-frontend`:

```env
VITE_FIREBASE_API_KEY=your_firebase_web_api_key
VITE_FIREBASE_AUTH_DOMAIN=code-876cd.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=code-876cd
VITE_FIREBASE_STORAGE_BUCKET=code-876cd.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=180093755042
VITE_FIREBASE_APP_ID=your_firebase_web_app_id
```

`VITE_API_BASE_URL` is filled automatically from the `task-api` service by `render.yaml`.

## Render Commands

Backend build command:

```bash
pip install -r requirements.txt
```

Backend start command:

```bash
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

Frontend build command:

```bash
npm install && npm run build
```

Frontend publish directory:

```text
dist
```
