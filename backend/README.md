# Task Management Dashboard - Backend API

FastAPI-powered RESTful API for the Task Management Dashboard. Provides CRUD task operations, status/priority filtering, text search, sorting, pagination, and dashboard summary statistics.

## Tech Stack
- **Framework:** FastAPI (Python 3.10+)
- **ORM:** SQLAlchemy 2.0
- **Validation:** Pydantic v2
- **Database:** SQLite (local dev) / PostgreSQL (production-ready via `DATABASE_URL`)
- **Testing:** Pytest + HTTPX

---

## Folder Structure

```
backend/
├── app/
│   ├── core/            # Configuration, database session, exception handling
│   │   ├── config.py
│   │   ├── database.py
│   │   └── exceptions.py
│   ├── models/          # SQLAlchemy ORM models
│   │   └── task.py
│   ├── schemas/         # Pydantic validation & response schemas
│   │   └── task_schema.py
│   ├── services/        # Database queries & business logic
│   │   └── task_service.py
│   ├── routes/          # API route definitions
│   │   └── task_routes.py
│   └── __init__.py
├── tests/               # Pytest suite
│   ├── __init__.py
│   └── test_tasks.py
├── .env.example
├── .env
├── requirements.txt
├── README.md
└── main.py
```

---

## Getting Started

### 1. Prerequisites
- Python 3.10+ installed
- `pip` package manager

### 2. Create and Activate a Virtual Environment

**Windows (PowerShell):**
```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
```

**macOS/Linux:**
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

To switch from SQLite to PostgreSQL, update `DATABASE_URL` in `.env`:
```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/taskdb
```

### 5. Run the Server
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```
- API Base URL: `http://localhost:8000`
- Interactive Swagger Docs: `http://localhost:8000/docs`
- Alternative ReDoc: `http://localhost:8000/redoc`

---

## API Endpoints

Base URL: `/api/v1`

| Method | Endpoint | Description | Status Codes |
|---|---|---|---|
| `GET` | `/tasks` | List tasks with filters, search, sort, pagination | `200` |
| `GET` | `/tasks/summary` | Summary counts (`total`, `todo`, `in_progress`, `completed`, `high_priority`) | `200` |
| `GET` | `/tasks/{id}` | Retrieve single task | `200`, `404` |
| `POST` | `/tasks` | Create a task | `201`, `422` |
| `PUT` | `/tasks/{id}` | Update task (full or partial) | `200`, `404`, `422` |
| `DELETE` | `/tasks/{id}` | Delete a task | `204`, `404` |

### Query Parameters for `GET /api/v1/tasks`
- `status`: `Todo`, `In Progress`, `Completed`
- `priority`: `Low`, `Medium`, `High`
- `search`: Case-insensitive title match
- `sort_by`: `title`, `priority`, `status`, `due_date`, `created_at` (default: `created_at`)
- `sort_order`: `asc`, `desc` (default: `desc`)
- `page`: Page number (min: 1, default: 1)
- `page_size`: Items per page (min: 1, max: 100, default: 10)

### Uniform Error Response
All errors follow the consistent envelope:
```json
{
  "detail": "Task with ID '...' not found",
  "status_code": 404
}
```

---

## Running Tests
```bash
pytest tests/ -v
```
