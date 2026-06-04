# Schneider/Amstrad PC1512-DD — Browser-Emulator // PC1512-DD Wiki

Ein Weiterbildungsprojekt: 3-Schicht-Webanwendung mit eingebettetem x86-Emulator (v86).

**Live:** https://1512.retrokauz.de

## Systemvoraussetzungen

- Docker Desktop ≥ 4.x
- Node.js ≥ 20 (nur für lokale Frontend-Entwicklung ohne Docker)
- Python ≥ 3.11 (nur für lokales Backend ohne Docker)
- Git

## Schnellstart (Docker — empfohlen)

```bash
# 1. Repository klonen
git clone https://github.com/it-dennis/1512dd_project.git
cd 1512DD-emu

# 2. .env aus Vorlage erstellen und befüllen
cp .env.example .env

# 3. v86-Binärdateien herunterladen (einmalig)
./scripts/get-v86.sh        # Linux/Mac
.\scripts\get-v86.bat       # Windows

# 4. Alle Services starten
docker compose up --build
```

Die Anwendung ist danach erreichbar unter:

| Service   | URL                        |
|-----------|----------------------------|
| Frontend  | http://localhost:5173      |
| Backend   | http://localhost:8000      |
| API Docs  | http://localhost:8000/docs |

### Standard-Zugangsdaten (Seed-Daten)

| Rolle | E-Mail             | Passwort  |
|-------|--------------------|-----------|
| Admin | admin@pc1512.local | admin1512 |

## v86-Binärdateien

Der Emulator benötigt Dateien, die **separat** heruntergeladen werden müssen und nicht im Repository liegen.

### Automatisch (Script):

```bash
# Linux/Mac
chmod +x scripts/get-v86.sh
./scripts/get-v86.sh

# Windows (PowerShell)
.\scripts\get-v86.bat
```

### Manuell:

Folgende Dateien in `frontend/public/v86/` ablegen:

| Datei            | Quelle                                         |
|------------------|------------------------------------------------|
| `v86.wasm`       | v86 npm-Paket (`npm pack v86`) → `build/`      |
| `libv86.js`      | v86 npm-Paket → `build/libv86.js`              |
| `seabios.bin`    | v86 Release → `bios/seabios.bin`               |
| `vgabios.bin`    | v86 Release → `bios/vgabios.bin`               |
| `freedos722.img` | v86 Release → `images/freedos722.img`          |

> Im Produktions-Dockerfile werden diese Dateien automatisch heruntergeladen.
> Geplant: Ersatz von FreeDOS durch MS-DOS 3.3 + GEM Desktop + Originalspiele.

## Emulator-Bedienung

| Aktion | Beschreibung |
|--------|-------------|
| Klick auf Bildschirm | Tastatureingaben aktivieren |
| F11 | Vollbild ein/aus |
| Klick außerhalb | Maus wieder freigeben |

## Backend-Setup (ohne Docker)

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate    # Windows
source .venv/bin/activate # Linux/Mac
pip install -r requirements.txt
# .env anpassen: DATABASE_URL auf lokale MySQL zeigen
uvicorn main:app --reload
```

## Frontend-Setup (ohne Docker)

```bash
cd frontend
npm install
npm run dev
```

## Projektstruktur

```
1512DD-emu/
├── backend/                # FastAPI (Python)
│   ├── main.py             # App-Einstiegspunkt
│   ├── models.py           # SQLAlchemy-Modelle (User, Article, Category)
│   ├── schemas.py          # Pydantic-Schemas
│   ├── auth.py             # JWT + bcrypt
│   ├── seed.py             # Initiale Testdaten
│   ├── database.py         # DB-Engine und Session
│   └── routers/            # auth, articles, users
├── frontend/               # React + Vite + Tailwind CSS
│   ├── src/
│   │   ├── components/     # Navbar, ArticleCard, EmulatorScreen, ...
│   │   ├── pages/          # Home, Articles, Emulator, Login, Register,
│   │   │                   # VerifyEmail, TechnischeDaten, Praesentation, Admin
│   │   ├── context/        # AuthContext (JWT-State)
│   │   └── api/            # Axios-Client
│   └── public/
│       └── v86/            # v86-Binärdateien (separat, nicht im Repo)
├── db/                     # MySQL-Init-Skript
├── docker-compose.yml      # Lokale Entwicklung
├── docker-compose.prod.yml # Produktions-Deployment (VPS)
└── .env.example            # Umgebungsvariablen-Vorlage
```

## API-Endpunkte

| Methode | Pfad                      | Auth  | Beschreibung                        |
|---------|---------------------------|-------|-------------------------------------|
| POST    | /api/auth/register        | —     | Registrierung + Bestätigungsmail    |
| GET     | /api/auth/verify-email    | —     | E-Mail-Token bestätigen             |
| POST    | /api/auth/login           | —     | Login → JWT                         |
| GET     | /api/auth/me              | User  | Eigenes Profil                      |
| GET     | /api/articles/            | —     | Alle Artikel                        |
| GET     | /api/articles/{slug}      | —     | Einzelner Artikel                   |
| POST    | /api/articles/            | Admin | Artikel erstellen                   |
| PUT     | /api/articles/{id}        | Admin | Artikel bearbeiten                  |
| DELETE  | /api/articles/{id}        | Admin | Artikel löschen                     |
| GET     | /api/users/me             | User  | Eigenes Profil (users-Router)       |

Interaktive Doku: http://localhost:8000/docs

## Deployment (VPS)

Produktions-Deployment auf Contabo VPS (`/opt/1512dd`), Ubuntu 24.04 LTS.

```bash
# Auf dem VPS:
cd /opt/1512dd
git pull origin main
docker compose -f docker-compose.prod.yml up -d --build
```

| Komponente | Details                                      |
|------------|----------------------------------------------|
| VPS        | netcup, Ubuntu 24.04 LTS                     |
| Domain     | 1512.retrokauz.de                            |
| SSL        | Let's Encrypt via Certbot, Auto-Renewal      |
| Services   | db (MySQL 8), backend (FastAPI), frontend (nginx + React) |

## Umgebungsvariablen (.env)

```sh
DATABASE_URL=mysql+pymysql://user:password@db:3306/pc1512
SECRET_KEY=dein-jwt-secret
BREVO_API_KEY=dein-brevo-key
EMAIL_FROM=noreply@retrokauz.de
```

E-Mail-Versand erfolgt über die **Brevo REST API** (kein SMTP — Port 587 war beim Hoster geblockt).
