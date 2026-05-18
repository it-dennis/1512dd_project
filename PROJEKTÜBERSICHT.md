# Projektübersicht — Amstrad PC1512-DD Emulator

**Stand: 17.05.2026 · Weiterbildungsprojekt · it-dennis**

---

## Projektidee

Browserbasierter Emulator des **Amstrad PC1512-DD** (1986) — der erste eigene Computer des
Entwicklers. Ziel ist eine vollständige Webplattform: Artikel-CMS über die Retro-Hardware,
Benutzerregistrierung, und ein im Browser laufender Emulator des originalen Systems.

---

## Infrastruktur-Übersicht

```ini
                         DNS
  ┌─────────────────────────────────────────────────────┐
  │  1512.retrokauz.de                                  │
  │  A-Record → 37.120.177.224                          │
  └─────────────────────┬───────────────────────────────┘
                        │
                        ▼ HTTPS (Port 443)
  ┌─────────────────────────────────────────────────────┐
  │  VPS · Ubuntu 24.04 LTS · root@retrokauz            │
  │  IP: 37.120.177.224 · /opt/1512dd                   │
  │                                                     │
  │  ┌─────────────────────────────────────────────┐    │
  │  │  Docker Compose Stack                       │    │
  │  │                                             │    │
  │  │  ┌──────────────────────┐                  │    │
  │  │  │  frontend-Container  │  nginx + React   │    │
  │  │  │  Port 443 (HTTPS)    │  Build-Output    │    │
  │  │  │  SSL: Let's Encrypt  │                  │    │
  │  │  │  (gültig bis Aug 26) │                  │    │
  │  │  └──────────┬───────────┘                  │    │
  │  │             │                              │    │
  │  │     /api/*  │  proxied to:                 │    │
  │  │             ▼                              │    │
  │  │  ┌──────────────────────┐                  │    │
  │  │  │  backend-Container   │  FastAPI          │    │
  │  │  │  Port 8000           │  Python 3.x       │    │
  │  │  │  REST API + JWT-Auth │  uvicorn          │    │
  │  │  └──────────┬───────────┘                  │    │
  │  │             │                              │    │
  │  │             ▼                              │    │
  │  │  ┌──────────────────────┐                  │    │
  │  │  │  db-Container        │  MySQL 8.0        │    │
  │  │  │  Port 3306 (intern)  │  persistentes     │    │
  │  │  │                      │  Docker Volume    │    │
  │  │  └──────────────────────┘                  │    │
  │  └─────────────────────────────────────────────┘    │
  └─────────────────────────────────────────────────────┘
```

---

## Routing (nginx → intern)

| URL-Pfad           | Ziel                          | Beschreibung                          |
|--------------------|-------------------------------|---------------------------------------|
| `/`                | React App                     | Startseite                            |
| `/articles`        | React App                     | Artikelliste                          |
| `/articles/:slug`  | React App                     | Einzelartikel (Markdown-gerendert)    |
| `/login`           | React App                     | Login-Formular                        |
| `/register`        | React App                     | Registrierung                         |
| `/emulator`        | React App (Auth required)     | Emulator-Seite (nur für eingeloggte)  |
| `/v86/*`           | nginx static files            | WASM + BIOS + Disk-Images             |
| `/api/*`           | FastAPI Backend :8000         | REST-Endpunkte                        |

---

## Frontend

| Eigenschaft   | Wert                                         |
|---------------|----------------------------------------------|
| Framework     | React 18 + Vite 5                            |
| Styling       | Tailwind CSS 3                               |
| HTTP-Client   | Axios                                        |
| Markdown      | react-markdown                               |
| Routing       | React Router DOM 6                           |
| Auth          | JWT via Context API (AuthContext)            |
| Emulator-Lib  | **v86** v0.5.357 (WebAssembly, im Browser)   |

### Seiten-Struktur

```ini
App
├── Navbar (Login-Status, Navigation)
├── / ............... Home
├── /articles ....... Artikelliste
├── /articles/:slug . Einzelartikel
├── /login .......... Login
├── /register ....... Registrierung
└── /emulator ....... Emulator [ProtectedRoute – Login erforderlich]
```

---

## Backend

| Eigenschaft    | Wert                                        |
|----------------|---------------------------------------------|
| Framework      | FastAPI (Python)                            |
| ASGI-Server    | uvicorn                                     |
| ORM            | SQLAlchemy                                  |
| Auth           | JWT (jose), bcrypt Passwort-Hashing         |
| Datenbank      | MySQL 8.0 via PyMySQL                       |

### API-Endpunkte

| Methode  | Pfad                    | Zugriff          | Funktion                     |
|----------|-------------------------|------------------|------------------------------|
| POST     | /api/auth/register      | öffentlich       | Registrierung                |
| POST     | /api/auth/login         | öffentlich       | Login → JWT-Token            |
| GET      | /api/articles/          | öffentlich       | Alle Artikel (paginiert)     |
| GET      | /api/articles/{slug}    | öffentlich       | Einzelartikel per Slug       |
| POST     | /api/articles/          | Admin            | Artikel erstellen            |
| PUT      | /api/articles/{id}      | Admin            | Artikel bearbeiten           |
| DELETE   | /api/articles/{id}      | Admin            | Artikel löschen              |

---

## Datenbank

### Tabellen

```sql
users
  id, email, username, password_hash, is_admin, created_at

categories
  id, name, slug

articles
  id, title, slug, body, excerpt, category_id, author_id, created_at, updated_at
```

---

## Emulator (v86 / WebAssembly)

```ini
Browser
  └── /emulator (React-Seite)
        └── EmulatorScreen-Komponente
              └── window.V86 (libv86.js, WASM)
                    ├── /v86/v86.wasm        ← CPU-Emulation (2 MB)
                    ├── /v86/seabios.bin     ← BIOS
                    ├── /v86/vgabios.bin     ← VGA-BIOS
                    └── /v86/freedos722.img  ← Boot-Image (FreeDOS, vorläufig)
```

- Emuliert: **Intel 8086 · 8 MHz · 640 KB RAM · CGA-Grafik**
- Bootet aktuell **FreeDOS** (Platzhalter)
- Geplant: MS-DOS 3.2 oder 5.0 Image von archive.org

---

## SSL / Sicherheit

| Eigenschaft         | Wert                                    |
|---------------------|-----------------------------------------|
| Zertifikat          | Let's Encrypt (certbot)                 |
| Gültig bis          | 13.08.2026 (Auto-Renewal aktiv)         |
| Protokoll           | HTTPS (TLS 1.2/1.3)                     |
| HTTP → HTTPS        | nginx-Redirect aktiv                    |

---

## Repository & Deployment

| Eigenschaft      | Wert                                                         |
|------------------|--------------------------------------------------------------|
| Git-Repo         | https://github.com/it-dennis/1512dd_project.git              |
| VPS-Pfad         | /opt/1512dd                                                  |
| Deployment       | `docker compose -f docker-compose.prod.yml up -d --build`   |
| Zielplattform    | https://1512.retrokauz.de                                    |

---

## Aktueller Funktionsumfang ✓

- [x] Domain + HTTPS eingerichtet (1512.retrokauz.de)
- [x] React-Frontend produktiv deployed
- [x] FastAPI-Backend erreichbar unter /api/
- [x] Benutzerregistrierung & Login (JWT)
- [x] Artikel-CMS (CRUD, Admin-geschützt)
- [x] Emulator startet und bootet FreeDOS im Browser
- [x] Emulator nur für eingeloggte Nutzer zugänglich

---

## Offene Punkte / Nächste Schritte

| Priorität | Aufgabe                                                              |
|-----------|----------------------------------------------------------------------|
| Hoch      | MS-DOS 3.2 / 5.0 Disk-Image einbinden (archive.org)                 |
| Mittel    | Port 3306 (MySQL) in VPS-Firewall nach außen schließen               |
| Niedrig   | Artikel-Editor für Admin im Frontend                                 |
| Niedrig   | Kategorie-Filter auf Artikelseite                                    |

---

*Erstellt: 17.05.2026 · Amstrad PC1512-DD Emulator · Weiterbildungsprojekt*
