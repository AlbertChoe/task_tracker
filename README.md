# Team Task Tracker

FastAPI · SQLModel · Next.js · PostgreSQL

---

## Why This Project Exists

A project manager struggled to understand who was doing what, which tasks were blocked, and how close the team was to completing its sprint. Work updates lived in chats and personal notes, making it easy to lose track of ownership and progress.
This app centralises that workflow:

- Capture every task with start, due, and completion dates.
- Track state transitions (Not started → In progress → Completed).
- Log granular activity whenever something changes.
- Search and filter tasks quickly.
- Surface a dashboard summary so the PM sees the bigger picture.
- Lock the tool behind a simple login because it’s for internal use only.

---

## Key Capabilities

- **Secure workspace**: Email/password login issues JWT tokens; only the project manager’s tasks are visible.
- **Task CRUD with history**: Create, update, delete, and view tasks while automatically auditing key events in a Task Log.
- **Owner-scoped dashboard**: Totals, status breakdowns, overdue/due-soon counts, and WIP-per-assignee are calculated per authenticated manager.
- **Fast search & filters**: Status and keyword filters work with backend pagination for responsive browsing.
- **Consistent timekeeping**: All timestamps are stored and rendered in the Jakarta timezone (fallback-friendly even if tzdata is missing in the OS).
- **Deployment-ready**: Runs with Docker Compose or manually via separate backend/frontend processes. Seed script creates the first PM account.

---

## Architecture & Tech Stack

| Layer    | Technology                 |
| -------- | -------------------------- |
| Frontend | **Next.js 14**             |
| Backend  | **FastAPI + SQLModel**     |
| Database | **PostgreSQL**.            |
| Tooling  | Docker Compose (optional). |

### High-Level Flow

```
Browser
  └─> api.ts fetch wrapper
       └─> FastAPI routes
            ├─ /auth/login
            ├─ /tasks[...]
            └─ /dashboard/summary
                    └─ SQLModel engine -> PostgreSQL
```

---

## Database Schema

All tables use UUID identifiers generated in the application layer.

| Table       | Fields (type)                                                                                                            | Purpose                                                                                         |
| ----------- | ------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------- |
| `users`     | `id`, `email`, `password_hash`, `name`, `role`, `created_at`                                                             | Only PM accounts.                                                                               |
| `tasks`     | `id`, `title`, `description`, `assignee`, `status`, `created_by`, `created_at`, `start_date`, `due_date`, `completed_at` | Core entity. `created_by` links to `users.id`, ensuring each manager sees only their own tasks. |
| `task_logs` | `id`, `task_id` (FK), `event`, `detail`, `created_at`                                                                    | Timeline of task events (created, status changes, completion, custom notes).                    |

> All timestamps are created via `jakarta_now()`. If the OS lacks tzdata, the app falls back to UTC+7 so data remains consistent.

---

## Backend (FastAPI) Overview

### Folder Layout (`backend/app`)

```
app/
├── auth/            # Auth router, schemas, security helpers
├── core/            # Config, pagination helper
├── dashboard/       # /dashboard/summary endpoint
├── seed/            # Admin seeding script
├── tasks/           # Task + TaskLog routers & schemas
├── db.py            # SQLModel models & engine
├── deps.py          # Shared dependencies
└── main.py          # FastAPI app entrypoint
```

### Environment Variables (`backend/.env`)

```
DATABASE_URL=postgresql+psycopg://postgres:postgres@localhost:5432/task_tracker
JWT_SECRET=secret
CORS_ORIGINS=http://localhost:3000
```

### API Reference

All endpoints require the `Authorization: Bearer <token>` header except `POST /auth/login`.

| Method   | Route                   | Description                                                                                           |
| -------- | ----------------------- | ----------------------------------------------------------------------------------------------------- |
| `POST`   | `/auth/login`           | Returns `{ "access_token": "<jwt>" }` for valid credentials.                                          |
| `GET`    | `/dashboard/summary`    | Totals, per-status counts, overdue, due-soon, top assignees in WIP, scoped to the current user.       |
| `GET`    | `/tasks`                | List tasks with optional `status`, `q`, `page`, `size`. Always filtered by `created_by`.              |
| `POST`   | `/tasks`                | Create a task; `assignee` is normalised to lowercase. Logs a `CREATED` event.                         |
| `GET`    | `/tasks/{task_id}`      | Fetch a single task belonging to the user.                                                            |
| `PATCH`  | `/tasks/{task_id}`      | Partial update; status changes create `STATUS_CHANGED` logs, `completed_at` creates `COMPLETED` logs. |
| `DELETE` | `/tasks/{task_id}`      | Delete task + cascade delete logs (scoped to owner).                                                  |
| `GET`    | `/tasks/{task_id}/logs` | List logs (chronological) for owned task.                                                             |
| `POST`   | `/tasks/{task_id}/logs` | Append a custom log entry to an owned task.                                                           |

Swagger UI is available at **`http://localhost:8008/docs`** once the backend is running.

### Implementation Highlights

- Dependency `get_current_user_id` decodes JWTs and returns the `sub` (UUID). Any invalid token yields HTTP 401.
- `_parse_user_id` helper normalises and validates UUIDs, returning 401 if malformed.
- Task routes enforce owner checks; any cross-account access returns HTTP 403.
- Assignee names are lowercased on create/update to enable grouping without case issues.
- Dashboard queries filter on `Task.created_by` and use SQL aggregate functions; due-date calculations ignore null fields.
- Timezone fallback ensures logs and task timestamps work even when `tzdata` isn’t installed on the host.

---

## Frontend (Next.js) Overview

### Folder Layout (`frontend/src`)

```
src/
├── app/
│   ├── (protected)/       # Auth-protected routes
│   │   ├── layout.tsx     # Navbar + secure layout shell
│   │   ├── dashboard/     # Dashboard landing page
│   │   └── tasks/         # Task list + detail pages
│   ├── login/             # Public login page
│   ├── not-found.tsx      # 404 screen
│   └── layout.tsx         # Root layout + Navbar injection
├── components/
│   ├── Navbar.tsx         # Sticky navigation with logout
│   ├── StatsCards.tsx     # Dashboard KPI cards
│   ├── TaskForm.tsx       # Reusable form for create/update
│   ├── TaskTable.tsx      # Paginated, filterable task table
│   ├── WipPanel.tsx       # Top assignees widget
│   └── ui/                # Minimal input/button wrappers
├── lib/
│   ├── api.ts             # Fetch wrapper w/ 401+403 handling
│   ├── auth.ts            # Cookie helpers for JWT
│   └── datetime.ts        # en-GB locale formatting (Asia/Jakarta)
└── types/
    └── index.ts           # Shared TypeScript types
```

### Frontend Highlights

- **Middleware** `frontend/middleware.ts` protects `/dashboard` and `/tasks`—unauthenticated visitors are redirected to `/login?next=/desired/path`.
- `api.ts` automatically adds the JWT, redirects to `/login` on 401 (and clears the cookie), and guards against 403 by sending users back to `/dashboard` (owner scope).
- Task list uses SWR with debounced search, preserves pagination state, and shows server-driven pages (`page`, `size`).
- Task detail page reuses `TaskForm` for updates and triggers global SWR revalidation so list data stays current.
- UI copy is fully English. Dates render via `formatDate` and `formatDateTime` to match WIB while showing readable text.

### Frontend Environment (`frontend/.env`)

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8008
```

---

## Running the Project

### Option A – Docker Compose (recommended quickest)

```bash
cp .env.example .env                     # root .env with DATABASE_URL etc.
docker compose up --build -d             # starts postgres, backend, frontend
docker compose exec backend python -m app.seed.seed_admin
```

Visit **http://localhost:3000** and log in with the seeded account credentials (see seed script output).

### Option B – Manual Setup

1. **Database**: create a PostgreSQL database and run the schema (models auto-create tables on first run).
2. **Backend**
   ```bash
   cd backend
   cp .env.example .env                  # edit .env
   python -m venv .venv
   .venv\Scripts\activate                # or source .venv/bin/activate
   pip install -r requirements.txt
   uvicorn app.main:app --reload --host 127.0.0.1 --port 8008
   python -m app.seed.seed_admin         # creates admin account with role PM
   ```
3. **Frontend**
   ```bash
   cd frontend
   cp .env.example .env
   npm install
   npm run dev
   ```
   Open **http://localhost:3000**.

---

## Seed Data

`backend/app/seed/seed_admin.py` creates a default project manager account:

```
Email: admin@gmail.com
Password: 123456789
Role: PM
Email: admin2@gmail.com
Password: 123456789
Role: PM
```

---

## Summary of What Was Delivered

- Full-stack implementation meeting the assignment brief: secure login, CRUD with history, dashboard metrics, rich frontend UI, and English documentation.
- Owner-based isolation across API and UI so each project manager only sees their data.
- Clean codebase with modular routers/components, centralised date utilities, and robust fetch error handling (401/403 redirects).
- Deployment-ready instructions (Docker and manual), schema explanations, and seed data to get evaluators running quickly.
