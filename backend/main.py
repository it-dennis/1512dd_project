from contextlib import asynccontextmanager
from typing import List
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from database import engine, Base, get_db
import models
import schemas
from routers import auth as auth_router
from routers import articles as articles_router
from routers import users as users_router
from seed import run_seed
from migrations import run_migrations


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    run_migrations()
    run_seed()
    yield


app = FastAPI(
    title="PC1512 Emulator Platform",
    description="Amstrad PC1512-DD — Browser-Emulator & Infothek",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "https://1512.retrokauz.de",
        "http://1512.retrokauz.de",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router.router)
app.include_router(articles_router.router)
app.include_router(users_router.router)


@app.get("/api/health")
def health():
    return {"status": "ok", "service": "PC1512 Backend"}


@app.get("/api/categories/", response_model=List[schemas.CategoryOut])
def list_categories(db: Session = Depends(get_db)):
    return db.query(models.Category).order_by(models.Category.name).all()
