# Product Requirements Document (PRD)
## Task Management Dashboard — Full Stack Interview Project

**Version:** 1.0
**Owner:** [Your Name]
**Status:** Draft — Ready for Development
**Build Tool:** Antigravity (agentic IDE)
**Build Strategy:** Phased delivery (Backend → Frontend Core → UI Polish → Bonus Features)

---

## 1. Overview

The Task Management Dashboard is a full-stack web application that allows a user to create, view, update, delete, filter, and search personal tasks. It demonstrates REST API design, relational data modeling, and a modern, responsive React/Next.js frontend.

The application consists of two independently deployable services:

| Service | Stack |
|---|---|
| Backend | Python + FastAPI + SQLAlchemy + SQLite (PostgreSQL-ready) |
| Frontend | Next.js (App Router) + TypeScript + Tailwind CSS + shadcn/ui |

---

## 2. Goals & Success Criteria

- Fully functional CRUD REST API with validation and proper HTTP error handling.
- A responsive, professional dashboard UI usable on both desktop and mobile.
- Clean separation of concerns (models / schemas / routes / services on backend; components / services / types on frontend).
- Auto-generated API documentation (Swagger/OpenAPI via FastAPI).
- Codebase that is easy to extend with the bonus features (auth, theming, drag-and-drop, pagination, tests, Docker) without major rework.

**Non-goals (v1):** multi-user collaboration, real-time sync/websockets, notifications, file attachments.

---

## 3. Tech Stack

| Area | Choice | Notes |
|---|---|---|
| Backend framework | FastAPI | Async, auto Swagger docs, Pydantic validation |
| ORM | SQLAlchemy | With Alembic for migrations (optional bonus) |
| Database | SQLite (dev) → PostgreSQL (prod-ready via env var) | Use `DATABASE_URL` env variable so swapping is a one-line change |
| Validation | Pydantic v2 schemas | Separate `Create`, `Update`, `Read` schemas |
| Frontend framework | Next.js 14+ (App Router) | TypeScript strict mode |
| Styling | Tailwind CSS + shadcn/ui components | Matches the "clean admin table" reference (Image 2) |
| State management | React Query (TanStack Query) for server state; local `useState`/Zustand for UI state (modals, filters) | |
| Forms | React Hook Form + Zod validation | Mirrors backend Pydantic rules |
| Icons | lucide-react | |
| HTTP client | `fetch` wrapped in a typed `services/taskService.ts` | |

---

## 4. Data Model

### Task

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | UUID | Auto | Primary key |
| `title` | String (max 200) | Yes | |
| `description` | Text | No | |
| `priority` | Enum: `Low`, `Medium`, `High` | Yes | |
| `status` | Enum: `Todo`, `In Progress`, `Completed` | Yes | Default: `Todo` |
| `due_date` | Date | No | |
| `created_at` | Datetime | Auto | Server-set on create |
| `updated_at` | Datetime | Auto | Server-set on update |

### Validation Rules
- `title`: required, 1–200 chars, trimmed, cannot be empty/whitespace.
- `description`: optional, max 2000 chars.
- `priority`: must be one of the enum values (reject anything else with 422).
- `status`: must be one of the enum values.
- `due_date`: must be a valid ISO date if provided; no restriction on past dates (user may log overdue tasks).

---

## 5. Backend API Specification

Base URL: `/api/v1`

| Method | Endpoint | Purpose | Success | Errors |
|---|---|---|---|---|
| GET | `/tasks` | List tasks (supports query params) | 200 | 500 |
| GET | `/tasks/{id}` | Get single task | 200 | 404 |
| POST | `/tasks` | Create task | 201 | 422 |
| PUT | `/tasks/{id}` | Update task (full or partial) | 200 | 404, 422 |
| DELETE | `/tasks/{id}` | Delete task | 204 | 404 |

### Query Parameters for `GET /tasks`
- `status` — filter by status
- `priority` — filter by priority
- `search` — case-insensitive match on `title`
- `page`, `page_size` — pagination (bonus)
- `sort_by`, `sort_order` — e.g. `due_date`, `asc`/`desc`

### Response Envelope (list endpoint)
```json
{
  "items": [ { "id": "...", "title": "...", "...": "..." } ],
  "total": 24,
  "page": 1,
  "page_size": 10
}
```

### Error Response Shape (consistent across all endpoints)
```json
{
  "detail": "Task not found",
  "status_code": 404
}
```
Use FastAPI's built-in `HTTPException` + a custom exception handler so all errors follow this shape, including Pydantic validation errors (422).

### Summary/Stats Endpoint (supports dashboard cards)
| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/tasks/summary` | Returns `{ total, todo, in_progress, completed, high_priority }` |

---

## 6. Backend Folder Structure

```
backend/
├── app/
│   ├── models/          # SQLAlchemy models (task.py)
│   ├── schemas/         # Pydantic schemas (task_schema.py)
│   ├── routes/          # API routers (task_routes.py)
│   ├── services/        # Business logic / DB queries (task_service.py)
│   ├── core/            # config.py, database.py, exceptions.py
│   └── __init__.py
├── tests/                # Bonus: pytest unit tests
├── requirements.txt
├── .env.example
└── main.py
```

---

## 7. Frontend Requirements

### 7.1 Design Direction
Reference images provided define the visual language:
- **Image 2 (Shadcn Admin)** → primary pattern for the **Task List** page: clean data table, filter pills for Status/Priority, search input, "Create" button top-right, row action menu (⋯) with Edit/Delete.
- **Image 1 (G.Take)** → visual polish for the **Dashboard** page: rounded stat cards, subtle gradients, greeting header, progress/activity widgets — adapted to a light, professional theme (or optional dark mode toggle).
- **Image 3 (Taskmanly)** → reference only for the **bonus Kanban/drag-and-drop view** (status columns: Todo / In Progress / Completed).

Candidate should NOT copy any image pixel-for-pixel — build an original clean UI inspired by these patterns, using shadcn/ui primitives (Card, Table, Dialog, Badge, DropdownMenu, Select, Input).

### 7.2 Pages

| Page | Route | Description |
|---|---|---|
| Dashboard | `/` | Summary stat cards + recent tasks preview |
| Task List | `/tasks` | Full table/card list with filters, search, pagination |
| Task Details | `/tasks/[id]` | Full detail view of a single task |
| Create/Edit Task | Modal (Dialog), not a separate route | Opened from Task List or Dashboard |

### 7.3 Dashboard Requirements
Summary cards (data from `/tasks/summary`):
- Total Tasks
- Todo
- In Progress
- Completed
- High Priority

### 7.4 Task List Requirements
- Table (desktop) that collapses to stacked cards (mobile) — CSS/responsive, not two separate components if avoidable.
- Columns: Title, Priority (badge, color-coded), Status (badge), Due Date, Created At, Actions.
- Filter by Status (dropdown/select).
- Filter by Priority (dropdown/select).
- Search by title (debounced input, ~300ms).
- Empty state when no tasks match filters.
- Loading skeleton state while fetching.
- Delete requires a confirmation dialog (AlertDialog).

### 7.5 Create/Edit Task Modal
- Fields: Title (required), Description (textarea), Priority (select), Status (select), Due Date (date picker).
- Client-side validation via Zod, mirroring backend rules.
- Optimistic UI update or refetch via React Query on success.
- Toast notification on success/error.

### 7.6 Frontend Folder Structure

```
frontend/
├── app/
│   ├── page.tsx                # Dashboard
│   ├── tasks/
│   │   ├── page.tsx             # Task List
│   │   └── [id]/page.tsx        # Task Details
│   └── layout.tsx
├── components/
│   ├── ui/                      # shadcn primitives
│   ├── dashboard/                # StatCard, ActivityWidget
│   ├── tasks/                    # TaskTable, TaskCard, TaskFormModal, TaskFilters, DeleteConfirmDialog
│   └── layout/                   # Sidebar, Topbar
├── services/
│   └── taskService.ts            # typed fetch wrapper for all API calls
├── types/
│   └── task.ts                   # Task, Priority, Status types
├── lib/
│   └── utils.ts
└── package.json
```

---

## 8. Non-Functional Requirements
- Fully responsive: desktop (≥1024px), tablet, mobile (≤640px).
- Accessible: proper labels, keyboard-navigable modals, sufficient color contrast on badges.
- Loading and error states handled gracefully everywhere data is fetched.
- CORS configured on backend to allow the Next.js dev origin.
- Environment-based config (`.env` for both frontend and backend) — no hardcoded URLs.

---

## 9. Bonus Features (Post-MVP, build only after core is stable)
1. JWT authentication (login/register, protected routes, protected API endpoints).
2. Dark/Light theme toggle (Tailwind `dark:` classes + `next-themes`).
3. Drag-and-drop status change (Kanban view, `@dnd-kit/core`), inspired by Image 3.
4. Pagination on Task List (backend already supports `page`/`page_size`).
5. Unit tests for API (pytest + httpx `TestClient`).
6. Docker setup (`docker-compose.yml` with backend, frontend, and Postgres services).

---

## 10. Phased Build Plan

| Phase | Scope |
|---|---|
| **Phase 1** | Backend: project scaffold, DB models, schemas, CRUD routes, validation, error handling, Swagger docs |
| **Phase 2** | Frontend: project scaffold, API service layer, Task List page (table + filters + search), Create/Edit modal, Delete confirmation |
| **Phase 3** | Dashboard page with summary stat cards, Task Details page, responsive/mobile polish, loading & empty states |
| **Phase 4** | Bonus features: auth, theming, drag-and-drop, pagination, tests, Docker |
| **Phase 5** | README, API docs export (Postman/Swagger), screenshots, final cleanup, commit history review |

---

## 11. Deliverables Checklist
- [ ] GitHub repository (backend + frontend, clean commit history — one logical change per commit)
- [ ] README with setup instructions (backend `.env`, `pip install`, `uvicorn`; frontend `npm install`, `npm run dev`)
- [ ] API documentation (Swagger UI auto-generated at `/docs`, or exported Postman collection)
- [ ] Screenshots of Dashboard, Task List, Create/Edit modal, mobile view
- [ ] `.env.example` files for both services

---

## 12. Acceptance Criteria (Definition of Done)
- All 5 core CRUD endpoints work and return correct status codes.
- Invalid input returns 422 with a clear error message; missing resource returns 404.
- Frontend can create, edit, delete, filter, and search tasks end-to-end against the live API.
- Dashboard stat cards reflect real data and update after task changes.
- UI is usable and looks correct at 375px (mobile) and 1440px (desktop) widths.
- No console errors/warnings in the browser during normal use.