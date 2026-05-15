# Schneider/Amstrad PC1512-DD — Browser-Emulator // PC1512-DD Wiki //

Ein Weiterbildungsprojekt: 3-Schicht-Webanwendung mit eingebettetem x86-Emulator (v86).

## Systemvoraussetzungen

- Docker Desktop ≥ 4.x
- Node.js ≥ 20 (nur für lokale Frontend-Entwicklung ohne Docker)
- Python ≥ 3.11 (nur für lokales Backend ohne Docker)
- Git

## Schnellstart (Docker — empfohlen)

```bash
# 1. Repository klonen und ins Verzeichnis wechseln
git clone <repo-url>
cd 1512DD-emu

# 2. .env aus Vorlage erstellen
cp .env.example .env

# 3. v86-Binärdateien herunterladen (einmalig)
./scripts/get-v86.sh        # Linux/Mac
# oder unter Windows:
./scripts/get-v86.bat

# 4. Alle Services starten
docker compose up --build
```

Die Anwendung ist danach erreichbar unter:

| Service   | URL                         |
|-----------|-----------------------------|
| Frontend  | http://localhost:5173       |
| Backend   | http://localhost:8000       |
| API Docs  | http://localhost:8000/docs  |
| MySQL     | localhost:3306              |

### Standard-Zugangsdaten (Seed-Daten)

| Rolle | E-Mail                  | Passwort   |
|-------|-------------------------|------------|
| Admin | admin@pc1512.local      | admin1512  |

# v86-Binärdateien

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

| Datei            | Quelle                                                     |
|------------------|------------------------------------------------------------|
| `libv86.js`      | https://github.com/copy/v86/releases → `libv86.js`        |
| `seabios.bin`    | v86 Release → `bios/seabios.bin`                          |
| `vgabios.bin`    | v86 Release → `bios/vgabios.bin`                          |
| `freedos722.img` | v86 Release → `images/freedos722.img`                     |

## Backend-Setup (ohne Docker)

```bash
cd backend

# Virtuelle Umgebung erstellen und aktivieren
python -m venv .venv
.venv\Scripts\activate    # Windows
source .venv/bin/activate # Linux/Mac

# Abhängigkeiten installieren
pip install -r requirements.txt

# .env mit lokaler MySQL-Adresse anpassen
# DATABASE_URL=mysql+pymysql://root:pw@localhost:3306/pc1512

# Server starten (MySQL muss laufen)
uvicorn main:app --reload
```

## Frontend-Setup (ohne Docker)

```bash
cd frontend
npm install
npm run dev
```

## Netzwerk & Ports

| Service      | Port  | Beschreibung                    |
|--------------|-------|---------------------------------|
| Frontend     | 5173  | React Vite Dev Server           |
| Backend API  | 8000  | FastAPI + uvicorn               |
| MySQL        | 3306  | Datenbank                       |

## Projektstruktur

```ini
1512DD-emu/
├── backend/                # FastAPI (Python) — Logic Layer
│   ├── main.py             # App-Einstiegspunkt, Startup
│   ├── models.py           # SQLAlchemy-Modelle (User, Article, Category)
│   ├── schemas.py          # Pydantic-Schemas (Request/Response)
│   ├── auth.py             # JWT-Authentifizierung
│   ├── seed.py             # Initiale Testdaten
│   ├── database.py         # DB-Engine und Session
│   └── routers/            # API-Routen (auth, articles, users)
├── frontend/               # React + Vite — Presentation Layer
│   ├── src/
│   │   ├── components/     # Navbar, ArticleCard, EmulatorScreen, ...
│   │   ├── pages/          # Home, Articles, Emulator, Login, Register
│   │   ├── context/        # AuthContext (JWT-State)
│   │   └── api/            # Axios-Client
│   └── public/v86/         # v86 Binärdateien (separat herunterladen)
├── db/                     # MySQL-Init
├── docker-compose.yml      # Alle Services
└── .env.example            # Umgebungsvariablen-Vorlage
```

## API-Endpunkte

| Methode | Pfad                     | Auth   | Beschreibung             |
|---------|--------------------------|--------|--------------------------|
| POST    | /api/auth/register       | —      | Registrierung            |
| POST    | /api/auth/login          | —      | Login → JWT              |
| GET     | /api/auth/me             | User   | Eigenes Profil           |
| GET     | /api/articles/           | —      | Alle Artikel             |
| GET     | /api/articles/{slug}     | —      | Einzelner Artikel        |
| POST    | /api/articles/           | Admin  | Artikel erstellen        |
| PUT     | /api/articles/{id}       | Admin  | Artikel bearbeiten       |
| DELETE  | /api/articles/{id}       | Admin  | Artikel löschen          |
| GET     | /api/users/me            | User   | Eigenes Profil           |

Interaktive Doku: http://localhost:8000/docs

## Netcup MySQL (Production)

Für das Deployment mit netcup MySQL die `.env` anpassen:

```sh
DATABASE_URL=mysql+pymysql://dbuser:dbpassword@mysql.netcup-host.de:3306/dbname
```

Hinweis: Shared-Webhosting erlaubt MySQL-Zugriff oft nur vom eigenen Server.
Bei einem netcup VPS/Root-Server läuft das Backend direkt dort.

## Branching-Strategie

- `main` — stabiler, lauffähiger Code (kein Direktcommit)
- `feature/...` — neue Features (z.B. `feature/admin-panel`)
- `fix/...` — Bugfixes
- Änderungen kommen per Pull Request in `main`
