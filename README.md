# Team Task Tracker (FastAPI + SQLModel + Next.js + PostgreSQL)

Variant: **SQLModel ORM** + Next.js **middleware** (protected routes).

## Quick Start (Docker Compose)

```bash
cp .env.example .env
docker compose up --build -d
docker compose exec backend python -m app.seed.seed_admin
```

- Backend: http://localhost:8000
- Frontend: http://localhost:3000
- Default login: **pm@example.com / secret123**

## Manual

- Jalankan `schema.sql` di Postgres/Supabase.
- Set `DATABASE_URL` di `.env` backend/root.

2. **Backend**

```bash
cd backend
cp .env.example .env
python -m venv .venv
.venv\Scripts\Activate.ps1 #  source .venv/bin/activate
pip install -r requirement.txt
uvicorn app.main:app --reload --host 127.0.0.1 --port 8008
python -m app.seed.seed_admin
```
