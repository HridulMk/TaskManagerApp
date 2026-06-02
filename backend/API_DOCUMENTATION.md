# TaskManager Backend API Documentation

Django REST Framework backend with JWT authentication for task management.

---

## Tech Stack

- Django 6.0
- Django REST Framework 3.17
- djangorestframework-simplejwt 5.5
- django-cors-headers 4.9
- SQLite (development)

---

## Base URL

```
http://localhost:8000/api
```

---

## Authentication

All endpoints except `/auth/login/`, `/auth/register/`, and `/auth/refresh/` require JWT authentication.

**Header format:**
```
Authorization: Bearer <access_token>
```

**Token expiry:**
- Access token: 1 day
- Refresh token: 7 days

---

## Endpoints

### Auth

#### `POST /auth/login/`
Authenticate user and receive JWT tokens.

**Request:**
```json
{
  "username": "john",
  "password": "secure123"
}
```

**Response (200):**
```json
{
  "access": "eyJ0eXAiOiJKV...",
  "refresh": "eyJ0eXAiOiJKV..."
}
```

---

#### `POST /auth/register/`
Create a new user account.

**Request:**
```json
{
  "username": "john",
  "email": "john@example.com",
  "password": "secure123"
}
```

**Response (201):**
```json
{
  "id": 1,
  "username": "john",
  "email": "john@example.com"
}
```

**Validation:**
- `username`: required, unique
- `password`: min 8 characters
- `email`: optional, valid email format

---

#### `POST /auth/refresh/`
Refresh an expired access token using a refresh token.

**Request:**
```json
{
  "refresh": "eyJ0eXAiOiJKV..."
}
```

**Response (200):**
```json
{
  "access": "eyJ0eXAiOiJKV..."
}
```

---

#### `GET /auth/profile/`
Get authenticated user's profile.

**Response (200):**
```json
{
  "id": 1,
  "username": "john",
  "email": "john@example.com"
}
```

---

#### `POST /auth/change-password/`
Change the authenticated user's password.

**Request:**
```json
{
  "old_password": "secure123",
  "new_password": "newsecure456"
}
```

**Response (200):**
```json
{
  "detail": "Password updated successfully."
}
```

**Errors:**
- `400`: Old password incorrect
- `400`: New password validation failed (min 8 chars, not too common, etc.)

---

### Tasks

#### `GET /tasks/`
List all tasks for authenticated user with optional filters.

**Query parameters:**
- `status` (optional): `todo`, `in_progress`, or `completed`
- `priority` (optional): `low`, `medium`, or `high`
- `search` (optional): search in title and description
- `ordering` (optional): sort by `created_at`, `due_date`, `status`, or `priority` (prefix with `-` for descending)

**Example:**
```
GET /tasks/?status=todo&priority=high&ordering=-created_at
```

**Response (200):**
```json
[
  {
    "id": 1,
    "title": "Complete project documentation",
    "description": "Write comprehensive API docs",
    "status": "in_progress",
    "priority": "high",
    "due_date": "2024-12-31",
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-16T14:20:00Z"
  }
]
```

---

#### `POST /tasks/`
Create a new task.

**Request:**
```json
{
  "title": "Review pull request",
  "description": "Check code quality and tests",
  "status": "todo",
  "priority": "medium",
  "due_date": "2024-12-20"
}
```

**Response (201):**
```json
{
  "id": 2,
  "title": "Review pull request",
  "description": "Check code quality and tests",
  "status": "todo",
  "priority": "medium",
  "due_date": "2024-12-20",
  "created_at": "2024-01-17T09:00:00Z",
  "updated_at": "2024-01-17T09:00:00Z"
}
```

**Validation:**
- `title`: required, max 255 chars
- `description`: optional
- `status`: optional, defaults to `todo`, choices: `todo`, `in_progress`, `completed`
- `priority`: optional, defaults to `medium`, choices: `low`, `medium`, `high`
- `due_date`: optional, format `YYYY-MM-DD`, accepts empty string as `null`

---

#### `GET /tasks/{id}/`
Retrieve a single task by ID (must belong to authenticated user).

**Response (200):**
```json
{
  "id": 1,
  "title": "Complete project documentation",
  "description": "Write comprehensive API docs",
  "status": "completed",
  "priority": "high",
  "due_date": null,
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-18T16:45:00Z"
}
```

**Errors:**
- `404`: Task not found or doesn't belong to user

---

#### `PATCH /tasks/{id}/`
Update a task (partial update).

**Request:**
```json
{
  "status": "completed",
  "priority": "low"
}
```

**Response (200):**
```json
{
  "id": 1,
  "title": "Complete project documentation",
  "description": "Write comprehensive API docs",
  "status": "completed",
  "priority": "low",
  "due_date": null,
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-18T16:50:00Z"
}
```

---

#### `PUT /tasks/{id}/`
Replace a task (full update, all fields required except read-only).

---

#### `DELETE /tasks/{id}/`
Delete a task.

**Response (204):** No content

---

#### `GET /tasks/stats/`
Get task statistics for authenticated user (computed on backend).

**Response (200):**
```json
{
  "total": 12,
  "todo": 4,
  "in_progress": 3,
  "completed": 5,
  "high": 2,
  "medium": 7,
  "low": 3
}
```

---

## Error Responses

All errors follow this structure:

**400 Bad Request:**
```json
{
  "field_name": ["Error message"]
}
```

**401 Unauthorized:**
```json
{
  "detail": "Authentication credentials were not provided."
}
```

**403 Forbidden:**
```json
{
  "detail": "You do not have permission to perform this action."
}
```

**404 Not Found:**
```json
{
  "detail": "Not found."
}
```

---

## Running the Server

```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
# or
source venv/bin/activate  # Unix/macOS

pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser  # Optional: for admin panel
python manage.py runserver
```

Server runs at `http://localhost:8000`

Admin panel at `http://localhost:8000/admin/`

---

## Database Schema

### User (Django built-in)
- `id`: Integer (PK)
- `username`: String (unique)
- `email`: String
- `password`: Hashed string

### Task
- `id`: Integer (PK)
- `user`: ForeignKey → User
- `title`: String (max 255)
- `description`: Text
- `status`: Enum (`todo`, `in_progress`, `completed`)
- `priority`: Enum (`low`, `medium`, `high`)
- `due_date`: Date (nullable)
- `created_at`: DateTime (auto)
- `updated_at`: DateTime (auto)

---

## CORS Configuration

Development: All origins allowed (`CORS_ALLOW_ALL_ORIGINS = True`)

Production: Set `CORS_ALLOWED_ORIGINS` in `settings.py`

---

## Security Notes

- `SECRET_KEY` is hardcoded — **change in production**
- `DEBUG = True` — set to `False` in production
- `ALLOWED_HOSTS = ['*']` — restrict in production
- Use HTTPS in production
- Set strong `SECRET_KEY` via environment variable
- Configure CORS properly for production domain
