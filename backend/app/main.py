from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.auth.router import router as auth_router
from app.tasks.router import router as tasks_router
from app.tasks.logs_router import router as logs_router
from app.dashboard.router import router as dashboard_router
from app.db import init_db

print("repr(DATABASE_URL):", repr(settings.DATABASE_URL))
print("type:", type(settings.DATABASE_URL))

app = FastAPI(title="Team Task Tracker API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in settings.CORS_ORIGINS.split(',')],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

init_db()

app.include_router(auth_router)
app.include_router(tasks_router)
app.include_router(logs_router)
app.include_router(dashboard_router)


@app.get("/")
def root():
    return {"ok": True}
