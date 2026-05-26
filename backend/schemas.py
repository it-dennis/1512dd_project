from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional


class UserRegister(BaseModel):
    email: EmailStr
    username: str
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str


class RegisterResponse(BaseModel):
    message: str


class UserOut(BaseModel):
    id: int
    email: str
    username: str
    is_admin: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class CategoryOut(BaseModel):
    id: int
    name: str
    slug: str

    model_config = {"from_attributes": True}


class ArticleCreate(BaseModel):
    title: str
    slug: str
    body: str
    excerpt: Optional[str] = None
    category_id: Optional[int] = None


class ArticleUpdate(BaseModel):
    title: Optional[str] = None
    body: Optional[str] = None
    excerpt: Optional[str] = None
    category_id: Optional[int] = None


class ArticleListOut(BaseModel):
    id: int
    title: str
    slug: str
    body: str
    excerpt: Optional[str]
    category: Optional[CategoryOut]
    created_at: datetime

    model_config = {"from_attributes": True}


class ArticleOut(BaseModel):
    id: int
    title: str
    slug: str
    body: str
    excerpt: Optional[str]
    category: Optional[CategoryOut]
    author: UserOut
    created_at: datetime
    updated_at: Optional[datetime]

    model_config = {"from_attributes": True}
