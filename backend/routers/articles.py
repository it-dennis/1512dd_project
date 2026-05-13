from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from database import get_db
import models
import schemas
from auth import require_admin

router = APIRouter(prefix="/api/articles", tags=["articles"])


@router.get("/", response_model=List[schemas.ArticleListOut])
def list_articles(skip: int = 0, limit: int = 20, db: Session = Depends(get_db)):
    return (
        db.query(models.Article)
        .order_by(models.Article.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


@router.get("/{slug}", response_model=schemas.ArticleOut)
def get_article(slug: str, db: Session = Depends(get_db)):
    article = db.query(models.Article).filter(models.Article.slug == slug).first()
    if not article:
        raise HTTPException(status_code=404, detail="Artikel nicht gefunden")
    return article


@router.post("/", response_model=schemas.ArticleOut)
def create_article(
    data: schemas.ArticleCreate,
    db: Session = Depends(get_db),
    admin=Depends(require_admin),
):
    if db.query(models.Article).filter(models.Article.slug == data.slug).first():
        raise HTTPException(status_code=400, detail="Slug bereits vergeben")
    article = models.Article(**data.model_dump(), author_id=admin.id)
    db.add(article)
    db.commit()
    db.refresh(article)
    return article


@router.put("/{article_id}", response_model=schemas.ArticleOut)
def update_article(
    article_id: int,
    data: schemas.ArticleUpdate,
    db: Session = Depends(get_db),
    admin=Depends(require_admin),
):
    article = db.query(models.Article).filter(models.Article.id == article_id).first()
    if not article:
        raise HTTPException(status_code=404, detail="Artikel nicht gefunden")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(article, field, value)
    db.commit()
    db.refresh(article)
    return article


@router.delete("/{article_id}", status_code=204)
def delete_article(
    article_id: int,
    db: Session = Depends(get_db),
    admin=Depends(require_admin),
):
    article = db.query(models.Article).filter(models.Article.id == article_id).first()
    if not article:
        raise HTTPException(status_code=404, detail="Artikel nicht gefunden")
    db.delete(article)
    db.commit()
