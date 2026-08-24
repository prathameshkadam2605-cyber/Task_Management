# TaskFlow - Full-Stack Task Management Dashboard

TaskFlow is a production-ready, full-stack task management dashboard designed for streamlined task tracking, project visibility, and status workflow management. Built with a high-performance FastAPI backend and a modern Next.js 14 App Router frontend styled with shadcn/ui and Tailwind CSS, it features real-time search, multi-column sorting, priority/status filtering, paginated data grids, an interactive Kanban board with optimistic drag-and-drop state transitions, system-wide dark mode theming, and an aggregated metrics dashboard.

---

## Features

### Core Features
- **Full CRUD Management**: Create, view, update, and delete tasks with comprehensive validations on title, description, priority, status, and due dates.
- **Aggregated Metrics Dashboard**: Real-time summary stat cards (Total Tasks, Todo, In Progress, Completed, High Priority) and a preview of recent tasks.
- **Search & Filtering**: Instant, debounced case-insensitive title search combined with status and priority filter controls.
- **Multi-Field Sorting**: Dynamic sorting by creation date, due date, title, priority, or status in ascending/descending orders.
- **Detailed Task View**: Dedicated task page displaying complete metadata, timestamps, and one-click full UUID copying.
- **Responsive Layout**: Designed for mobile (375px) through desktop (1440px+) screen widths.

### Bonus Features
- **Interactive Kanban Board**: 3-column drag-and-drop workflow (Todo, In Progress, Completed) powered by `@dnd-kit/core` and `@dnd-kit/sortable`.
- **Optimistic UI with Rollback**: Instant UI feedback on card drops with background server synchronization and automatic state rollback on failure.
- **Keyboard Accessibility**: Full keyboard drag-and-drop support (Tab to focus, Space to pick up, Arrow keys to navigate columns, Space to drop).
- **Dark / Light / System Theme**: System-wide theme toggling persisted across sessions via `next-themes` with WCAG-compliant dark-mode palettes.
- **Pagination Boundary Safety**: Automatic fallback when deleting items on boundary pages and synchronized rows-per-page adjustments.
- **Automated Backend Test Suite**: Comprehensive `pytest` test suite covering CRUD operations, query validations, filtering, and edge cases.

---

## Tech Stack

### Backend
| Technology | Version | Description |
|---|---|---|
| **Python** | `3.11+` | Programming language |
| **FastAPI** | `>=0.115.0` | Modern, high-performance web framework |
| **Uvicorn** | `>=0.30.0` | ASGI web server |
| **SQLAlchemy** | `>=2.0.0` | SQL toolkit and Object-Relational Mapper (ORM) |
| **Pydantic** | `>=2.7.0` | Data validation and schema parsing |
| **Pydantic Settings** | `>=2.2.0` | Environment settings management |
| **SQLite / PostgreSQL** | Local dev / Prod | Relational database storage |
| **pytest & HTTPX** | `>=8.0.0` / `>=0.27.0` | Unit testing and async test client |

### Frontend
| Technology | Version | Description |
|---|---|---|
| **Next.js** | `14.2.35` | React framework with App Router and SSR |
| **React & React DOM** | `^18.0.0` | UI component library |
| **TypeScript** | `^5.0.0` | Strict type safety across all components and services |
| **Tailwind CSS** | `^3.4.1` | Utility-first styling with semantic design tokens |
| **shadcn/ui & Radix UI** | Latest primitives | Accessible component primitives (Dialogs, Selects, Dropdowns) |
| **TanStack React Query** | `^5.101.4` | Server state management, optimistic caching, and mutations |
| **React Hook Form & Zod** | `^7.85.0` / `^3.25.76` | Form state management and schema-based client validation |
| **dnd-kit** | `^6.3.1` / `^10.0.0` | Drag-and-drop core, sortable contexts, and keyboard sensors |
| **next-themes** | `^0.4.6` | Theme management for Light, Dark, and System modes |
| **Sonner** | `^2.0.8` | Toast notification system |
| **Lucide React** | `^1.33.0` | Consistent iconography |

---

## Project Structure

```text
Task Management Dashboard/
├── PRD-Task-Management-Dashboard.md
├── README.md
├── screenshots/
│   ├── dashboard.png
│   ├── task-list.png
│   ├── kanban.png
│   ├── dark-mode.png
│   ├── task-details.png
│   └── create-modal.png
│
├── backend/
│   ├── app/
│   │   ├── core/
│   │   │   ├── config.py
│   │   │   ├── database.py
│   │   │   └── exceptions.py
│   │   ├── models/
│   │   │   └── task.py
│   │   ├── routes/
│   │   │   └── task_routes.py
│   │   ├── schemas/
│   │   │   └── task_schema.py
│   │   └── services/
│   │       └── task_service.py
│   ├── tests/
│   │   └── test_tasks.py
│   ├── .env.example
│   ├── main.py
│   ├── requirements.txt
│   └── README.md
│
└── frontend/
    ├── app/
    │   ├── tasks/
    │   │   ├── [id]/
    │   │   │   └── page.tsx
    │   │   └── page.tsx
    │   ├── globals.css
    │   ├── layout.tsx
    │   └── page.tsx
    ├── components/
    │   ├── layout/
    │   │   ├── AppShell.tsx
    │   │   ├── Sidebar.tsx
    │   │   ├── ThemeToggle.tsx
    │   │   └── Topbar.tsx
    │   ├── providers/
    │   │   ├── QueryProvider.tsx
    │   │   └── ThemeProvider.tsx
    │   ├── tasks/
    │   │   ├── DeleteConfirmDialog.tsx
    │   │   ├── KanbanCard.tsx
    │   │   ├── KanbanColumn.tsx
    │   │   ├── TaskBoard.tsx
    │   │   ├── TaskFilters.tsx
    │   │   ├── TaskFormModal.tsx
    │   │   ├── TaskPagination.tsx
    │   │   └── TaskTable.tsx
    │   └── ui/
    │       ├── alert-dialog.tsx
    │       ├── badge.tsx
    │       ├── button.tsx
    │       ├── card.tsx
    │       ├── dialog.tsx
    │       ├── dropdown-menu.tsx
    │       ├── input.tsx
    │       ├── select.tsx
    │       ├── skeleton.tsx
    │       ├── table.tsx
    │       └── textarea.tsx
    ├── lib/
    │   └── utils.ts
    ├── services/
    │   └── taskService.ts
    ├── types/
    │   └── task.ts
    ├── .env.local.example
    ├── package.json
    ├── tailwind.config.ts
    ├── tsconfig.json
    └── README.md
```

---

## Setup & Running Locally

### 1. Prerequisites
- Python `3.11+`
- Node.js `18.x` or `20.x`
- npm `9.x+`

### 2. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Create and activate virtual environment
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
# source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env

# Run FastAPI development server
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```
The backend API is now running at `http://127.0.0.1:8000`.  
Interactive Swagger documentation is available at `http://127.0.0.1:8000/docs`.

### 3. Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Configure environment variables
cp .env.local.example .env.local

# Run Next.js development server
npm run dev
```
The frontend dashboard is now running at `http://localhost:3000`.

---

## API Reference

Base URL: `http://127.0.0.1:8000/api/v1`

| Method | Endpoint | Query Parameters | Description |
|---|---|---|---|
| `GET` | `/tasks` | `status`, `priority`, `search`, `sort_by`, `sort_order`, `page`, `page_size` | List paginated tasks with filtering and sorting |
| `POST` | `/tasks` | — | Create a new task |
| `GET` | `/tasks/summary` | — | Aggregate statistics (total, todo, in_progress, completed, high_priority) |
| `GET` | `/tasks/{id}` | — | Retrieve single task details by UUID |
| `PUT` | `/tasks/{id}` | — | Update task fields (supports partial updates) |
| `DELETE` | `/tasks/{id}` | — | Permanently delete a task by UUID |

> Full interactive documentation with request/response schemas and execution tools is available at **`http://127.0.0.1:8000/docs`**.

---

## Running Tests

The backend includes a comprehensive test suite written with `pytest` and FastAPI's `TestClient` (using an isolated in-memory SQLite database):

```bash
cd backend
pytest -v
```

---

## Screenshots

| Dashboard | Task List |
|---|---|
| ![Dashboard](./screenshots/dashboard.png) | ![Task List](./screenshots/task-list.png) |

| Kanban Board | Dark Mode |
|---|---|
| ![Kanban](./screenshots/kanban.png) | ![Dark Mode](./screenshots/dark-mode.png) |

| Task Details | Create / Edit Modal |
|---|---|
| ![Task Details](./screenshots/task-details.png) | ![Create Modal](./screenshots/create-modal.png) |

---

## Notes & Design Decisions

- **Database Portability**: SQLite (`sqlite:///./tasks.db`) is configured for local zero-setup development. Changing `DATABASE_URL` to a PostgreSQL connection string (e.g. `postgresql://user:password@localhost:5432/taskdb`) enables PostgreSQL instantly with no backend code changes required.
- **Scope Alignment**: User authentication (JWT) and Docker containerization were intentionally scoped out for this submission to prioritize deep implementation of the interactive Kanban drag-and-drop workflow, WCAG-compliant theme system, and pagination safety guards.

---

## Author

- **Name**: Prathamesh Kadam
- **Email**: prathameshkadam2605@gmail.com
- **GitHub**: https://github.com/prathameshkadam2605-cyber
