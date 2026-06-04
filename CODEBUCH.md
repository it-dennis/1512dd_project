# Codebuch: 1512dd — Vollständige Code-Erklärung

> Nachschlagewerk für alle Sprachen, Frameworks und Konzepte des Projekts.  
> Jeder Abschnitt bezieht sich auf echten Code aus diesem Projekt.  
> Gedacht zum Lernen, Wiederholen und als Referenz für zukünftige Projekte.

---

## Inhaltsverzeichnis

**PYTHON**
1. [Python — Grundlagen & Syntax](#1-python--grundlagen--syntax)
2. [FastAPI — Framework im Detail](#2-fastapi--framework-im-detail)
3. [SQLAlchemy — ORM im Detail](#3-sqlalchemy--orm-im-detail)
4. [Pydantic — Datenvalidierung](#4-pydantic--datenvalidierung)
5. [JWT & Passwort-Sicherheit](#5-jwt--passwort-sicherheit)

**JAVASCRIPT / REACT**
6. [JavaScript — Grundlagen & Syntax](#6-javascript--grundlagen--syntax)
7. [React — Komponenten & JSX](#7-react--komponenten--jsx)
8. [React Hooks im Detail](#8-react-hooks-im-detail)
9. [React Router im Detail](#9-react-router-im-detail)
10. [Axios — HTTP-Client im Detail](#10-axios--http-client-im-detail)

**CSS & STYLING**
11. [Tailwind CSS im Detail](#11-tailwind-css-im-detail)

**INFRASTRUKTUR**
12. [Docker & Dockerfile — Syntax erklärt](#12-docker--dockerfile--syntax-erklärt)
13. [Docker Compose (YAML) — Syntax erklärt](#13-docker-compose-yaml--syntax-erklärt)
14. [nginx.conf — Syntax erklärt](#14-nginxconf--syntax-erklärt)

---

# PYTHON

## 1. Python — Grundlagen & Syntax

### Imports

```python
# Aus der Standardbibliothek (kein installieren nötig)
from datetime import datetime, timedelta
from typing import Optional, List
import os
import secrets

# Aus installierten Paketen (requirements.txt)
from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from jose import JWTError, jwt
```

**`import X`** — importiert das gesamte Modul. Zugriff mit `X.funktion()`.  
**`from X import Y`** — importiert Y direkt. Zugriff mit `Y()` (kein Präfix nötig).  
**`from X import Y, Z`** — mehrere Dinge auf einmal importieren.

Im Projekt: `from database import engine, Base, get_db` importiert drei Dinge aus `database.py` (einer eigenen Datei) direkt.

---

### Type Hints (Typannotationen)

Python ist dynamisch getippt — Type Hints sind optional, aber sie machen den Code lesbarer und FastAPI braucht sie für automatische Validierung.

```python
# Aus auth.py:
def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    ...

def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> Optional[models.User]:
    ...
```

**`parameter: Typ`** — Eingabe-Typ  
**`-> Typ`** — Rückgabe-Typ  
**`Optional[Typ]`** — kann den Typ haben oder `None` sein  
**`List[Typ]`** — eine Liste des Typs  

`Optional[timedelta] = None` bedeutet: der Parameter ist optional, und wenn nicht angegeben, ist er `None`.

---

### Funktionen und Klassen

```python
# Einfache Funktion
def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)

# Klasse (SQLAlchemy Model) — aus models.py
class User(Base):
    __tablename__ = "users"          # Name der DB-Tabelle
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False)
```

**`class Name(Elternklasse):`** — erstellt eine Klasse, die von `Elternklasse` erbt (Vererbung).  
`User(Base)` erbt alle SQLAlchemy-Funktionalität von `Base`.

---

### Dekoratoren (`@`)

Ein Dekorator ist eine Funktion, die eine andere Funktion "umhüllt" und ihr zusätzliches Verhalten gibt.

```python
# Aus main.py:
@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    run_migrations()
    run_seed()
    yield

# Aus routers/articles.py:
@router.get("/", response_model=List[schemas.ArticleListOut])
def list_articles(skip: int = 0, limit: int = 20, db: Session = Depends(get_db)):
    ...

@router.post("/", response_model=schemas.ArticleOut)
def create_article(data: schemas.ArticleCreate, db: Session = Depends(get_db), admin=Depends(require_admin)):
    ...
```

`@router.get("/")` ist FastAPI-spezifisch: Es registriert die Funktion als Handler für `GET /api/articles/`.  
Die Funktion selbst bleibt unverändert — der Dekorator fügt die Routing-Logik hinzu.

---

### async / await

Python unterstützt asynchrone Programmierung. `async def` definiert eine Koroutine, die mit `await` ausgeführt wird.

```python
# Aus main.py:
@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    run_seed()
    yield          # ← hier läuft die App; was nach yield kommt, läuft beim Shutdown
```

`yield` in einem `asynccontextmanager` trennt "beim Start" (vor yield) und "beim Beenden" (nach yield).

In den Routers sind die Endpunkte normale `def`-Funktionen (nicht async) — das ist bei Datenbankoperationen mit SQLAlchemy (synchron) üblich und von FastAPI unterstützt.

---

### f-Strings (Formatierte Strings)

```python
# Aus email_utils.py:
verify_url = f"{base_url}/verify-email?token={token}"

print(f"[EMAIL OK] Bestätigungsmail erfolgreich gesendet an {to_email}")

html = f"""<!DOCTYPE html>
<html>
<body>
  <p>Hallo {username},</p>
  ...
"""
```

`f"..."` — Ausdruck in `{}` wird zur Laufzeit eingesetzt.  
`f"""..."""` — triple-quoted für mehrzeilige Strings.

---

### try / except / finally

```python
# Aus migrations.py:
for stmt in statements:
    try:
        conn.execute(text(stmt))
        conn.commit()
    except Exception:
        pass  # Spalte existiert schon — ignorieren

# Aus seed.py:
try:
    db.add(admin)
    db.commit()
    print("Seed-Daten erfolgreich eingespielt.")
except Exception as e:
    db.rollback()
    print(f"Seed fehlgeschlagen: {e}")
finally:
    db.close()   # wird IMMER ausgeführt, auch bei Fehler
```

**`try:`** — versuche diesen Code  
**`except Exception as e:`** — wenn ein Fehler passiert, führe diesen Block aus; `e` enthält den Fehler  
**`except Exception:`** — Fehler ignorieren (pass)  
**`finally:`** — wird immer ausgeführt, egal ob Fehler oder nicht  
**`db.rollback()`** — macht alle DB-Änderungen der Session rückgängig

---

### os.getenv — Umgebungsvariablen lesen

```python
# Aus auth.py:
SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key-replace-in-production")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))
```

`os.getenv("NAME", "fallback")` — liest die Umgebungsvariable `NAME`. Wenn sie nicht gesetzt ist, wird `"fallback"` verwendet.  
`int(...)` — wandelt den String-Wert in eine Integer um (os.getenv gibt immer Strings zurück).

---

### List Comprehensions

Elegante Art, Listen zu erstellen:

```python
# Normales for-loop (gleichbedeutend):
result = []
for a in ARTICLES:
    result.append(a["slug"])

# Als List Comprehension:
slugs = [a["slug"] for a in ARTICLES]

# Mit Bedingung:
verified_users = [u for u in users if u.is_verified]
```

---

### Dictionary (dict) — Wörterbücher

```python
# Aus seed.py:
cat_map = {}                      # leeres Dictionary
cat_map[slug] = cat.id            # Schlüssel → Wert

# Zugriff:
cat_map.get(a["category_slug"])   # gibt None wenn nicht gefunden (sicherer als cat_map[key])

# Literale:
payload = {
    "sender": {"name": "PC1512 Emulator", "email": smtp_from},
    "to": [{"email": to_email, "name": username}],
    "subject": "Bitte bestätige...",
}
```

---

## 2. FastAPI — Framework im Detail

### Die App erstellen

```python
# Aus main.py:
app = FastAPI(
    title="PC1512 Emulator Platform",
    description="Amstrad PC1512-DD — Browser-Emulator & Infothek",
    version="1.0.0",
    lifespan=lifespan,
)
```

`FastAPI(...)` erstellt die Anwendung. Die Parameter erscheinen in der automatischen Swagger-Dokumentation unter `/docs`.  
`lifespan=lifespan` gibt die Startup/Shutdown-Funktion an.

---

### Router — API-Endpunkte strukturieren

```python
# Aus routers/articles.py:
router = APIRouter(prefix="/api/articles", tags=["articles"])

@router.get("/", response_model=List[schemas.ArticleListOut])
def list_articles(skip: int = 0, limit: int = 20, db: Session = Depends(get_db)):
    return db.query(models.Article).order_by(...).offset(skip).limit(limit).all()
```

**`prefix="/api/articles"`** — alle Routen in diesem Router haben dieses Präfix.  
**`tags=["articles"]`** — Gruppierung in der Swagger-Dokumentation.  
**`@router.get("/")`** — `GET /api/articles/` (prefix + "/")  
**`@router.get("/{slug}")`** — `GET /api/articles/mein-artikel`; `slug` wird als Parameter übergeben

```python
# Aus main.py — Router einbinden:
app.include_router(auth_router.router)
app.include_router(articles_router.router)
app.include_router(users_router.router)
```

---

### Dependency Injection — `Depends()`

`Depends()` ist Fastapis Mechanismus, Funktionen automatisch auszuführen und ihr Ergebnis als Parameter zu übergeben.

```python
# Aus routers/articles.py:
@router.post("/", response_model=schemas.ArticleOut)
def create_article(
    data: schemas.ArticleCreate,        # ← aus dem Request-Body (automatisch)
    db: Session = Depends(get_db),      # ← Depends: get_db() wird aufgerufen, Session übergeben
    admin=Depends(require_admin),        # ← Depends: require_admin() prüft Auth, gibt User zurück
):
```

Wenn `create_article` aufgerufen wird:
1. FastAPI sieht `Depends(get_db)` → ruft `get_db()` auf → gibt die DB-Session zurück → übergibt sie als `db`
2. FastAPI sieht `Depends(require_admin)` → ruft `require_admin()` auf → prüft ob Admin → gibt User zurück oder wirft 403

**Vorteil:** Wenn 20 Endpunkte `get_db` brauchen, schreibt man `Depends(get_db)` überall. Die Logik ist nur einmal definiert.

---

### HTTPException — Fehler zurückgeben

```python
# Aus routers/auth.py:
if db.query(models.User).filter(models.User.email == data.email).first():
    raise HTTPException(status_code=400, detail="E-Mail bereits registriert")

if not user or not verify_password(data.password, user.password_hash):
    raise HTTPException(status_code=401, detail="E-Mail oder Passwort falsch")

if not current_user or not current_user.is_admin:
    raise HTTPException(status_code=403, detail="Admin-Zugriff erforderlich")
```

`raise HTTPException(...)` — unterbricht die Funktion sofort und sendet eine HTTP-Fehlerantwort.  
Der Browser/Client erhält JSON: `{"detail": "E-Mail bereits registriert"}` mit HTTP-Status 400.

**Wichtige HTTP-Status-Codes:**
- `200` — OK (Erfolg, Standard)
- `204` — No Content (Erfolg, keine Antwort — bei DELETE)
- `400` — Bad Request (fehlerhafte Eingabe)
- `401` — Unauthorized (nicht eingeloggt)
- `403` — Forbidden (eingeloggt, aber kein Zugriff)
- `404` — Not Found
- `500` — Internal Server Error (unerwarteter Fehler im Server)

---

### BackgroundTasks — asynchrone Aufgaben

```python
# Aus routers/auth.py:
@router.post("/register", response_model=schemas.RegisterResponse)
def register(data: schemas.UserRegister, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    ...
    background_tasks.add_task(send_verification_email, user.email, user.username, token)
    return {"message": "Konto erstellt..."}
```

`BackgroundTasks` — FastAPI führt `send_verification_email(...)` **nach** der Antwort aus. Der Nutzer bekommt sofort eine Antwort, auch wenn der E-Mail-Versand 2 Sekunden dauert. Ohne BackgroundTasks würde der Nutzer warten.

---

### response_model — Antwort-Schema

```python
@router.get("/", response_model=List[schemas.ArticleListOut])
def list_articles(...):
    return db.query(models.Article).all()   # gibt SQLAlchemy-Objekte zurück
```

FastAPI konvertiert die SQLAlchemy-Objekte automatisch in JSON gemäß `ArticleListOut`. Felder, die in `ArticleListOut` nicht definiert sind (z.B. `password_hash` im User-Schema), werden **nicht** in die Antwort eingebaut — wichtig für Sicherheit.

---

### CORS-Middleware

```python
# Aus main.py:
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://1512.retrokauz.de",
    ],
    allow_credentials=True,
    allow_methods=["*"],     # GET, POST, PUT, DELETE, etc.
    allow_headers=["*"],     # Authorization, Content-Type, etc.
)
```

Browsers blockieren standardmäßig Requests von `localhost:5173` an `localhost:8000` (verschiedene "Origins"). Diese Middleware sagt dem Browser: "Diese Origins sind erlaubt."

---

### Query-Parameter und Path-Parameter

```python
# Path-Parameter — Teil der URL:
@router.get("/{slug}", response_model=schemas.ArticleOut)
def get_article(slug: str, db: Session = Depends(get_db)):
    # URL: /api/articles/mein-artikel → slug = "mein-artikel"

# Query-Parameter — nach dem ?:
@router.get("/", response_model=List[schemas.ArticleListOut])
def list_articles(skip: int = 0, limit: int = 20, db: Session = Depends(get_db)):
    # URL: /api/articles/?skip=0&limit=20
```

---

## 3. SQLAlchemy — ORM im Detail

### Verbindung aufbauen

```python
# Aus database.py:
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "mysql+pymysql://root:pc1512dev@localhost:3306/pc1512"
)
#  Format: dialect+driver://user:password@host:port/database

engine = create_engine(DATABASE_URL, pool_pre_ping=True)
```

`pool_pre_ping=True` — prüft vor jeder Abfrage ob die Verbindung noch aktiv ist. Verhindert Fehler nach langen Wartezeiten (DB-Verbindung ist eingeschlafen).

```python
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
```

`SessionLocal` ist eine Factory — jeder Aufruf `SessionLocal()` erstellt eine neue, unabhängige Session.  
`autocommit=False` — Änderungen müssen explizit mit `db.commit()` gespeichert werden (sicherer).

---

### Dependency: get_db()

```python
# Aus database.py:
def get_db():
    db = SessionLocal()    # neue Session erstellen
    try:
        yield db           # Session an den Endpunkt übergeben
    finally:
        db.close()         # immer schließen, auch bei Fehlern
```

Das `yield` macht `get_db` zu einem **Generator**. FastAPI nutzt das: Die Session wird geöffnet, dem Endpunkt gegeben, und nach dem Endpunkt (egal ob Erfolg oder Fehler) wird `finally: db.close()` ausgeführt. Keine Memory-Leaks.

---

### Modelle definieren (Tabellen als Klassen)

```python
# Aus models.py:
class Article(Base):
    __tablename__ = "articles"                           # DB-Tabellenname

    id = Column(Integer, primary_key=True, index=True)   # Auto-Increment PK, Index für schnelle Suche
    title = Column(String(255), nullable=False)           # VARCHAR(255), darf nicht leer sein
    slug = Column(String(255), unique=True, index=True)   # eindeutig, Index
    body = Column(Text, nullable=False)                   # TEXT (unbegrenzte Länge)
    excerpt = Column(String(500))                         # optional (kein nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=True)  # Fremdschlüssel
    author_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)    # Standard-Wert beim Anlegen
    updated_at = Column(DateTime, onupdate=datetime.utcnow)   # automatisch bei UPDATE gesetzt
```

**SQLAlchemy-Typen:**
- `Integer` → INT
- `String(255)` → VARCHAR(255)
- `Text` → TEXT (beliebig lang)
- `Boolean` → TINYINT(1) in MySQL
- `DateTime` → DATETIME

---

### Relationships (Beziehungen zwischen Tabellen)

```python
# Aus models.py:
class User(Base):
    articles = relationship("Article", back_populates="author")

class Article(Base):
    category = relationship("Category", back_populates="articles")
    author = relationship("User", back_populates="articles")
```

`relationship(...)` macht aus SQL-JOINs Python-Attributzugriffe:

```python
# Ohne relationship: manueller JOIN nötig
# Mit relationship: direkt zugreifen
article = db.query(models.Article).filter(...).first()
print(article.author.username)   # kein JOIN im Code nötig — SQLAlchemy macht es automatisch
print(article.category.name)
```

`back_populates` verbindet beide Seiten: `article.author` und `user.articles` sind dasselbe Verhältnis aus verschiedenen Richtungen.

---

### Datenbankabfragen

```python
# Aus routers/articles.py:

# Alle Artikel holen (mit Sortierung + Paginierung):
db.query(models.Article)
  .order_by(models.Article.created_at.desc())   # neueste zuerst
  .offset(skip)                                  # überspringe die ersten N
  .limit(limit)                                  # gib maximal N zurück
  .all()                                         # als Python-Liste

# Einen Artikel nach Slug suchen:
article = db.query(models.Article).filter(models.Article.slug == slug).first()
# .first() gibt None zurück wenn nichts gefunden (kein Fehler!)

# Mehrere Filter:
db.query(models.User).filter(models.User.email == email).first()
db.query(models.User).filter(models.User.id == int(user_id)).first()
```

---

### Datensatz anlegen, ändern, löschen

```python
# ANLEGEN:
article = models.Article(**data.model_dump(), author_id=admin.id)
# **data.model_dump() — entpackt das Pydantic-Objekt in keyword arguments
# Gleichbedeutend mit: models.Article(title=data.title, slug=data.slug, body=data.body, ...)

db.add(article)       # zur Session hinzufügen (noch nicht in DB)
db.commit()           # in DB schreiben
db.refresh(article)   # Objekt aus DB neu laden (damit z.B. die auto-generierte id verfügbar ist)

# ÄNDERN:
for field, value in data.model_dump(exclude_unset=True).items():
    setattr(article, field, value)
# exclude_unset=True — nur Felder, die im Request angegeben wurden (nicht alle optionalen)
# setattr(obj, "field", value) — setzt obj.field = value dynamisch
db.commit()
db.refresh(article)

# LÖSCHEN:
db.delete(article)
db.commit()

# FLUSH vs COMMIT:
# db.flush() — schreibt in die DB innerhalb der Transaktion (IDs werden vergeben)
#              aber kann noch rückgängig gemacht werden
# db.commit() — macht alles permanent, beendet die Transaktion
```

---

### Tabellen automatisch erstellen

```python
# Aus main.py (beim App-Start):
Base.metadata.create_all(bind=engine)
```

SQLAlchemy liest alle Klassen, die `Base` erben, und erstellt die entsprechenden Tabellen — falls sie noch nicht existieren. Bestehende Tabellen werden nicht verändert (deshalb gibt es `migrations.py` für nachträgliche Spalten).

---

## 4. Pydantic — Datenvalidierung

### BaseModel — Schemas definieren

```python
# Aus schemas.py:
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class UserRegister(BaseModel):
    email: EmailStr      # validiert: ist das eine E-Mail-Adresse? (Format-Check)
    username: str        # muss ein String sein
    password: str        # muss ein String sein
```

Wenn FastAPI eine POST-Request mit `{"email": "kein-email", "username": "bob", "password": "123"}` bekommt, prüft Pydantic automatisch:
- Ist `email` eine gültige E-Mail? Nein → automatischer 422-Fehler, ohne Code schreiben zu müssen.
- Ist `username` ein String? Ja.

---

### Optional-Felder

```python
class ArticleCreate(BaseModel):
    title: str                        # Pflichtfeld
    slug: str                         # Pflichtfeld
    body: str                         # Pflichtfeld
    excerpt: Optional[str] = None     # Optional: kann fehlen, Standard ist None
    category_id: Optional[int] = None # Optional: kann fehlen
```

`Optional[str]` ist gleichbedeutend mit `str | None` in modernem Python.

---

### model_config — SQLAlchemy-Objekte lesen

```python
class ArticleOut(BaseModel):
    id: int
    title: str
    ...
    model_config = {"from_attributes": True}
    # früher: class Config: orm_mode = True
```

Ohne `from_attributes = True` kann Pydantic nur von Python-Dictionaries lesen. Mit dieser Einstellung kann es auch SQLAlchemy-Objekte (die Attribute statt Dictionary-Keys haben) lesen. Nötig für alle Output-Schemas, die Datenbankdaten zurückgeben.

---

### model_dump() — Schema zu Dictionary

```python
# Aus routers/articles.py:
article = models.Article(**data.model_dump(), author_id=admin.id)

# data ist ArticleCreate (Pydantic-Objekt)
# data.model_dump() → {"title": "...", "slug": "...", "body": "...", "excerpt": None, "category_id": 2}
# **{...} → title="...", slug="...", body="...", ...
```

```python
# exclude_unset=True für PATCH/PUT — nur gesendete Felder:
for field, value in data.model_dump(exclude_unset=True).items():
    setattr(article, field, value)
# Wenn nur {"body": "neuer Text"} gesendet wurde:
# → nur body wird geändert, title/excerpt bleiben unberührt
```

---

### Verschachtelte Schemas

```python
class ArticleOut(BaseModel):
    id: int
    title: str
    category: Optional[CategoryOut]   # verschachteltes Schema
    author: UserOut                   # verschachteltes Schema
    ...
    model_config = {"from_attributes": True}
```

Wenn `article.category` ein `Category`-SQLAlchemy-Objekt ist, wird es automatisch in `CategoryOut` serialisiert — dank `from_attributes = True`.

---

## 5. JWT & Passwort-Sicherheit

### bcrypt — Passwort-Hashing

```python
# Aus auth.py:
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
# CryptContext verwaltet das Hashing-Schema

def hash_password(password: str) -> str:
    return pwd_context.hash(password)
    # "meinPasswort" → "$2b$12$XkJcU..." (bcrypt-Hash, 60 Zeichen)

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)
    # vergleicht "meinPasswort" mit dem Hash — gibt True/False zurück
    # man kann aus dem Hash das Passwort NICHT zurückrechnen
```

**Wie bcrypt funktioniert (vereinfacht):**
1. Zufälliger Salt wird generiert und in den Hash eingebettet
2. Passwort + Salt werden viele Male gehasht (Work-Factor 12 = 2^12 Iterationen)
3. Ergebnis ist immer verschieden, auch bei gleichem Passwort (wegen Salt)
4. Verifikation: Salt aus Hash extrahieren, gleiche Operation, Ergebnis vergleichen

---

### JWT erstellen und lesen

```python
# Aus auth.py:
SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 1440

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()           # Kopie damit das Original nicht verändert wird
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode["exp"] = expire         # Ablaufzeit hinzufügen
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    # → "eyJhbGci..." (Base64-kodierter JWT)

# Beim Login:
token = create_access_token({"sub": str(user.id)})
# "sub" (subject) = wer der Token ist, hier die User-ID als String
```

```python
def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    if not token:
        return None
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        # prüft Signatur + Ablaufzeit automatisch
        user_id = payload.get("sub")    # liest "sub" aus dem Payload
        if user_id is None:
            return None
    except JWTError:
        return None                     # ungültiger Token → kein User
    return db.query(models.User).filter(models.User.id == int(user_id)).first()
```

---

### OAuth2PasswordBearer — Token aus HTTP-Header lesen

```python
# Aus auth.py:
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)
```

`oauth2_scheme` ist eine Dependency: Sie liest den `Authorization: Bearer <token>`-Header aus dem HTTP-Request und gibt den Token-String zurück.  
`auto_error=False` — wenn kein Token vorhanden ist, gibt sie `None` zurück statt einen Fehler zu werfen (damit öffentliche Endpunkte funktionieren).

---

### Dependency-Kaskade: require_admin

```python
def require_admin(current_user: Optional[models.User] = Depends(get_current_user)) -> models.User:
    if not current_user or not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin-Zugriff erforderlich")
    return current_user
```

Diese Funktion hängt selbst von `get_current_user` ab. FastAPI löst das automatisch auf:

```
Request → @router.post("/") mit Depends(require_admin)
       → require_admin braucht get_current_user
          → get_current_user braucht oauth2_scheme (Token aus Header)
          → get_current_user braucht get_db (DB-Session)
       → require_admin: User Admin? ja/nein → weiter oder 403
```

---

# JAVASCRIPT / REACT

## 6. JavaScript — Grundlagen & Syntax

### Imports und Exports

```js
// Named Export — aus der Datei exportieren:
export const api = axios.create({...});
export const authApi = {...};
export function AuthProvider({children}) {...}

// Default Export — pro Datei nur einer:
export default function Login() {...}
export default function ArticleCard({...}) {...}

// Named Import:
import { api, authApi } from '../api/client';
import { useState, useEffect } from 'react';

// Default Import:
import Login from './pages/Login';
import App from './App';

// Beides zusammen:
import React, { useState } from 'react';
```

Named Exports brauchen `{}` beim Import, Default Exports nicht (und können umbenannt werden).

---

### Arrow Functions

```js
// Aus api/client.js:
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Aus Admin.jsx:
const toSlug = (title) =>
  title.toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/[^a-z0-9]+/g, '-');

// Aus Articles.jsx:
const toggle = (slug) => setOpenSlug(prev => prev === slug ? null : slug);
```

Arrow Functions (`=>`) sind kurze Funktionsschreibweisen:
- `(param) => ausdruck` — implizites return wenn kein Block `{}`
- `(param) => { anweisungen; return wert; }` — mit Block und explizitem return
- `prev => prev === slug ? null : slug` — mini-Funktion, 1 Parameter (keine Klammern)

---

### Template Literals (Backtick-Strings)

```js
// Aus api/client.js:
get: (slug) => api.get(`/api/articles/${slug}`),
verifyEmail: (token) => api.get(`/api/auth/verify-email?token=${token}`),

// Aus Admin.jsx — mehrzeilige Klassen:
className={`card transition-colors ${isOpen ? 'border-phosphor/30' : 'hover:border-phosphor-muted/40'}`}
```

`` `...${ausdruck}...` `` — wie f-Strings in Python.  
Kann mehrzeilig sein. Erlaubt Ausdrücke in `${}`.

---

### Destructuring — Werte auspacken

```js
// Array-Destructuring:
const [articles, setArticles] = useState([]);
const [searchParams] = useSearchParams();   // nur erstes Element

// Object-Destructuring (aus Props):
export default function ArticleCard({ article }) {...}
export default function ProtectedRoute({ children }) {...}

// Aus Auth-Context:
const { user, login, logout } = useAuth();
const { slug } = useParams();
```

`const [a, b] = [1, 2]` — `a = 1`, `b = 2`  
`const {name, age} = person` — `name = person.name`, `age = person.age`

---

### Spread-Operator `...`

```js
// Objekt zusammenführen (aus EmulatorScreen.jsx):
emulatorRef.current = new window.V86({
  ...EMULATOR_CONFIG,              // alle Properties aus EMULATOR_CONFIG
  screen_container: screenRef.current,  // + diese zusätzliche Property
});

// Array erweitern (aus Articles.jsx):
const categories = ['Alle', ...new Set(articles.map(a => a.category?.name).filter(Boolean))];
// ...Set(...) = Set in Array verwandeln
```

`...obj` in einem `{}` → kopiert alle Properties des Objekts an diese Stelle.  
`...array` in einem `[]` → fügt alle Elemente ein.

---

### Optional Chaining `?.`

```js
// Aus Register.jsx:
setError(err.response?.data?.detail || 'Registrierung fehlgeschlagen.');
// Wenn err.response existiert: err.response.data.detail
// Wenn nicht: undefined (kein TypeError!)

// Aus Articles.jsx:
articles.map(a => a.category?.name).filter(Boolean)
// a.category?.name → wenn category null/undefined ist: gibt undefined (kein Fehler)
// .filter(Boolean) → entfernt alle undefined/null/false-Werte

// Aus AuthContext.jsx:
const location = useLocation();
const from = location.state?.from?.pathname || '/emulator';
```

`obj?.property` → gibt `undefined` zurück wenn `obj` null/undefined ist, statt einen TypeError zu werfen.

---

### Ternary-Operator (Bedingungsausdruck)

```js
// Aus EmulatorScreen.jsx:
<div className={`w-2 h-2 rounded-full ${
  status === 'ready' ? 'bg-phosphor' :
  status === 'error' ? 'bg-red-500'  :
  'bg-phosphor animate-pulse'
}`} />

// Aus Register.jsx:
{loading ? 'Konto wird erstellt...' : 'Konto erstellen'}

// Aus Admin.jsx:
{editId ? '[ ARTIKEL BEARBEITEN ]' : '[ NEUER ARTIKEL ]'}
```

`bedingung ? wenn_wahr : wenn_falsch`  
Kann verschachtelt werden: `a ? b : c ? d : e`

---

### Array-Methoden

```js
// .map() — transformiert jedes Element:
articles.map(a => a.category?.name)  // → Array von Namen
articles.map(article => <ArticleCard article={article} />)  // → Array von JSX

// .filter() — behält nur passende Elemente:
articles.filter(a => a.category?.name === activeCategory)
[...].filter(Boolean)  // entfernt alle falsy Werte (null, undefined, '', 0, false)

// .find() — erstes passendes Element:
const existing = db.query(models.Article).filter(...).first()  // Python-Äquivalent

// Chaining — mehrere Methoden hintereinander:
articles.map(a => a.category?.name).filter(Boolean)

// new Set() — entfernt Duplikate:
const categories = ['Alle', ...new Set(articles.map(a => a.category?.name).filter(Boolean))];
// Wenn mehrere Artikel "Hardware" haben → nur ein "Hardware" in der Liste
```

---

### async / await in JavaScript

```js
// Aus Login.jsx:
const handleSubmit = async (e) => {
  e.preventDefault();        // verhindert Standard-Formular-Submit (Seite neu laden)
  setError('');
  setLoading(true);
  try {
    const res = await authApi.login(email, password);  // wartet auf HTTP-Response
    await login(res.data.access_token);                // wartet auf User-Daten
    navigate(from, { replace: true });
  } catch {
    setError('E-Mail oder Passwort falsch.');
  } finally {
    setLoading(false);
  }
};
```

`async function` — gibt immer ein Promise zurück.  
`await` — pausiert die Funktion bis das Promise erfüllt ist.  
`try/catch/finally` — wie in Python: Fehler abfangen, immer ausführen.

---

### localStorage — Browser-Speicher

```js
// Speichern:
localStorage.setItem('token', 'eyJhbGci...');

// Lesen:
const token = localStorage.getItem('token');  // null wenn nicht gesetzt

// Löschen:
localStorage.removeItem('token');
```

`localStorage` überlebt Seitenneuladen und Tab-Schließen. Bleibt bis zum expliziten Löschen oder Browser-Datenlöschung erhalten. Ist nur JavaScript-seitig zugänglich (anders als HTTP-Only Cookies).

---

## 7. React — Komponenten & JSX

### Function Components

```jsx
// Aus ProtectedRoute.jsx — minimalste Komponente:
export default function ProtectedRoute({ children }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}
```

Eine React-Komponente ist eine Funktion, die JSX zurückgibt (oder `null` für "nichts rendern").  
`children` ist ein spezielles Prop: alles, was zwischen `<ProtectedRoute>` und `</ProtectedRoute>` steht.

---

### JSX — JavaScript + XML

JSX ist JavaScript mit HTML-ähnlicher Syntax. Es wird von Vite/Babel in echtes JavaScript umgewandelt.

```jsx
// JSX:
<div className="card p-4">
  <h1>{article.title}</h1>
  <p style={{ color: 'red' }}>{article.excerpt}</p>
</div>

// Wird zu JavaScript:
React.createElement('div', { className: 'card p-4' },
  React.createElement('h1', null, article.title),
  React.createElement('p', { style: { color: 'red' } }, article.excerpt)
)
```

**Wichtige Unterschiede zu HTML:**
- `class` → `className` (weil `class` ein JS-Keyword ist)
- `for` → `htmlFor`
- Inline-Styles: `style={{ color: 'red', fontSize: '14px' }}` (Objekt mit camelCase)
- Alle Tags müssen geschlossen sein: `<br />`, `<input />`, `<img />`
- `{ausdruck}` für JavaScript-Ausdrücke

---

### Conditional Rendering

```jsx
// Variante 1: &&-Operator (zeige wenn Bedingung wahr):
{error && <div className="text-red-400">{error}</div>}
{!isFullscreen && statusLabel && <div>...</div>}

// Variante 2: Ternary:
{loading ? <div>Lade...</div> : <div>Inhalt</div>}

// Variante 3: if/else (außerhalb von JSX):
if (error) {
  return <div className="card border-red-800">{error}</div>;
}
if (!article) {
  return <div className="animate-pulse">Lade Artikel...</div>;
}
return <div className="max-w-3xl">{article.title}</div>;
```

---

### Listen rendern (`.map()` mit `key`)

```jsx
// Aus App.jsx:
{FEATURES.map(f => (
  <div key={f.title} className="card">
    <h3>{f.title}</h3>
    <p>{f.desc}</p>
  </div>
))}

// Aus Articles.jsx:
{filtered.map(article => {
  const isOpen = openSlug === article.slug;
  return (
    <div key={article.slug} className="card">
      ...
    </div>
  );
})}
```

`key` ist ein Pflicht-Prop beim Rendern von Listen. React nutzt es, um effizient zu erkennen, welche Elemente sich geändert haben. Der Key muss eindeutig sein (nicht der Index wenn die Liste sich ändert — lieber `id` oder `slug` verwenden).

---

### Props — Daten an Komponenten übergeben

```jsx
// Eltern-Komponente übergibt Props:
<ArticleCard article={article} onDelete={handleDelete} isAdmin={true} />

// Kind-Komponente empfängt Props:
export default function ArticleCard({ article, onDelete, isAdmin }) {
  return (
    <div>
      <h2>{article.title}</h2>
      {isAdmin && <button onClick={() => onDelete(article.id)}>Löschen</button>}
    </div>
  );
}
```

Props fließen immer von Eltern → Kind (unidirektional). Für umgekehrte Kommunikation übergibt man eine Callback-Funktion als Prop.

---

### Event Handler

```jsx
// Aus Login.jsx:
<form onSubmit={handleSubmit}>           // Formular abgeschickt
<input onChange={e => setEmail(e.target.value)} />  // Text geändert
<button onClick={startEmulator}>         // Klick

// e.preventDefault() — verhindert Standard-Browser-Verhalten:
const handleSubmit = async (e) => {
  e.preventDefault();   // verhindert: Seite neu laden (was Submit sonst macht)
  ...
};
```

Event-Handler in React: `on` + Eventname mit großem Buchstaben: `onClick`, `onChange`, `onSubmit`, `onKeyDown`.

---

## 8. React Hooks im Detail

Hooks sind Funktionen, die nur in Function Components (und anderen Hooks) aufgerufen werden dürfen. Sie beginnen immer mit `use`.

### useState — Zustandsverwaltung

```jsx
// Aus Login.jsx:
const [email, setEmail] = useState('');          // Initialwert: leerer String
const [loading, setLoading] = useState(false);   // Initialwert: false
const [error, setError] = useState('');

// Lesen:
<input value={email} />
{loading && <span>Lade...</span>}

// Schreiben:
setEmail(e.target.value);           // neuer Wert direkt
setLoading(true);

// Schreiben basierend auf vorherigem Wert (sicherer bei schnellen Updates):
setOpenSlug(prev => prev === slug ? null : slug);
```

Wenn `setState` aufgerufen wird, rendert React die Komponente neu (mit dem neuen Wert). `useState` gibt immer `[aktueller_wert, setter_funktion]` zurück.

---

### useEffect — Seiteneffekte

"Seiteneffekte" = alles, was außerhalb des Renderings passiert: API-Aufrufe, Subscriptions, Timer, DOM-Manipulation.

```jsx
// Aus Articles.jsx — beim ersten Render laden:
useEffect(() => {
  articlesApi.list()
    .then(res => setArticles(res.data))
    .catch(() => setError('Backend nicht erreichbar.'))
    .finally(() => setLoading(false));
}, []);   // ← leeres Array = nur beim ersten Render

// Aus ArticleDetail.jsx — laden wenn sich slug ändert:
useEffect(() => {
  articlesApi.get(slug)
    .then(res => setArticle(res.data))
    .catch(() => setError('Artikel nicht gefunden.'));
}, [slug]);   // ← wenn 'slug' sich ändert: Effect läuft erneut

// Aus AuthContext.jsx — beim ersten Render, kein Cleanup nötig:
useEffect(() => {
  const token = localStorage.getItem('token');
  if (!token) { setLoading(false); return; }
  api.get('/api/users/me')
    .then(res => setUser(res.data))
    .catch(() => localStorage.removeItem('token'))
    .finally(() => setLoading(false));
}, []);

// Aus EmulatorScreen.jsx — mit Cleanup:
useEffect(() => {
  return () => { if (emulatorRef.current) emulatorRef.current.destroy(); };
  // Cleanup: wird aufgerufen wenn Komponente entfernt wird
}, []);
```

**Dependency-Array `[...]`:**
- `[]` — Effect läuft nur einmal (wie componentDidMount)
- `[slug]` — Effect läuft wenn `slug` sich ändert
- kein Array — Effect läuft nach jedem Render (meistens unerwünscht)
- `return () => {...}` — Cleanup-Funktion: läuft vor dem nächsten Effect oder beim Unmount

---

### useRef — Referenzen auf DOM-Elemente

```jsx
// Aus EmulatorScreen.jsx:
const containerRef = useRef(null);   // Initialwert: null
const screenRef = useRef(null);
const emulatorRef = useRef(null);    // für JS-Objekte, nicht nur DOM

// In JSX an Element binden:
<div ref={containerRef} className="...">
  <div ref={screenRef} ...>

// Im Code nutzen:
containerRef.current?.requestFullscreen();
screenRef.current.offsetWidth   // DOM-Eigenschaften lesen
emulatorRef.current.destroy()   // Methoden auf JS-Objekt aufrufen

// Nicht-DOM-Objekte speichern (emulatorRef.current = v86-Instanz):
emulatorRef.current = new window.V86({...});
```

`useRef` ist wie eine "Box", die einen Wert hält ohne einen Re-Render auszulösen (anders als `useState`). Perfekt für: DOM-Elemente referenzieren, Werte zwischen Renders merken (ohne Re-Render), externe Objekte speichern.

---

### useContext und createContext

```jsx
// Aus AuthContext.jsx — Context erstellen:
const AuthContext = createContext(null);

// Provider — stellt Daten bereit (in App.jsx):
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  ...
  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Aus App.jsx — Provider wrappen:
<AuthProvider>
  <Navbar />
  <Routes>...</Routes>
</AuthProvider>

// Custom Hook für einfachen Zugriff:
export const useAuth = () => useContext(AuthContext);

// In jeder Kind-Komponente (aus Navbar.jsx, Login.jsx, etc.):
const { user, logout } = useAuth();
```

Context löst "Prop Drilling" — das Problem, Props durch viele Ebenen nach unten reichen zu müssen. Statt `App → Navbar → Button → Icon` mit dem User-Prop, kann jede Komponente direkt `useAuth()` aufrufen.

---

### useNavigate und useLocation

```jsx
// Aus Login.jsx:
const navigate = useNavigate();
const location = useLocation();
const from = location.state?.from?.pathname || '/emulator';

// Nach Login weiterleiten:
navigate(from, { replace: true });
// { replace: true } — ersetzt den Eintrag im Browser-Verlauf (Back-Button geht nicht zurück zur Login-Seite)

// Aus Navbar.jsx:
const navigate = useNavigate();
const handleLogout = () => {
  logout();
  navigate('/');   // zur Startseite weiterleiten
};
```

```jsx
// Aus ProtectedRoute.jsx — Weiterleitungsziel merken:
return <Navigate to="/login" state={{ from: location }} replace />;
// state={{ from: location }} speichert die aktuelle URL
// Nach dem Login kann Login.jsx zu location.state.from.pathname zurücknavigieren
```

---

### useParams — URL-Parameter lesen

```jsx
// Route Definition (App.jsx):
<Route path="/articles/:slug" element={<ArticleDetail />} />

// In der Komponente (ArticleDetail.jsx):
const { slug } = useParams();
// URL /articles/mein-artikel → slug = "mein-artikel"
```

---

### useSearchParams — Query-String lesen

```jsx
// Aus VerifyEmail.jsx:
const [searchParams] = useSearchParams();

useEffect(() => {
  const token = searchParams.get('token');
  // URL: /verify-email?token=abc123
  // token = "abc123"
  ...
}, [searchParams]);
```

---

## 9. React Router im Detail

### Routing-Struktur

```jsx
// Aus App.jsx:
import { Routes, Route, Link } from 'react-router-dom';

<Routes>
  <Route path="/" element={<Home />} />
  <Route path="/articles/:slug" element={<ArticleDetail />} />
  
  {/* Geschützte Route — in ProtectedRoute gewrapped: */}
  <Route
    path="/emulator"
    element={
      <ProtectedRoute>
        <Emulator />
      </ProtectedRoute>
    }
  />
</Routes>
```

`<Routes>` wählt immer die erste passende Route.  
`element={<Komponente />}` — was gerendert wird.  
`:slug` in `path` → URL-Parameter, lesbar mit `useParams()`.

---

### Link vs. a-Tag

```jsx
// React Router Link — KEIN Seitenneuladen:
<Link to="/articles">Infothek</Link>
<Link to={`/articles/${article.slug}`}>Artikel lesen</Link>

// Normales HTML a-Tag — lädt die Seite NEU:
<a href="/articles">Infothek</a>  // ← falsch in React-Router-Apps!
```

`<Link>` nutzt die Browser-History-API und tauscht nur den React-Inhalt aus (Single Page Application).

---

### Navigate-Komponente vs. navigate()-Funktion

```jsx
// Aus ProtectedRoute.jsx — Redirect als JSX (declarativ):
return <Navigate to="/login" state={{ from: location }} replace />;

// Aus Login.jsx — Redirect im Code nach einer Aktion (imperativ):
const navigate = useNavigate();
navigate(from, { replace: true });
```

`<Navigate>` — sofortiger Redirect beim Rendern (gut für "du darfst das nicht sehen").  
`navigate()` — programmatischer Redirect nach einer Aktion (gut für "nach dem Login weiterleiten").

---

## 10. Axios — HTTP-Client im Detail

### Axios-Instanz mit Konfiguration

```js
// Aus api/client.js:
export const api = axios.create({
  baseURL: '/',                              // relative URL — funktioniert mit dem Vite-Proxy
  headers: { 'Content-Type': 'application/json' },
});
```

`axios.create({...})` erstellt eine konfigurierte Instanz. Alle Requests über diese Instanz haben dieselbe Basiskonfiguration.

---

### Interceptors — jeden Request / jede Response abfangen

```js
// Request-Interceptor — vor dem Absenden:
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;  // modifiziertes config-Objekt zurückgeben
});
```

Interceptors sind wie Middleware für HTTP. Hier: Jeder Request bekommt automatisch den JWT-Token im Authorization-Header — man muss das nicht bei jedem Aufruf manuell tun.

`Bearer <token>` ist das Standard-Format für Token-basierte Authentifizierung.

---

### Request-Methoden

```js
// GET — Daten lesen:
api.get('/api/articles/')
api.get(`/api/articles/${slug}`)
api.get(`/api/auth/verify-email?token=${token}`)

// POST — Daten anlegen:
api.post('/api/auth/login', { email, password })
api.post('/api/articles/', data)

// PUT — Daten ersetzen/aktualisieren:
api.put(`/api/articles/${id}`, data)

// DELETE — Daten löschen:
api.delete(`/api/articles/${id}`)
```

---

### Response und Fehlerbehandlung

```js
// Aus Register.jsx:
try {
  const res = await authApi.register(email, username, password);
  setSuccess(res.data.message);    // res.data = JSON-Response des Backends
} catch (err) {
  // Axios wirft einen Error wenn HTTP-Status ≥ 400:
  setError(err.response?.data?.detail || 'Registrierung fehlgeschlagen.');
  // err.response?.data?.detail = FastAPI-Fehlermeldung ({"detail": "..."})
  // || 'Fallback' = wenn kein Detail vorhanden (z.B. Netzwerkfehler)
}
```

`res.data` — der geparste JSON-Body der Response.  
`err.response` — die HTTP-Response des Servers (null bei Netzwerkfehler).  
`err.response.data.detail` — FastAPIs Fehlermeldung.

---

### Promise-Syntax (Alternative zu async/await)

```js
// Aus AuthContext.jsx — .then/.catch/.finally statt async/await:
api.get('/api/users/me')
  .then(res => setUser(res.data))           // bei Erfolg
  .catch(() => localStorage.removeItem('token'))  // bei Fehler
  .finally(() => setLoading(false));        // immer

// Aus Articles.jsx:
articlesApi.list()
  .then(res => setArticles(res.data))
  .catch(() => setError('Backend nicht erreichbar.'))
  .finally(() => setLoading(false));
```

`.then(fn)` und `await` sind gleichwertig — in `useEffect` wird oft `.then/.catch` verwendet, weil `useEffect` keine async-Funktion direkt nehmen kann (Workaround nötig).

---

# CSS & STYLING

## 11. Tailwind CSS im Detail

### Utility-Klassen — das Grundprinzip

```html
<!-- Kein eigenes CSS schreiben. Stattdessen: fertige Klassen kombinieren -->
<div class="bg-black text-green-400 font-mono p-4 rounded border border-green-800">
  Hello
</div>
```

Jede Klasse macht genau eine CSS-Sache:
- `bg-black` → `background-color: black`
- `text-green-400` → `color: #4ade80`
- `font-mono` → `font-family: monospace`
- `p-4` → `padding: 1rem` (16px)
- `rounded` → `border-radius: 0.25rem`
- `border` → `border-width: 1px`
- `border-green-800` → `border-color: #166534`

---

### Spacing (Abstände)

```jsx
// p = padding (innen), m = margin (außen)
// t = top, r = right, b = bottom, l = left, x = left+right, y = top+bottom

p-4      → padding: 1rem (alle Seiten)
px-4     → padding-left + padding-right: 1rem
py-6     → padding-top + padding-bottom: 1.5rem
pt-2     → padding-top: 0.5rem
mt-8     → margin-top: 2rem
mb-4     → margin-bottom: 1rem
mx-auto  → margin-left + margin-right: auto (zentriert)
space-y-4 → Abstand zwischen Kind-Elementen (vertikale Richtung): 1rem
gap-4    → gap in Flex/Grid: 1rem
```

Die Zahlen: `1 = 0.25rem`, `2 = 0.5rem`, `4 = 1rem`, `6 = 1.5rem`, `8 = 2rem`, `12 = 3rem`, `16 = 4rem`

---

### Farben und Transparenz (Opacity Modifier)

```jsx
// Aus dem Projekt — benutzerdefinierte Farben:
text-phosphor          → color: #39FF7A
bg-crt-black           → background-color: #000000
border-phosphor-muted  → border-color: #1EA758

// Opacity Modifier (neu in Tailwind 3):
text-phosphor/50       → color: #39FF7A mit 50% Transparenz
border-phosphor/20     → border-color: #39FF7A mit 20% Transparenz
bg-phosphor/5          → background-color: #39FF7A mit 5% Transparenz

// Standard Tailwind-Farben (Skala 50-950):
text-white             → color: #ffffff
text-red-400           → color: #f87171
bg-red-950/30          → background: rgb(69,10,10) mit 30% Transparenz
```

---

### Layout: Flexbox

```jsx
// Aus Navbar.jsx:
<div className="flex items-center justify-between">
  {/* links */}
  <div className="flex items-center gap-6">
    {/* rechts */}
  </div>
</div>
```

- `flex` → `display: flex`
- `items-center` → `align-items: center` (vertikal zentriert)
- `justify-between` → `justify-content: space-between` (Abstand zwischen Elementen)
- `justify-center` → `justify-content: center`
- `flex-col` → `flex-direction: column`
- `flex-1` → `flex: 1` (nimmt verfügbaren Platz)
- `flex-wrap` → erlaubt Umbruch auf nächste Zeile
- `flex-shrink-0` → Element darf nicht schrumpfen

---

### Layout: Grid

```jsx
// Aus Home.jsx:
<div className="grid md:grid-cols-3 gap-6">
  {FEATURES.map(f => <div key={f.title} className="card">...</div>)}
</div>
```

- `grid` → `display: grid`
- `grid-cols-3` → 3 gleichbreite Spalten
- `md:grid-cols-3` → nur ab Breakpoint `md` (768px) 3 Spalten; darunter: 1 Spalte

---

### Responsive Design — Breakpoints

```jsx
// Aus Navbar.jsx:
<span className="font-display text-phosphor text-lg hidden sm:inline tracking-wider">1512dd</span>
// hidden   → display: none (auf kleinen Screens versteckt)
// sm:inline → ab 640px sichtbar
```

**Breakpoints** (Mobile-First — "ab dieser Breite gilt"):
- `sm:` — ab 640px
- `md:` — ab 768px
- `lg:` — ab 1024px
- `xl:` — ab 1280px

Ohne Prefix = gilt für alle Größen (Mobile-First-Standard).

---

### Hover, Focus, Transitions

```jsx
// Hover-Effekte:
<button className="hover:bg-phosphor-soft transition-colors">Button</button>
<Link className="hover:opacity-80 hover:underline">Link</Link>

// Focus (für Eingabefelder):
<input className="focus:outline-none focus:border-phosphor" />

// Disabled:
<button disabled={loading} className="disabled:opacity-50 disabled:cursor-not-allowed">
```

`hover:klasse` → gilt nur wenn Maus drüber ist  
`focus:klasse` → gilt nur wenn Element fokussiert ist  
`transition-colors` → CSS-Transition für Farbwechsel (`transition: color 150ms ease`)  
`transition-opacity` → Transition für Transparenz

---

### Eigene Klassen mit `@layer` und `@apply`

```css
/* Aus index.css: */
@layer components {
  .btn-primary {
    @apply px-4 py-2 bg-phosphor text-black font-bold rounded hover:bg-phosphor-soft transition-colors disabled:opacity-50;
  }
  .card {
    @apply bg-crt-ink border border-phosphor-muted/20 rounded-lg p-6;
  }
  .input-field {
    @apply w-full bg-crt-dark border border-phosphor-muted/40 rounded px-3 py-2 text-phosphor font-mono
           focus:outline-none focus:border-phosphor transition-colors;
  }
}
```

`@apply` — wendet Tailwind-Klassen innerhalb von CSS an.  
`@layer components` — registriert die Klassen als "Komponenten" (zwischen base und utilities in der Cascade).

---

### Tailwind-Konfiguration

```js
// Aus tailwind.config.cjs:
module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  // ↑ Tailwind scannt diese Dateien nach verwendeten Klassen
  // Nicht verwendete Klassen werden aus dem finalen CSS entfernt (Tree-Shaking)!
  
  theme: {
    extend: {
      colors: {
        phosphor: {
          DEFAULT: '#39FF7A',    // text-phosphor, bg-phosphor
          soft: '#AAFFCC',       // text-phosphor-soft
          muted: '#1EA758',      // text-phosphor-muted
        },
      },
      fontFamily: {
        mono: ['"Share Tech Mono"', '"Courier New"', 'monospace'],
        // font-mono nutzt jetzt zuerst "Share Tech Mono"
      },
    },
  },
};
```

`extend` — ergänzt Tailwinds Standardwerte (überschreibt sie nicht komplett).

---

### className mit Bedingungen

```jsx
// Aus Articles.jsx — klassische Variante mit Ternary:
className={`px-3 py-1 rounded font-mono text-xs ${
  activeCategory === cat
    ? 'bg-phosphor text-black font-bold'
    : 'border border-phosphor-muted/30 hover:border-phosphor/50'
}`}

// Aus EmulatorScreen.jsx — mehrere Bedingungen:
className={`w-2 h-2 rounded-full ${
  status === 'ready' ? 'bg-phosphor' :
  status === 'error' ? 'bg-red-500'  :
  'bg-phosphor animate-pulse'
}`}
```

Template-Literal + Ternary-Operator = dynamische Klassen. Wichtig: Alle Klassen-Strings müssen vollständig ausgeschrieben sein (Tailwind kann keine "zusammengesetzten" Klassen wie `text-${farbe}` erkennen beim Tree-Shaking).

---

# INFRASTRUKTUR

## 12. Docker & Dockerfile — Syntax erklärt

### Backend Dockerfile

```dockerfile
# Aus backend/Dockerfile:

FROM python:3.11-slim
# "Starte mit diesem Basis-Image"
# python:3.11-slim = Python 3.11 auf einem schlanken Debian-Linux
# Alternativen: python:3.11 (größer, mehr Tools), python:3.11-alpine (noch kleiner)

ENV PYTHONUNBUFFERED=1
# Umgebungsvariable setzen: Python-Output nicht puffern
# → Log-Ausgaben erscheinen sofort (nicht erst wenn der Buffer voll ist)

WORKDIR /app
# Arbeitsverzeichnis setzen — alle folgenden Befehle laufen hier
# Verzeichnis wird erstellt falls es nicht existiert

COPY requirements.txt .
# Kopiert requirements.txt vom Host in das Image (aktuelles Verzeichnis = /app)
# ZUERST nur requirements.txt kopieren — warum? Docker-Cache:
# Wenn sich requirements.txt nicht ändert, wird der pip install-Layer gecacht
# → schnellere Builds wenn nur Python-Code geändert wurde

RUN pip install --no-cache-dir -r requirements.txt
# Führt einen Befehl beim BUILD aus (nicht beim Starten!)
# --no-cache-dir = keinen pip-Cache speichern (kleineres Image)

COPY . .
# Jetzt erst den gesamten Code kopieren

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
# Befehl beim STARTEN des Containers
# main:app = Modul "main", Variable/Objekt "app" (= die FastAPI-Instanz)
# --host 0.0.0.0 = auf allen Netzwerk-Interfaces horchen (nicht nur localhost!)
# --port 8000 = Port 8000
```

---

### Frontend Dockerfile (Multi-Stage Build)

```dockerfile
# Aus frontend/Dockerfile:

# ═══ STAGE 1: Bauen ═══════════════════════════════════
FROM node:20-alpine AS builder
# "AS builder" = dieser Stage heißt "builder" (für Referenz in Stage 2)
# node:20-alpine = Node.js 20 auf Alpine Linux (sehr klein)

WORKDIR /app
COPY package*.json ./
# package.json UND package-lock.json kopieren
# ./ = Ziel ist das aktuelle WORKDIR

RUN npm ci
# "clean install" — installiert exakt die Versionen aus package-lock.json
# Besser als npm install für reproducible builds in CI/CD

COPY . .
# Quellcode kopieren

RUN npm pack v86 && \
    tar xzf v86-*.tgz && \
    mkdir -p public/v86 && \
    cp package/build/libv86.js public/v86/ && \
    cp package/build/v86.wasm public/v86/ && \
    rm -rf package v86-*.tgz
# Mehrere Befehle mit && verbunden = ein RUN-Layer (sparrt Image-Größe)
# npm pack v86 = v86-npm-Paket herunterladen und als .tgz speichern
# tar xzf = entpacken
# cp = Dateien kopieren
# rm -rf = temporäre Dateien löschen

RUN wget -q -O public/v86/seabios.bin https://raw.githubusercontent.com/...
# wget = Datei herunterladen
# -q = quiet (keine Fortschrittsanzeige)
# -O dateiname = Zieldatei angeben

RUN npm run build
# React-App bauen: src/ → dist/ (optimierte statische Dateien)

# ═══ STAGE 2: Ausführen ════════════════════════════════
FROM nginx:alpine
# Frisches Image — enthält NICHT mehr den Node.js/Build-Prozess!
# Nur nginx (Webserver) + Alpine Linux

COPY --from=builder /app/dist /usr/share/nginx/html
# Aus Stage "builder" die fertigen Dateien holen
# → /usr/share/nginx/html ist nginx's Standard-Webroot

COPY nginx.conf /etc/nginx/conf.d/default.conf
# nginx-Konfiguration rein

EXPOSE 80
# Dokumentiert welchen Port der Container nutzt (optional, aber gute Praxis)
# Öffnet den Port NICHT tatsächlich — das macht docker-compose mit "ports:"
```

**Warum Multi-Stage?** Das finale Image enthält nur nginx + statische Dateien. Node.js (600 MB+) ist nicht drin. Das Image ist minimal, schnell zu laden, kleiner Angriffspunkt.

---

## 13. Docker Compose (YAML) — Syntax erklärt

### YAML-Grundlagen

YAML ist eine Konfigurationssprache (Yet Another Markup Language). **Einrückung ist bedeutsam** (wie in Python).

```yaml
# Kommentar

services:
  db:            # String als Schlüssel
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD:-pc1512dev}
      #                    ↑ Variable aus .env
      #                                   ↑ Default wenn Variable fehlt
    volumes:
      - mysql_data:/var/lib/mysql          # benanntes Volume
      - ./db/init.sql:/docker-entrypoint-initdb.d/01_init.sql  # Datei-Mount
    #   ↑ Host-Pfad     ↑ Container-Pfad
```

---

### Die gesamte docker-compose.yml erklärt

```yaml
# Aus docker-compose.yml:

version: '3.8'
# Docker Compose Dateiformat-Version (informativ, wird oft ignoriert)

services:

  # ── DATENBANK ─────────────────────────────────────────
  db:
    image: mysql:8.0
    # Fertiges Docker Hub Image nutzen (kein Dockerfile)
    
    environment:
      MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD:-pc1512dev}
      # ${VARIABLE:-fallback}: liest aus .env, Fallback wenn nicht gesetzt
      MYSQL_DATABASE: ${MYSQL_DATABASE:-pc1512}
    
    volumes:
      - mysql_data:/var/lib/mysql
      # "mysql_data" = benanntes Volume (persistent!)
      # /var/lib/mysql = wo MySQL seine Daten speichert
      
      - ./db/init.sql:/docker-entrypoint-initdb.d/01_init.sql
      # Datei-Mount: lokale Datei → Container-Pfad
      # MySQL führt alle .sql-Dateien in /docker-entrypoint-initdb.d/ beim ersten Start aus
    
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost", ...]
      interval: 10s   # alle 10 Sekunden prüfen
      timeout: 5s     # nach 5 Sekunden abbrechen
      retries: 8      # 8 Mal versuchen bevor "unhealthy"
    # → Backend wartet bis DB healthy ist (depends_on + condition)
    
    restart: unless-stopped
    # Automatisch neu starten wenn Container abstürzt
    # "unless-stopped" = startet neu, außer wenn manuell gestoppt

  # ── BACKEND ───────────────────────────────────────────
  backend:
    build: ./backend
    # Dockerfile in ./backend/ zum Bauen nutzen
    
    ports:
      - "8000:8000"
      # "host_port:container_port" — Port nach außen verfügbar machen
      # Im Prod-Setup NICHT vorhanden — nur nginx darf auf Backend zugreifen
    
    env_file:
      - .env
      # Alle Variablen aus .env laden
    
    environment:
      DATABASE_URL: mysql+pymysql://root:${MYSQL_ROOT_PASSWORD:-pc1512dev}@db:3306/${MYSQL_DATABASE:-pc1512}
      # "db" = Hostname des db-Services (Docker-internes DNS!)
      # Im Docker-Netzwerk sind Services per Name erreichbar
    
    depends_on:
      db:
        condition: service_healthy
      # Erst starten wenn db den Healthcheck besteht
    
    volumes:
      - ./backend:/app
      # DEV: lokales backend-Verzeichnis → /app im Container mounten
      # Änderungen am Code sind sofort wirksam (Hot-Reload)
      # PROD: kein Volume-Mount — Code ist im Image eingebettet
    
    command: uvicorn main:app --host 0.0.0.0 --port 8000 --reload
    # Überschreibt den CMD aus dem Dockerfile
    # --reload = Uvicorn überwacht Dateiänderungen (DEV-Modus)
    # PROD: kein --reload

  # ── FRONTEND ──────────────────────────────────────────
  frontend:
    image: node:20-alpine   # DEV: fertiges Node-Image
    # PROD: build: context: ./frontend (Dockerfile bauen)
    
    working_dir: /app
    
    volumes:
      - ./frontend:/app
      - frontend_modules:/app/node_modules   # node_modules in eigenem Volume
      # Warum separates Volume? node_modules würde sonst mit dem Host synchronisiert
      # — und der Host hat kein node_modules (oder eine andere Version)
    
    ports:
      - "5173:5173"   # Vite Dev-Server
    
    command: sh -c "npm install && npm run dev -- --host 0.0.0.0"
    # sh -c "..." = Shell-Kommando
    # npm install && npm run dev = erst installieren, dann starten

volumes:
  mysql_data:      # benanntes Volume für MySQL-Daten
  frontend_modules: # benanntes Volume für node_modules
```

---

### Prod vs. Dev: docker-compose.prod.yml

```yaml
# Wichtige Unterschiede:

services:
  backend:
    build: ./backend       # PROD: aus Dockerfile bauen
    # Kein Port nach außen! Nur nginx hat Zugriff
    # Kein volumes-Mount — Code ist eingebettet
    # Kein --reload

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile   # Multi-Stage Build ausführen
    ports:
      - "80:80"    # HTTP
      - "443:443"  # HTTPS
    volumes:
      - /opt/certbot/www:/var/www/certbot   # für Certbot-Challenge
      - /etc/letsencrypt:/etc/letsencrypt:ro  # SSL-Zertifikate (read-only!)
      # :ro = read-only Mount (sicherheitshalber)
```

---

## 14. nginx.conf — Syntax erklärt

```nginx
# Aus frontend/nginx.conf:

# ── HTTP-Block (Port 80) ──────────────────────────────────────
server {
    listen 80;                      # auf Port 80 horchen
    server_name 1512.retrokauz.de;  # für diese Domain gelten die Regeln

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
        # Certbot-Verifikations-Dateien von hier ausliefern
        # (für SSL-Zertifikat-Ausstellung und -Erneuerung)
    }

    location / {
        return 301 https://$host$request_uri;
        # Alles andere: Permanent-Redirect auf HTTPS
        # 301 = "Moved Permanently" (Browser merkt es sich)
        # $host = angefragte Domain (1512.retrokauz.de)
        # $request_uri = Pfad + Query (/emulator, /articles?..., etc.)
    }
}

# ── HTTPS-Block (Port 443) ───────────────────────────────────
server {
    listen 443 ssl;
    server_name 1512.retrokauz.de;

    ssl_certificate /etc/letsencrypt/live/1512.retrokauz.de/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/1512.retrokauz.de/privkey.pem;
    # Pfade zu den Let's Encrypt-Zertifikaten (im Container per Volume gemountet)

    root /usr/share/nginx/html;
    index index.html;
    # Statische Dateien aus diesem Verzeichnis ausliefern
    # (= der gebuildete React-dist-Ordner, der per COPY ins Image kam)

    # ── API-Anfragen weiterleiten ─────────────────────────────
    location /api/ {
        resolver 127.0.0.11 valid=30s;
        # Docker-interner DNS-Resolver
        # valid=30s = IP-Adressen 30 Sekunden cachen

        set $backend http://backend:8000;
        # Variable für den Backend-Hostnamen
        # "backend" = Name des Docker-Services (internes DNS)
        # Warum Variable? nginx löst Hostnamen beim Start auf.
        # Falls backend noch nicht läuft → nginx würde starten-Fehler werfen.
        # Mit Variable: erst beim ersten Request auflösen.

        proxy_pass $backend;
        # Anfrage an das Backend weiterleiten (Reverse Proxy)

        proxy_set_header Host $host;
        # Ursprünglichen Host-Header weiterleiten (Backend weiß, für welche Domain)
        
        proxy_set_header X-Real-IP $remote_addr;
        # Echte IP des Clients weiterleiten (sonst sieht Backend nur nginx's IP)
        
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        # Liste aller Proxies durch die der Request kam
    }

    # ── React-App ausliefern ─────────────────────────────────
    location / {
        try_files $uri $uri/ /index.html;
        # Versuche: 1. Datei mit diesem Pfad
        #           2. Verzeichnis mit diesem Pfad
        #           3. Gib /index.html zurück (React Router übernimmt)
        
        # Beispiel: /emulator wird aufgerufen
        # 1. /usr/share/nginx/html/emulator → Datei? Nein
        # 2. /usr/share/nginx/html/emulator/ → Verzeichnis? Nein
        # 3. /usr/share/nginx/html/index.html → React-App laden
        # React Router liest /emulator und rendert die Emulator-Seite
    }
}
```

---

### nginx location-Matching

```nginx
location /api/ { ... }   # passt auf alle Pfade die mit /api/ beginnen
location / { ... }       # passt auf alle Pfade (Fallback)
```

nginx prüft Locations in einer bestimmten Reihenfolge und nimmt die spezifischste Übereinstimmung:  
`/api/articles/` → passt auf `/api/`, nicht auf `/`.  
`/` → Fallback wenn keine andere Location passt.

---

### Häufige nginx-Direktiven

```nginx
listen 443 ssl;          # Port + Protokoll
server_name example.com; # Domain(s)
root /var/www/html;      # Basis-Verzeichnis für Dateien
index index.html;        # Standard-Datei
return 301 https://...;  # Redirect mit Status-Code
proxy_pass http://...;   # Weiterleiten an anderen Server
try_files $uri $uri/ /index.html;  # Fallback-Logik
include /etc/nginx/...;  # andere Datei einbinden
```

---

## Zusammenfassung: Wie alles zusammenwirkt

```
LOKALE ENTWICKLUNG:
docker-compose.yml
├── db (MySQL 8) ─────────────────────────────────────── :3306 (intern)
├── backend (Python/FastAPI/Uvicorn) ─────────────────── :8000 → localhost:8000
│   └── Volume: ./backend:/app (Hot-Reload)
└── frontend (Node/Vite) ─────────────────────────────── :5173 → localhost:5173
    └── Volume: ./frontend:/app (Hot-Reload)
    └── Proxy: /api → backend:8000

PRODUKTION (VPS):
docker-compose.prod.yml
├── db (MySQL 8) ─────────────────────────────────────── :3306 (intern + exposed)
├── backend (Python/FastAPI/Uvicorn) ─────────────────── :8000 (nur intern!)
└── frontend (nginx) ─────────────────────────────────── :80 + :443 → Welt
    ├── HTTPS: SSL via Let's Encrypt
    ├── /api/ → Reverse Proxy → backend:8000
    └── / → React-dist-Dateien (try_files → index.html)

DATENBANKSTRUKTUR:
users ──FK──< articles >──FK── categories

AUTH-FLOW:
Register → bcrypt hash → DB → Brevo E-Mail → Verify → Login → JWT → localStorage
JWT → Axios Interceptor → Authorization Header → Backend → Decode → User
```

---

*Codebuch-Stand: Juni 2026*  
*Projekt: 1512dd — Amstrad PC1512-DD Emulator-Plattform*  
*Autor: Dennis Rapp*
