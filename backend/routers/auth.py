import secrets
from datetime import datetime, timedelta

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
import models
import schemas
from auth import hash_password, verify_password, create_access_token, require_user
from email_utils import send_verification_email

router = APIRouter(prefix="/api/auth", tags=["auth"])

VERIFY_TOKEN_EXPIRE_HOURS = 72


@router.post("/register", response_model=schemas.RegisterResponse)
def register(data: schemas.UserRegister, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    if db.query(models.User).filter(models.User.email == data.email).first():
        raise HTTPException(status_code=400, detail="E-Mail bereits registriert")
    if db.query(models.User).filter(models.User.username == data.username).first():
        raise HTTPException(status_code=400, detail="Benutzername bereits vergeben")

    token = secrets.token_urlsafe(32)
    expires = datetime.utcnow() + timedelta(hours=VERIFY_TOKEN_EXPIRE_HOURS)

    user = models.User(
        email=data.email,
        username=data.username,
        password_hash=hash_password(data.password),
        is_verified=False,
        verification_token=token,
        verification_token_expires=expires,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    background_tasks.add_task(send_verification_email, user.email, user.username, token)

    return {"message": "Konto erstellt. Bitte prüfe deine E-Mails und klicke auf den Bestätigungslink."}


@router.post("/login", response_model=schemas.Token)
def login(data: schemas.UserLogin, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == data.email).first()
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="E-Mail oder Passwort falsch")
    if not user.is_verified:
        raise HTTPException(status_code=403, detail="E-Mail-Adresse noch nicht bestätigt. Bitte prüfe dein Postfach.")
    token = create_access_token({"sub": str(user.id)})
    return {"access_token": token, "token_type": "bearer"}


@router.get("/verify-email", response_model=schemas.RegisterResponse)
def verify_email(token: str, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.verification_token == token).first()
    if not user:
        raise HTTPException(status_code=400, detail="Ungültiger Bestätigungslink")
    if user.is_verified:
        return {"message": "E-Mail-Adresse bereits bestätigt"}
    if user.verification_token_expires and datetime.utcnow() > user.verification_token_expires:
        raise HTTPException(status_code=400, detail="Der Bestätigungslink ist abgelaufen. Bitte registriere dich erneut.")
    user.is_verified = True
    user.verification_token = None
    user.verification_token_expires = None
    db.commit()
    return {"message": "E-Mail-Adresse erfolgreich bestätigt! Du kannst dich jetzt einloggen."}


@router.get("/me", response_model=schemas.UserOut)
def me(current_user=Depends(require_user)):
    return current_user
