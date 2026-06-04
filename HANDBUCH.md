# Projekthandbuch: 1512dd — Amstrad PC1512-DD Emulator-Plattform

> Erstellt: Juni 2026  
> Autor: Dennis Rapp  
> Zweck: Vollständige Dokumentation des Projekts für eigenes Nachschlagen und zukünftige Referenz

---

## Inhaltsverzeichnis

1. [Was ist dieses Projekt?](#1-was-ist-dieses-projekt)
2. [Technologie-Stack — Kurzübersicht](#2-technologie-stack--kurzübersicht)
3. [Projektstruktur — Ordnerübersicht](#3-projektstruktur--ordnerübersicht)
4. [Frontend — alles erklärt](#4-frontend--alles-erklärt)
5. [Backend — alles erklärt](#5-backend--alles-erklärt)
6. [Datenbank (MySQL)](#6-datenbank-mysql)
7. [Der Emulator (v86 / WebAssembly)](#7-der-emulator-v86--webassembly)
8. [Docker — lokale Entwicklung](#8-docker--lokale-entwicklung)
9. [Docker — Produktion (VPS)](#9-docker--produktion-vps)
10. [VPS & Infrastruktur (nginx + Let's Encrypt)](#10-vps--infrastruktur-nginx--lets-encrypt)
11. [Authentifizierung & Sicherheit](#11-authentifizierung--sicherheit)
12. [E-Mail-Verifikation (Brevo)](#12-e-mail-verifikation-brevo)
13. [Umgebungsvariablen (.env)](#13-umgebungsvariablen-env)
14. [Lokaler Entwicklungsworkflow (Schritt für Schritt)](#14-lokaler-entwicklungsworkflow-schritt-für-schritt)
15. [Produktions-Deployment (Schritt für Schritt)](#15-produktions-deployment-schritt-für-schritt)
16. [Datenfluss — wie alles zusammenhängt](#16-datenfluss--wie-alles-zusammenhängt)
17. [Wichtige Konzepte erklärt](#17-wichtige-konzepte-erklärt)

---

## 1. Was ist dieses Projekt?

**1512dd** ist eine Webanwendung, die drei Dinge kombiniert:

1. **Browser-Emulator**: Der Schneider/Amstrad PC1512-DD läuft vollständig im Browser — MS-DOS, GEM Desktop, Spiele und alles. Kein Download, kein Plugin. Der Emulator ist nur für eingeloggte (verifizierte) Nutzer zugänglich.

2. **Infothek**: Eine Artikel-Datenbank mit historischen und technischen Texten über den PC1512 — Geschichte, Hardware, Software, Besonderheiten. Artikel sind öffentlich lesbar, aber nur Admins können sie schreiben.

3. **Plattform**: Nutzerverwaltung mit Registrierung, E-Mail-Verifikation, Login und Admin-Panel.

**Öffentlich erreichbar unter:** `https://1512.retrokauz.de`

**Verwendungszweck:** Weiterbildungsprojekt — praxisorientierter Aufbau einer vollständigen Full-Stack-Webanwendung inkl. Deployment auf einem eigenen VPS.

---

## 2. Technologie-Stack — Kurzübersicht

### FRONTEND: React + Vite + Tailwind CSS

| Technologie | Was es ist | Wofür es verwendet wird |
|---|---|---|
| **React 18** | JavaScript-UI-Bibliothek | Baut die gesamte Benutzeroberfläche aus wiederverwendbaren Komponenten auf. Jede Seite (Home, Emulator, Artikel...) ist eine React-Komponente. |
| **Vite** | Build-Tool & Dev-Server | Startet den Entwicklungsserver (`npm run dev`) extrem schnell. Bündelt den Code für Produktion (`npm run build`) zu statischen HTML/JS/CSS-Dateien. |
| **Tailwind CSS** | CSS-Framework (Utility-First) | Gibt fertige CSS-Klassen direkt im HTML/JSX. Statt eigene CSS-Regeln zu schreiben: `className="bg-black text-green-400 p-4"`. Maßgeschneiderte Farben (Phosphorgrün, CRT-Schwarz) sind in `tailwind.config.cjs` definiert. |
| **React Router** | Client-seitiges Routing | Ermöglicht Navigation zwischen Seiten (`/`, `/articles`, `/emulator` etc.) ohne Seitenneuladen. Der Browser bleibt immer auf derselben HTML-Seite — React tauscht nur den Inhalt aus. |
| **Axios** | HTTP-Client | Sendet API-Anfragen an den Backend-Server (Login, Artikel laden, etc.). Automatisch fügt es den JWT-Token aus dem `localStorage` an jeden Request an. |
| **react-markdown** | Markdown-Renderer | Wandelt den Artikel-Body (der als Markdown-Text in der Datenbank gespeichert ist) in sichtbares HTML um. |

**Design-Entscheidung:** Das CRT/Phosphor-Retroästhetik-Design (grüner Text auf schwarzem Hintergrund, Scanlines-Effekt) wurde bewusst gewählt, um zum Thema PC1512 von 1986 zu passen. Eigene Tailwind-Farben (`phosphor`, `crt-black`, `crt-dark`) und Google Fonts (`Share Tech Mono`, `Major Mono Display`) realisieren den Look.

---

### BACKEND: FastAPI + SQLAlchemy + MySQL

| Technologie | Was es ist | Wofür es verwendet wird |
|---|---|---|
| **FastAPI** | Python Web-Framework | Stellt eine REST-API bereit, die das Frontend aufruft. Generiert automatisch eine interaktive Dokumentation unter `/docs` (Swagger UI). |
| **Python 3.12** | Programmiersprache | Sprache des gesamten Backend-Codes. |
| **SQLAlchemy** | ORM (Object-Relational Mapper) | Ermöglicht, mit der MySQL-Datenbank in Python zu arbeiten, anstatt rohe SQL-Befehle zu schreiben. Tabellen werden als Python-Klassen definiert (`models.py`). |
| **MySQL 8** | Relationale Datenbank | Speichert dauerhaft alle Daten: Nutzer, Artikel, Kategorien. |
| **JWT / python-jose** | JSON Web Tokens | Authentifizierungs-Tokens. Nach dem Login erhält der Browser ein JWT — bei jedem weiteren Request wird es mitgeschickt, damit der Server weiß, wer der Nutzer ist, ohne ihn erneut in der DB zu suchen. |
| **bcrypt / passlib** | Passwort-Hashing | Passwörter werden nie im Klartext gespeichert. bcrypt wandelt `"meinPasswort123"` in einen nicht-rückrechenbaren Hash um, der in der DB liegt. |
| **Pydantic** | Datenvalidierung | Definiert, welche Felder eine API-Anfrage haben muss und welchen Typ sie haben. Kommt falsche oder fehlende Daten an, antwortet FastAPI automatisch mit einem Fehler. |
| **Uvicorn** | ASGI-Server | Führt die FastAPI-Anwendung tatsächlich aus. Analogie: FastAPI ist das "Programm", Uvicorn ist der "Motor", der es laufen lässt. |

---

### EMULATOR: v86 — x86 in WebAssembly

| Technologie | Was es ist | Wofür es verwendet wird |
|---|---|---|
| **v86 0.5.357** | x86-PC-Emulator | Emuliert einen vollständigen IBM-kompatiblen PC direkt im Browser — BIOS, VGA-Grafik, Disketten- und Festplattencontroller. |
| **WebAssembly (WASM)** | Binäres Laufzeitformat | Die performance-kritischen Teile des Emulators (CPU-Emulation) laufen als kompilierter WASM-Code — fast so schnell wie native Code. |
| **MS-DOS 3.3** | Betriebssystem | Das echte MS-DOS 3.3 in der Amstrad-Edition, eingebettet in ein Festplattenimage, läuft im Emulator. |

---

### INFRASTRUKTUR: Docker + nginx + VPS

| Technologie | Was es ist | Wofür es verwendet wird |
|---|---|---|
| **Docker Compose** | Container-Orchestrierung | Startet alle drei Dienste (Frontend, Backend, Datenbank) mit einem einzigen Befehl (`docker compose up`). Jeder Dienst läuft in einem eigenen isolierten Container. |
| **nginx** | Webserver / Reverse Proxy | Nimmt eingehende HTTP/HTTPS-Anfragen entgegen. Statische Frontend-Dateien werden direkt ausgeliefert; API-Anfragen (`/api/...`) werden an den Backend-Container weitergeleitet. |
| **Let's Encrypt / Certbot** | SSL-Zertifikate | Stellt kostenlose HTTPS-Zertifikate aus, die automatisch verlängert werden. Certbot läuft auf dem VPS und erneuert die Zertifikate regelmäßig. |
| **Ubuntu 24.04** | Betriebssystem des VPS | Das Betriebssystem des Root-Servers bei netcup, auf dem alles läuft. |

---

## 3. Projektstruktur — Ordnerübersicht

```
1512DD-emu/                        ← Projekt-Wurzel (git repository)
│
├── .env                           ← Geheime Konfiguration (NICHT in git!)
├── .env.example                   ← Vorlage für .env (ohne echte Werte, in git)
├── .gitignore                     ← Was git ignoriert
├── docker-compose.yml             ← Docker-Konfiguration für lokale Entwicklung
├── docker-compose.prod.yml        ← Docker-Konfiguration für Produktion (VPS)
│
├── frontend/                      ← React-Anwendung (Benutzeroberfläche)
│   ├── src/                       ← Quellcode
│   ├── public/                    ← Statische Dateien (Logos, Emulator-Binärdateien)
│   ├── Dockerfile                 ← Bauanleitung für den Frontend-Container
│   ├── nginx.conf                 ← nginx-Konfiguration (innerhalb des Containers)
│   ├── package.json               ← npm-Abhängigkeiten
│   ├── vite.config.js             ← Vite-Konfiguration
│   └── tailwind.config.cjs        ← Tailwind-Farben & Schriften
│
├── backend/                       ← FastAPI-Anwendung (API-Server)
│   ├── main.py                    ← Startpunkt der Anwendung
│   ├── models.py                  ← Datenbank-Tabellen als Python-Klassen
│   ├── schemas.py                 ← API-Datenformate (was rein/rauskommt)
│   ├── auth.py                    ← Login-Logik, JWT, Passwort-Hashing
│   ├── database.py                ← Datenbankverbindung
│   ├── email_utils.py             ← E-Mail-Versand (Brevo)
│   ├── migrations.py              ← Datenbank-Schema-Anpassungen
│   ├── seed.py                    ← Startdaten (Admin, Kategorien, Artikel)
│   ├── routers/                   ← API-Endpunkte nach Thema aufgeteilt
│   │   ├── auth.py                ← /api/auth/... (Login, Register, Verify)
│   │   ├── articles.py            ← /api/articles/...
│   │   └── users.py               ← /api/users/...
│   ├── requirements.txt           ← Python-Abhängigkeiten
│   └── Dockerfile                 ← Bauanleitung für den Backend-Container
│
├── db/
│   └── init.sql                   ← SQL-Initialisierungsdatei (fast leer, Tabellen via SQLAlchemy)
│
├── emulator/                      ← Emulator-Build-Umgebung (lokal, nicht deployed)
│   └── PC1512-BUILD/              ← DOS-Images, Konfigurationsdateien, Batch-Skripte
│
├── 1512wiki/                      ← Historische PDF-Dokumente über den PC1512
│
└── scripts/
    ├── get-v86.sh                 ← Shell-Skript zum Herunterladen der v86-Binärdateien
    └── get-v86.bat                ← Windows-Version desselben Skripts
```

---

## 4. Frontend — alles erklärt

### Der Einstiegspunkt: `index.html` und `main.jsx`

**`frontend/index.html`** ist die einzige HTML-Seite der gesamten Anwendung. Sie enthält nur ein leeres `<div id="root">` — React füllt dieses `div` mit dem gesamten Inhalt.

**`frontend/src/main.jsx`** ist der JavaScript-Startpunkt. Er:
1. Importiert React
2. Wraps die App in `<BrowserRouter>` (damit React Router funktioniert)
3. Rendert die `App`-Komponente in das `#root`-div

```jsx
ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
```

---

### `frontend/src/App.jsx` — das Routing-Gerüst

`App.jsx` ist die Haupt-Komponente. Sie definiert, welche Seite bei welcher URL angezeigt wird:

```
URL /            → Home.jsx
URL /articles    → Articles.jsx
URL /articles/:slug → ArticleDetail.jsx
URL /technik     → TechnischeDaten.jsx
URL /emulator    → Emulator.jsx   (nur wenn eingeloggt!)
URL /login       → Login.jsx
URL /register    → Register.jsx
URL /verify-email → VerifyEmail.jsx
URL /admin       → Admin.jsx      (nur wenn Admin!)
URL /praesentation → Praesentation.jsx
URL /impressum   → Impressum.jsx
URL /datenschutz → Datenschutz.jsx
```

Außerdem liegt in `App.jsx` der **globale Footer** mit den Links zu Impressum und Datenschutz. Der Admin-Link ist unsichtbar (opacity: 4%) — nur wer weiß, dass er da ist, klickt ihn.

Die gesamte App ist in `<AuthProvider>` gewrapped — das sorgt dafür, dass überall in der App auf den eingeloggten User zugegriffen werden kann.

---

### `frontend/src/context/AuthContext.jsx` — globaler Login-Zustand

**Das Problem:** Wenn man auf der Navbar den Benutzernamen anzeigen will, muss die Navbar wissen, ob jemand eingeloggt ist. Wenn man auf der Emulator-Seite den Emulator nur für eingeloggte Nutzer zeigen will, muss auch diese Seite das wissen. Und wenn man sich ausloggt, sollen beide sofort aktualisiert werden.

**Die Lösung: React Context.** `AuthContext.jsx` erstellt einen globalen "Store", der den eingeloggten User enthält. Jede Komponente kann diesen Zustand mit `useAuth()` abrufen, ohne ihn durch Props nach unten durchzureichen.

**Was `AuthProvider` macht beim Laden der Seite:**
1. Schaut in `localStorage` nach einem gespeicherten JWT-Token
2. Falls vorhanden: Fragt das Backend `/api/users/me`, um den User-Datensatz zu holen
3. Falls der Token ungültig ist: löscht ihn aus `localStorage`
4. Solange das läuft: zeigt "Booting..." (verhindert kurzes Aufblitzen von falschen Seiteninhalten)

**`login(token)`** — speichert den Token und holt User-Daten.  
**`logout()`** — löscht den Token, setzt User auf `null`.

---

### `frontend/src/api/client.js` — alle API-Funktionen

Diese Datei ist die zentrale Schnittstelle zwischen Frontend und Backend. Alle HTTP-Anfragen gehen hierüber.

**Axios-Instanz mit Interceptor:**
```js
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```
Das bedeutet: Jede Anfrage, die über `api` geht, bekommt automatisch den JWT-Token angehängt — man muss das nicht bei jedem Aufruf manuell tun.

**Exportierte API-Objekte:**
- `authApi.login()`, `.register()`, `.verifyEmail()`, `.me()` — Authentifizierung
- `articlesApi.list()`, `.get(slug)`, `.create()`, `.update()`, `.remove()` — Artikel
- `categoriesApi.list()` — Kategorien

---

### `frontend/src/components/` — wiederverwendbare Bausteine

| Datei | Was sie macht |
|---|---|
| `Navbar.jsx` | Die Navigationsleiste oben. Zeigt Login/Register wenn ausgeloggt, zeigt Username/Emulator/Logout wenn eingeloggt. Liest den Auth-Zustand mit `useAuth()`. |
| `ArticleCard.jsx` | Eine Karte für die Artikelübersicht — Titel, Kategorie, Excerpt, Datum. Wird in `Articles.jsx` für jeden Artikel verwendet. |
| `EmulatorScreen.jsx` | Der eigentliche Emulator-Container. Initialisiert v86, zeigt den DOS-Bildschirm, verwaltet Vollbild (F11), ResizeObserver für VGA-Moduswechsel. Details in Kapitel 7. |
| `ProtectedRoute.jsx` | Schutzhülle für Routen, die Login erfordern. Wenn kein User eingeloggt ist, leitet es zu `/login` weiter. Schützt `/emulator`. |
| `AdminRoute.jsx` | Wie `ProtectedRoute`, aber prüft zusätzlich `user.is_admin`. Schützt `/admin`. |

---

### `frontend/src/pages/` — die einzelnen Seiten

| Datei | Inhalt |
|---|---|
| `Home.jsx` | Startseite mit Banner-Bild, Hero-Text, 3 Feature-Karten. Rein statisch, keine API-Aufrufe. |
| `Articles.jsx` | Ruft `/api/articles/` ab und zeigt die Liste der Artikel-Karten. |
| `ArticleDetail.jsx` | Ruft `/api/articles/:slug` ab und zeigt den vollständigen Artikel. Der Body wird mit `react-markdown` gerendert. |
| `TechnischeDaten.jsx` | Statische Seite mit technischen Spezifikationen des PC1512. |
| `Emulator.jsx` | Wrapper um `EmulatorScreen`. Zeigt Bedienungshinweise und Software-Liste. |
| `Login.jsx` | Login-Formular. Bei Erfolg: Token im `localStorage` speichern, `AuthContext` aktualisieren, zu `/emulator` weiterleiten. |
| `Register.jsx` | Registrierungsformular. Nach Absenden erscheint Hinweis auf E-Mail-Bestätigung. |
| `VerifyEmail.jsx` | Wird aufgerufen wenn Nutzer auf den Link in der Bestätigungs-E-Mail klickt. Liest Token aus URL-Parameter, schickt ihn an `/api/auth/verify-email`. |
| `Admin.jsx` | Admin-Panel: Artikel-Liste mit Bearbeiten/Löschen-Buttons. Formular zum Anlegen und Bearbeiten von Artikeln (Markdown-Editor als Textarea). Automatische Slug-Generierung aus dem Titel. |
| `Praesentation.jsx` | Zeigt die Projektpräsentation (iframe auf `/presentation.html`). |
| `Impressum.jsx` | Impressum (rechtlich vorgeschrieben). |
| `Datenschutz.jsx` | Datenschutzerklärung (rechtlich vorgeschrieben). |

---

### `frontend/src/index.css` — globale Styles

Diese Datei wird einmal in `main.jsx` importiert und gilt global. Sie enthält:

1. **Tailwind-Direktiven** (`@tailwind base/components/utilities`) — lädt alle Tailwind-Klassen
2. **Basis-Styles** — `body` bekommt schwarz, Phosphorgrün und Monospace-Schrift
3. **Komponenten-Klassen** — `.btn-primary`, `.btn-secondary`, `.card`, `.input-field` sind eigene Klassen, die aus Tailwind-Klassen zusammengesetzt sind (DRY-Prinzip: einmal definiert, überall nutzbar)
4. **Markdown-Styles** — `.md-content h2`, `.md-content p` etc. — stylt gerenderte Markdown-Artikel, weil `react-markdown` eigene HTML-Tags produziert, die kein Tailwind haben

---

### `frontend/tailwind.config.cjs` — das Design-System

Hier werden die eigenen Farben des Projekts definiert, die dann als Tailwind-Klassen nutzbar sind:

```js
phosphor: {
  DEFAULT: '#39FF7A',   // Neongrün → text-phosphor, bg-phosphor
  soft: '#AAFFCC',      // Helles Grün → text-phosphor-soft
  muted: '#1EA758',     // Dunkles Grün → text-phosphor-muted
},
crt: {
  black: '#000000',     // bg-crt-black
  dark: '#031A10',      // bg-crt-dark
  ink: '#0A1F15',       // bg-crt-ink (für Karten)
}
```

Außerdem: Google Fonts `Share Tech Mono` (Fließtext) und `Major Mono Display` (Überschriften/Logo) werden als `font-mono` und `font-display` registriert.

---

### `frontend/vite.config.js` — Build & Dev-Server

Vite ist das Build-Tool. Diese Konfiguration macht zwei wichtige Dinge:

1. **Proxy**: Im Entwicklungsmodus leitet Vite alle Anfragen an `/api/...` an `http://localhost:8000` weiter — so kann das Frontend auf dem Dev-Server mit dem Backend kommunizieren, ohne CORS-Probleme.

2. **Host**: `host: true` macht den Dev-Server im Netzwerk erreichbar (nicht nur auf localhost).

Im **Produktions-Build** (`npm run build`) entfällt der Proxy — dann übernimmt nginx das Weiterleiten.

---

### `frontend/public/` — statische Dateien

Alles in `public/` wird ohne Verarbeitung direkt ausgeliefert.

**`public/logo/`** — alle Varianten des Projekt-Logos:
- `favicon.svg`, `favicon-16/32/48/64.png` — Browser-Tab-Icons
- `icon-192.png`, `icon-512.png` — PWA-Icons
- `apple-touch-icon-180.png` — iOS-Homescreen-Icon
- `banner.png` — Banner-Bild auf der Startseite
- `og-image.png` — Vorschau-Bild beim Teilen in Social Media

**`public/v86/`** — Emulator-Binärdateien (im git **ignoriert**, werden beim Docker-Build heruntergeladen):
- `libv86.js` — der Emulator-JavaScript-Code
- `v86.wasm` — kompilierter WebAssembly-Emulator-Kern
- `seabios.bin` — BIOS-Firmware (entspricht dem Original-PC-BIOS)
- `vgabios.bin` — VGA-BIOS-Firmware (Grafikausgabe)
- `freedos722.img` — bootfähiges FreeDOS-Disk-Image mit MS-DOS 3.3 und installierter Software

---

### `frontend/Dockerfile` — der Produktions-Build-Prozess

Der Frontend-Dockerfile hat zwei Stufen (Multi-Stage Build):

**Stufe 1 — Builder:**
1. Startet mit `node:20-alpine`
2. Installiert npm-Abhängigkeiten (`npm ci`)
3. Kopiert den Quellcode
4. Holt v86-Binärdateien aus dem npm-Paket und per `wget` (WASM, BIOS-Dateien, FreeDOS-Image)
5. Baut die React-App mit `npm run build` → erzeugt den `dist/`-Ordner

**Stufe 2 — nginx:**
1. Startet mit `nginx:alpine` (klein, nur Webserver)
2. Kopiert den fertigen `dist/`-Ordner aus Stufe 1 → nginx liefert ihn aus
3. Kopiert `nginx.conf`

Das Ergebnis ist ein schlanker Container, der nur nginx + statische Dateien enthält. Der gesamte Build-Prozess (Node, npm) ist nicht im finalen Image.

---

### `frontend/nginx.conf` — Webserver-Konfiguration

nginx hat zwei Server-Blöcke:

**Port 80 (HTTP):**
- Leitet `/.well-known/acme-challenge/` an Certbot weiter (für SSL-Zertifikat-Erneuerung)
- Leitet alle anderen Anfragen mit `301 Redirect` auf HTTPS weiter

**Port 443 (HTTPS):**
- Liest SSL-Zertifikate aus `/etc/letsencrypt/...` (vom VPS gemountet)
- Liefert statische Dateien aus `/usr/share/nginx/html/` (das ist der `dist/`-Ordner)
- Leitet `/api/...` per Reverse-Proxy an `http://backend:8000` weiter
- `try_files $uri $uri/ /index.html` — wichtig für React Router: Wenn eine URL wie `/emulator` direkt aufgerufen wird, gibt nginx nicht 404 zurück, sondern liefert `index.html` — React Router übernimmt dann das Routing

---

## 5. Backend — alles erklärt

### `backend/main.py` — der Startpunkt

Hier wird die FastAPI-Anwendung erstellt und konfiguriert.

**`lifespan`-Funktion:** Wird beim Start des Servers ausgeführt (einmal):
1. `Base.metadata.create_all(bind=engine)` — erstellt alle Tabellen in der DB, falls sie noch nicht existieren (idempotent — schadet nicht wenn sie schon da sind)
2. `run_migrations()` — fügt neue Spalten hinzu, die in älteren Schemas fehlen könnten
3. `run_seed()` — legt Admin-Nutzer, Kategorien und Start-Artikel an (falls noch nicht vorhanden)

**CORS-Middleware:** Erlaubt dem Browser, API-Anfragen von anderen Domains zu stellen. Ohne CORS würde der Browser alle Anfragen vom Frontend (`localhost:5173`) an das Backend (`localhost:8000`) blockieren. Im Produktionssystem: erlaubt sind `https://1512.retrokauz.de` und localhost für Entwicklung.

**Router:** Die API-Endpunkte sind in drei separate Dateien aufgeteilt und werden hier eingebunden:
- `auth_router` → alle `/api/auth/...` Endpunkte
- `articles_router` → alle `/api/articles/...` Endpunkte
- `users_router` → alle `/api/users/...` Endpunkte

**`/api/health`** — ein einfacher Endpunkt zum Prüfen, ob das Backend läuft.

---

### `backend/models.py` — die Datenbankstruktur

SQLAlchemy-Modelle beschreiben, wie die Datenbanktabellen aussehen. Jede Klasse = eine Tabelle.

**`User`-Tabelle:**
```
id              INTEGER, Primärschlüssel
email           VARCHAR(255), eindeutig
username        VARCHAR(100), eindeutig
password_hash   VARCHAR(255) — gehashtes Passwort
is_admin        BOOLEAN — ob Admin-Rechte
is_verified     BOOLEAN — ob E-Mail bestätigt
verification_token      VARCHAR(255) — temporärer Token für E-Mail-Bestätigung
verification_token_expires  DATETIME — Ablaufzeit des Tokens
created_at      DATETIME
```

**`Category`-Tabelle:**
```
id      INTEGER, Primärschlüssel
name    VARCHAR(100) — z.B. "Hardware"
slug    VARCHAR(100), eindeutig — z.B. "hardware" (URL-freundlich)
```

**`Article`-Tabelle:**
```
id          INTEGER, Primärschlüssel
title       VARCHAR(255)
slug        VARCHAR(255), eindeutig — URL-freundlicher Titel
body        TEXT — Markdown-Inhalt
excerpt     VARCHAR(500) — Kurztext für Übersichtsliste
category_id INTEGER, Fremdschlüssel → categories.id
author_id   INTEGER, Fremdschlüssel → users.id
created_at  DATETIME
updated_at  DATETIME — wird bei jedem Update automatisch gesetzt
```

**Relationships:** SQLAlchemy-Beziehungen (`relationship(...)`) erlauben es, auf verbundene Datensätze direkt zuzugreifen: `article.author` gibt den User-Datensatz, `article.category` gibt die Kategorie — ohne manuellen JOIN.

---

### `backend/schemas.py` — API-Datenformate (Pydantic)

Schemas definieren, **was die API erwartet** (Input) und **was sie zurückgibt** (Output). Sie sind von den Datenbankmodellen getrennt — das ist wichtig, weil man z.B. nie das `password_hash` zurückgeben will.

| Schema | Verwendung |
|---|---|
| `UserRegister` | Eingehend bei POST /api/auth/register: email, username, password |
| `UserLogin` | Eingehend bei POST /api/auth/login: email, password |
| `Token` | Ausgehend nach Login: access_token, token_type |
| `UserOut` | Ausgehend bei /api/users/me: id, email, username, is_admin (kein Passwort!) |
| `ArticleCreate` | Eingehend bei POST /api/articles/: title, slug, body, excerpt, category_id |
| `ArticleUpdate` | Eingehend bei PUT /api/articles/id: alle Felder optional |
| `ArticleOut` | Ausgehend: vollständiger Artikel inkl. author-Objekt und category-Objekt |
| `ArticleListOut` | Ausgehend in Listen: wie ArticleOut, aber kein author (Listenansicht braucht das nicht) |

`model_config = {"from_attributes": True}` ermöglicht es Pydantic, SQLAlchemy-Objekte direkt zu serialisieren.

---

### `backend/auth.py` — Login-Logik und Zugriffsschutz

**Passwort-Hashing:**
- `hash_password(password)` → gibt einen bcrypt-Hash zurück
- `verify_password(plain, hashed)` → prüft, ob ein Klartext-Passwort zu einem gespeicherten Hash passt
- bcrypt ist sicher weil: langsam (erschwerst Brute-Force), enthält automatisch einen Salt (verhindert Rainbow-Table-Angriffe), nicht umkehrbar

**JWT-Tokens:**
- `create_access_token(data)` → erstellt einen signierten Token mit Ablaufzeit (Standard: 1440 Minuten = 24 Stunden)
- Der Token enthält `{"sub": "user_id", "exp": ablaufzeit}` — verschlüsselt mit dem `SECRET_KEY`

**Dependency-Funktionen (für Endpunkte):**
- `get_current_user(token, db)` → liest Token, dekodiert ihn, gibt User zurück (oder None)
- `require_user(current_user)` → wie get_current_user, wirft aber 401 wenn nicht eingeloggt
- `require_admin(current_user)` → wie require_user, wirft aber 403 wenn kein Admin

In FastAPI werden diese als `Depends(require_admin)` in Endpunkt-Definitionen eingebunden — eine elegante Art, Zugriffsschutz zu definieren.

---

### `backend/database.py` — Datenbankverbindung

Stellt die Verbindung zur MySQL-Datenbank her:
- Liest die `DATABASE_URL` aus der `.env`-Datei
- Erstellt die SQLAlchemy `engine` (die Verbindung selbst)
- `SessionLocal` = Factory für Datenbank-Sessions
- `get_db()` = Dependency für FastAPI: öffnet eine Session, gibt sie an den Endpunkt weiter, schließt sie danach immer (auch bei Fehlern, durch `finally`)

---

### `backend/routers/auth.py` — Authentifizierungs-Endpunkte

**POST `/api/auth/register`:**
1. Prüft ob E-Mail oder Username bereits vergeben (wenn ja: 400-Fehler)
2. Generiert einen Verifikations-Token (zufällige URL-sichere Zeichenkette)
3. Hashed das Passwort
4. Speichert den User mit `is_verified=False`
5. Sendet die Bestätigungs-E-Mail im Hintergrund (`BackgroundTasks`)
6. Gibt Erfolgsmeldung zurück

**POST `/api/auth/login`:**
1. Sucht User nach E-Mail
2. Prüft Passwort mit bcrypt
3. Prüft ob E-Mail verifiziert (wenn nicht: 403-Fehler)
4. Erstellt JWT-Token und gibt ihn zurück

**GET `/api/auth/verify-email?token=...`:**
1. Sucht User nach Token
2. Prüft ob Token abgelaufen ist (72 Stunden)
3. Setzt `is_verified=True`, löscht den Token
4. Gibt Erfolgsmeldung zurück

**GET `/api/auth/me`:**
Gibt den eingeloggten User zurück (für `AuthContext` beim Seitenladen).

---

### `backend/routers/articles.py` — Artikel-Endpunkte

| Endpunkt | Methode | Zugriff | Was er macht |
|---|---|---|---|
| `/api/articles/` | GET | öffentlich | Gibt alle Artikel zurück (neueste zuerst), mit Paginierung |
| `/api/articles/:slug` | GET | öffentlich | Gibt einen Artikel nach slug zurück |
| `/api/articles/` | POST | nur Admin | Legt neuen Artikel an. Prüft ob slug eindeutig. |
| `/api/articles/:id` | PUT | nur Admin | Aktualisiert einen Artikel (nur geänderte Felder) |
| `/api/articles/:id` | DELETE | nur Admin | Löscht einen Artikel |

**Slug:** Ein Slug ist ein URL-freundlicher Bezeichner, z.B. `"gem-vergessene-benutzeroberflaeche"` statt `"GEM – die vergessene Benutzeroberfläche vor Windows"`. Wird aus dem Titel generiert (im Frontend: `Admin.jsx` → `toSlug()`), einmal gesetzt und nicht mehr geändert (deshalb beim Bearbeiten gesperrt).

---

### `backend/seed.py` — Startdaten

Wird bei jedem App-Start ausgeführt. Legt an (falls noch nicht vorhanden):
1. **Admin-User** `admin@retrokauz.de` / `admin1512` (ist_verified=True, is_admin=True)
2. **Kategorien:** Hardware, Software, Geschichte, Spiele
3. **10 Artikel** mit historischen/technischen Texten über den PC1512

Artikel werden "upsertet" — wenn sie schon existieren, werden sie aktualisiert (Titel, Body, Excerpt). So kann man Artikel-Inhalte durch Code-Änderungen in `seed.py` + Neustart aktualisieren.

---

### `backend/migrations.py` — Schema-Änderungen

Da `Base.metadata.create_all()` **keine Spalten zu bestehenden Tabellen hinzufügt**, gibt es `migrations.py` für nachträgliche Änderungen. Es versucht, neue Spalten hinzuzufügen — und ignoriert den Fehler wenn sie schon existieren.

Konkret: `is_verified`, `verification_token`, `verification_token_expires` wurden nachträglich zur `users`-Tabelle hinzugefügt, als die E-Mail-Verifikation implementiert wurde.

---

### `backend/email_utils.py` — E-Mail-Versand

Versendet die Bestätigungs-E-Mail über die **Brevo-API** (früher Sendinblue).

- Im **Entwicklungsmodus** (kein `BREVO_API_KEY` in `.env`): Druckt den Bestätigungslink nur in die Backend-Logs. Man kann die Registrierung so auch lokal testen.
- Im **Produktionsmodus**: Sendet echte HTML-E-Mail im Retro-Design (schwarz/grün, Monospace-Font, passend zum Projekt-Design).

Der E-Mail-Inhalt enthält den Bestätigungslink: `https://1512.retrokauz.de/verify-email?token=<token>`.

---

### `backend/requirements.txt` — Python-Abhängigkeiten

```
fastapi         — das Web-Framework
uvicorn         — der ASGI-Server (führt FastAPI aus)
sqlalchemy      — ORM für Datenbankzugriff
pymysql         — MySQL-Treiber für Python (SQLAlchemy nutzt es)
cryptography    — kryptografische Funktionen (für pymysql SSL)
python-jose     — JWT-Token erstellen und lesen
passlib[bcrypt] — Passwort-Hashing
bcrypt          — bcrypt-Algorithmus
python-multipart — für Formular-Daten
pydantic[email] — Datenvalidierung + E-Mail-Validierung
python-dotenv   — liest .env-Datei
requests        — HTTP-Requests (für Brevo-API)
```

---

## 6. Datenbank (MySQL)

### Wie Tabellen entstehen

Die Datenbank-Tabellen werden **nicht durch SQL-Skripte angelegt**, sondern durch SQLAlchemy beim App-Start:
```python
Base.metadata.create_all(bind=engine)
```
Das übersetzt die Python-Klassen in `models.py` in `CREATE TABLE`-SQL-Befehle.

**`db/init.sql`** enthält nur einen Kommentar — er ist als Platzhalter vorhanden, falls MySQL beim ersten Start ein Init-Skript erwartet. Die eigentliche Initialisierung übernimmt SQLAlchemy.

### Das ER-Diagramm (Beziehungen)

```
users ──< articles    (ein User hat viele Artikel, als Autor)
categories ──< articles (eine Kategorie hat viele Artikel)
```

### Daten im Produktionssystem

Die MySQL-Daten werden in einem **Docker Volume** (`mysql_data`) gespeichert. Das Volume überlebt Container-Neustarts und -Updates. Beim `docker compose down` bleiben die Daten erhalten — erst `docker compose down -v` würde das Volume (und damit alle Daten) löschen.

---

## 7. Der Emulator (v86 / WebAssembly)

### Was ist v86?

v86 ist ein Open-Source-Projekt (von Fabian Hemmer, "copy"), das einen kompletten x86-PC im Browser emuliert. Es ist in C kompiliert und läuft als **WebAssembly** — das ist ein binäres Format, das der Browser ähnlich schnell wie nativen Code ausführen kann.

Der Emulator emuliert:
- Intel 8086/8088 CPU
- VGA-Grafikkarte (CGA-Kompatibel)
- BIOS (SeaBIOS — eine Open-Source-BIOS-Implementierung)
- Disketten- und Festplattencontroller
- Tastatur und Maus

### Wie der Emulator startet (`EmulatorScreen.jsx`)

1. Wenn der Nutzer auf "PC1512 starten" klickt: `startEmulator()` wird aufgerufen
2. Eine neue `V86`-Instanz wird erstellt mit der Konfiguration:
   - BIOS: `seabios.bin`
   - VGA-BIOS: `vgabios.bin`
   - Disketten-Image: `freedos722.img` (FreeDOS mit MS-DOS 3.3 und Software)
   - 32 MB RAM, 2 MB VGA-Speicher
   - `autostart: true` — startet sofort
3. v86 rendert den PC-Bildschirm in ein `<canvas>`-Element innerhalb von `screenRef`
4. Das `emulator-ready`-Event signalisiert, dass DOS gebootet hat

### Das Festplattenimage

`freedos722.img` ist ein bootfähiges Image, das mit **DOSBox-X** und den originalen Amstrad-Disketten erstellt wurde. Der Prozess ist im `emulator/PC1512-BUILD/`-Ordner dokumentiert (Batch-Dateien und Konfigurationsdateien).

Das Image enthält:
- MS-DOS 3.3 (Amstrad-Edition)
- GEM Desktop 2.0 (grafische Oberfläche)
- Norton Commander 2.0
- Frogger, Microsoft Flight Simulator 3, GW-BASIC

### Vollbild-Modus

Der Vollbild-Code in `EmulatorScreen.jsx` ist aufwendiger als man denken würde:

1. **F11** wird abgefangen (bevor v86 es empfängt), um `requestFullscreen()` aufzurufen
2. Bei Vollbild-Eintritt: Der Emulator-Screen hat keine feste Breite mehr, sondern `width: max-content` — so misst er seine natürliche Größe
3. Ein `ResizeObserver` beobachtet den Screen: Wenn v86 den VGA-Modus ändert (z.B. von Textmodus zu Grafikmodus), ändert sich die Canvas-Größe → `applyTransform()` wird aufgerufen
4. `applyTransform()` berechnet den CSS-`scale()`-Faktor so, dass der Emulator-Screen den gesamten Bildschirm ausfüllt (unter Beibehaltung des Seitenverhältnisses)
5. Ein `requestAnimationFrame`-Debounce verhindert, dass `applyTransform()` bei schnellen VGA-Wechseln zu oft aufgerufen wird

---

## 8. Docker — lokale Entwicklung

### `docker-compose.yml` — Drei Container, ein Befehl

```yaml
services:
  db:       MySQL 8 Datenbankserver
  backend:  FastAPI mit Uvicorn (Hot-Reload: Code-Änderungen sofort wirksam)
  frontend: Node.js mit Vite Dev-Server (Hot-Reload ebenfalls)
```

**Starten:**
```bash
docker compose up
```
→ Alle drei Services starten. Backend wartet auf DB (healthcheck), Frontend wartet auf Backend.

**Hot-Reload im Entwicklungsmodus:**  
Der Backend-Container mounted `./backend:/app` als Volume — Änderungen am Python-Code werden sofort vom Uvicorn `--reload` erkannt.  
Der Frontend-Container mounted `./frontend:/app` — Vite erkennt JSX-Änderungen und lädt den Browser automatisch neu.

**Ports:**
- `localhost:5173` → Frontend (Vite Dev-Server)
- `localhost:8000` → Backend-API

**Warum ist Port 3306 (MySQL) auskommentiert?**  
Der DB-Port ist bewusst nicht nach außen exponiert. Die DB ist nur intern (im Docker-Netzwerk) erreichbar. Das Backend erreicht sie via `db:3306` (Docker-interner DNS).

---

## 9. Docker — Produktion (VPS)

### `docker-compose.prod.yml` — Unterschiede zur Entwicklung

| Aspekt | Entwicklung | Produktion |
|---|---|---|
| Frontend | Node + Vite Dev-Server | Vorgefertigter nginx-Container (statische Dateien) |
| Backend | Uvicorn mit `--reload` | Uvicorn ohne Reload (stabil) |
| Backend-Port | 8000 nach außen exponiert | Kein externer Port! Nur nginx kann es erreichen |
| Frontend-Ports | 5173 | 80 und 443 (HTTP + HTTPS) |
| SSL | Nicht vorhanden | Let's Encrypt Zertifikate über Volume |
| DB-Port | Auskommentiert | 3306 exponiert (für direkten Datenbankzugriff per Tool) |
| Variablen | Defaults als Fallback | Pflicht: müssen in .env gesetzt sein |

**Wichtiger Sicherheitsaspekt:** Im Produktionssystem ist `backend:8000` **nicht** von außen erreichbar. Nur nginx (im `frontend`-Container) kann über das interne Docker-Netzwerk mit dem Backend kommunizieren. So ist das Backend gegen direkten Zugriff aus dem Internet geschützt.

### Deployment-Ablauf auf dem VPS

1. Repository auf VPS clonen: `git clone https://github.com/...`
2. `.env`-Datei anlegen (mit echten Produktionswerten)
3. SSL-Zertifikat ausstellen (Certbot, einmalig)
4. `docker compose -f docker-compose.prod.yml up -d --build`

Der `--build`-Flag baut die Container neu (wichtig nach Code-Änderungen).  
Der `-d`-Flag startet im Hintergrund (Daemon-Mode).

**Updates deployen:**
```bash
git pull
docker compose -f docker-compose.prod.yml up -d --build
```

---

## 10. VPS & Infrastruktur (nginx + Let's Encrypt)

### Anfragen-Fluss in Produktion

```
Browser-Nutzer
    ↓ HTTPS auf 1512.retrokauz.de
VPS (Ubuntu 24.04 / netcup)
    ↓ Port 443
nginx (im frontend-Container)
    ↓ wenn /api/ → Reverse Proxy
    backend-Container:8000 (FastAPI)
        ↓
    db-Container:3306 (MySQL)
    ↓ sonst (statische Dateien)
    /usr/share/nginx/html (React-Build)
```

### Let's Encrypt / Certbot

Certbot läuft direkt auf dem VPS (nicht in einem Container). Es:
1. Bestätigt Domain-Eigentumsnachweis über `/.well-known/acme-challenge/` (nginx leitet das weiter)
2. Stellt ein SSL-Zertifikat aus (`fullchain.pem` + `privkey.pem`)
3. Speichert es in `/etc/letsencrypt/live/1512.retrokauz.de/`
4. Erneuert es automatisch per Cronjob (Zertifikate laufen nach 90 Tagen ab)

Der `frontend`-Container mounted `/etc/letsencrypt` als read-only Volume — nginx liest die Zertifikate von dort.

### Firewall

Auf dem VPS sind nur Ports 80 (HTTP) und 443 (HTTPS) öffentlich erreichbar. Port 22 (SSH) nur für Administration.

---

## 11. Authentifizierung & Sicherheit

### Der vollständige Login-Ablauf

```
1. Nutzer gibt E-Mail + Passwort ein (Login.jsx)
2. POST /api/auth/login → Backend
3. Backend sucht User in DB
4. bcrypt.verify(passwort, hash) → Passwort korrekt?
5. is_verified? → E-Mail bestätigt?
6. JWT-Token erstellt (enthält user_id, Ablaufzeit)
7. Token zurück an Browser
8. Browser speichert Token in localStorage
9. Axios-Interceptor hängt Token an alle zukünftigen Requests
10. Backend liest Token, dekodiert ihn, findet User → autorisiert
```

### Warum localStorage (und nicht Cookies)?

Für dieses Projekt wurde localStorage gewählt — es ist einfacher zu implementieren. Der Nachteil gegenüber HTTP-Only-Cookies ist, dass JavaScript auf den Token zugreifen kann (XSS-Risiko). Für ein Produktionssystem mit höheren Sicherheitsanforderungen wären HTTP-Only-Cookies besser.

### Passwort-Sicherheit

Passwörter werden mit bcrypt gehasht. bcrypt:
- Ist bewusst **langsam** (Work-Factor), was Brute-Force-Angriffe erschwert
- Enthält automatisch einen zufälligen **Salt**, der in den Hash eingebettet wird
- Verschiedene Nutzer mit gleichem Passwort haben **verschiedene Hashes**
- Aus dem Hash kann man das Passwort **nicht zurückrechnen**

### Admin-Schutz

Admin-Endpunkte (`POST/PUT/DELETE /api/articles/`) haben `Depends(require_admin)`. Wenn der Token fehlt, ungültig ist oder der User kein Admin ist → 403 Forbidden. Dieses Muster macht es unmöglich, versehentlich einen Endpunkt ungeschützt zu lassen.

---

## 12. E-Mail-Verifikation (Brevo)

### Warum E-Mail-Verifikation?

Der Emulator ist nur für verifizierte Nutzer zugänglich. Die Verifikation dient als einfache Spam-Schutzmaßnahme — man braucht eine echte E-Mail-Adresse.

### Der Ablauf

```
1. Nutzer registriert sich → POST /api/auth/register
2. Backend generiert zufälligen Token (32 Bytes, URL-safe Base64)
3. Token wird mit 72-Stunden-Ablaufzeit in users-Tabelle gespeichert
4. E-Mail wird im Hintergrund versendet (damit die API-Antwort nicht wartet)
5. Nutzer klickt Link in E-Mail → /verify-email?token=abc123...
6. VerifyEmail.jsx sendet GET /api/auth/verify-email?token=abc123...
7. Backend setzt is_verified=True, löscht Token
8. Nutzer kann sich jetzt einloggen
```

### Brevo-Integration

Brevo (früher Sendinblue) ist ein E-Mail-Dienstleister mit kostenlosem Tier. Das Backend sendet einen HTTP-POST an die Brevo-API — keine SMTP-Konfiguration nötig. Der API-Key kommt aus der `.env`-Datei.

---

## 13. Umgebungsvariablen (.env)

Die `.env`-Datei enthält alle Geheimnisse und umgebungsspezifischen Konfigurationen. Sie wird **nie in git eingecheckt** (steht in `.gitignore`). `.env.example` ist die dokumentierte Vorlage.

| Variable | Wo genutzt | Bedeutung |
|---|---|---|
| `SECRET_KEY` | Backend/auth.py | Schlüssel zum Signieren von JWT-Tokens. Muss in Produktion zufällig und lang sein. |
| `ALGORITHM` | Backend/auth.py | JWT-Algorithmus (HS256 = HMAC-SHA256) |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Backend/auth.py | Token-Lebensdauer (1440 = 24 Stunden) |
| `MYSQL_ROOT_PASSWORD` | Docker/MySQL-Container | MySQL Root-Passwort |
| `MYSQL_DATABASE` | Docker/MySQL-Container | Datenbankname (z.B. `pc1512`) |
| `DATABASE_URL` | Backend/database.py | Vollständige DB-Connection-URL |
| `BREVO_API_KEY` | Backend/email_utils.py | API-Key für E-Mail-Versand. Leer lassen für Dev (Link nur im Log) |
| `SMTP_FROM` | Backend/email_utils.py | Absender-E-Mail-Adresse |
| `APP_BASE_URL` | Backend/email_utils.py | Basis-URL für Bestätigungslinks in E-Mails |

**Lokale Entwicklung:** Datei mit Defaults aus `.env.example` anlegen.  
**Produktion:** Echte Secrets, sicheres `SECRET_KEY`, echte `BREVO_API_KEY`.

---

## 14. Lokaler Entwicklungsworkflow (Schritt für Schritt)

### Erstmalige Einrichtung

```bash
# 1. Repository klonen
git clone <repository-url>
cd 1512DD-emu

# 2. .env-Datei anlegen
cp .env.example .env
# .env ggf. anpassen (Defaults funktionieren für lokale Entwicklung)

# 3. Alles starten
docker compose up
```

Nach dem ersten Start (kann 2-3 Minuten dauern):
- MySQL startet und wird initialisiert
- Backend startet, führt migrations + seed aus (Kategorien, Artikel, Admin-User werden angelegt)
- Frontend startet den Vite Dev-Server

**Zugriff:**
- Frontend: `http://localhost:5173`
- Backend-API-Docs: `http://localhost:8000/docs`
- Admin-Login: `admin@retrokauz.de` / `admin1512`

### Täglicher Workflow

```bash
# Container starten (im Hintergrund)
docker compose up -d

# Logs anschauen
docker compose logs -f backend
docker compose logs -f frontend

# Alles stoppen
docker compose down

# Alles stoppen + Daten löschen (fresh start)
docker compose down -v
```

### Frontend-Änderungen

JSX/CSS-Dateien in `frontend/src/` bearbeiten → Vite lädt den Browser automatisch neu. Kein Neustart nötig.

### Backend-Änderungen

Python-Dateien in `backend/` bearbeiten → Uvicorn `--reload` startet den Server neu. Kein Container-Neustart nötig.

### Neue Python-Abhängigkeit hinzufügen

```bash
# In requirements.txt eintragen, dann Container neu bauen:
docker compose up -d --build backend
```

### Neue npm-Abhängigkeit hinzufügen

```bash
# Im laufenden Frontend-Container:
docker compose exec frontend npm install <paketname>
# oder Container neu starten — npm install läuft beim Start automatisch
```

---

## 15. Produktions-Deployment (Schritt für Schritt)

### Einmalig: VPS einrichten

```bash
# 1. Auf VPS einloggen (SSH)
ssh root@<vps-ip>

# 2. Docker installieren (Ubuntu)
apt update && apt install -y docker.io docker-compose-plugin

# 3. Repository klonen
cd /opt
git clone <repository-url> 1512dd
cd 1512dd

# 4. .env für Produktion anlegen
nano .env
# Echte Secrets eintragen!

# 5. SSL-Zertifikat (einmalig)
apt install -y certbot
# nginx muss kurz auf Port 80 laufen — oder direkt per standalone:
certbot certonly --standalone -d 1512.retrokauz.de
# → Zertifikate landen in /etc/letsencrypt/live/1512.retrokauz.de/

# 6. Produktion starten
docker compose -f docker-compose.prod.yml up -d --build
```

### Updates deployen

```bash
# Auf VPS:
cd /opt/1512dd
git pull
docker compose -f docker-compose.prod.yml up -d --build
```

### SSL-Zertifikat erneuern (automatisch via Cronjob)

```bash
# Certbot installiert automatisch einen Cronjob. Manuell testen:
certbot renew --dry-run
```

### Status prüfen

```bash
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs backend
```

---

## 16. Datenfluss — wie alles zusammenhängt

### Beispiel: Artikel-Liste laden

```
1. Browser öffnet /articles
2. React Router rendert Articles.jsx
3. useEffect() → articlesApi.list() → axios GET /api/articles/
4. Axios-Interceptor: hängt JWT-Token an (falls vorhanden)
5. Request geht an nginx (Port 443)
6. nginx: URL beginnt mit /api/ → Reverse Proxy zu backend:8000
7. FastAPI router: GET /api/articles/ → list_articles()
8. SQLAlchemy: SELECT * FROM articles ORDER BY created_at DESC LIMIT 20
9. MySQL gibt Datensätze zurück
10. SQLAlchemy-Objekte → Pydantic ArticleListOut → JSON
11. Antwort zurück durch nginx → Browser
12. React: setArticles(response.data) → re-render → Karten anzeigen
```

### Beispiel: Emulator aufrufen (nicht eingeloggt)

```
1. Browser navigiert zu /emulator
2. React Router: /emulator ist mit <ProtectedRoute> gewrapped
3. ProtectedRoute: user aus AuthContext lesen → null (nicht eingeloggt)
4. → Redirect zu /login
5. Nutzer loggt ein → token in localStorage, user im Context
6. Navigate('/emulator') → jetzt ProtectedRoute: user !== null
7. Emulator.jsx wird gerendert
8. Nutzer klickt "PC1512 starten" → startEmulator()
9. Browser lädt libv86.js + v86.wasm aus /v86/ (statische Dateien von nginx)
10. Browser lädt seabios.bin + vgabios.bin + freedos722.img
11. V86-Instanz wird erstellt → x86-Emulation beginnt
12. DOS bootet, GEM startet → im Canvas sichtbar
```

---

## 17. Wichtige Konzepte erklärt

### Was ist ein Slug?

Ein **Slug** ist ein URL-freundlicher Bezeichner für einen Datensatz. Aus dem Artikel-Titel `"GEM – die vergessene Benutzeroberfläche vor Windows"` wird der Slug `"gem-vergessene-benutzeroberflaeche"`. Eigenschaften:
- Nur Kleinbuchstaben, Zahlen, Bindestriche
- Keine Sonderzeichen, keine Umlaute
- Bleibt konstant (auch wenn der Titel sich ändert)
- Ermöglicht schöne URLs: `/articles/gem-vergessene-benutzeroberflaeche`

### Was ist eine REST-API?

**REST** (Representational State Transfer) ist eine Konvention für HTTP-APIs. Jede Ressource (Artikel, User) hat eine URL, und HTTP-Methoden beschreiben die Aktion:
- `GET /api/articles/` → alle Artikel lesen
- `POST /api/articles/` → neuen Artikel anlegen
- `PUT /api/articles/5` → Artikel 5 ändern
- `DELETE /api/articles/5` → Artikel 5 löschen

### Was ist CORS?

**Cross-Origin Resource Sharing** — eine Browser-Sicherheitsregel. Der Browser erlaubt standardmäßig keine API-Anfragen von `localhost:5173` an `localhost:8000` (verschiedene Origins). Das Backend muss explizit erlauben, von welchen Domains Anfragen kommen dürfen — das geschieht über die `CORSMiddleware` in `main.py`.

### Was ist ein Docker Volume?

Ein **Volume** ist ein persistenter Speicherbereich außerhalb des Containers. Container sind flüchtig — wenn man sie löscht, sind alle Daten weg. Volumes überleben das. Die MySQL-Daten liegen im Volume `mysql_data` auf dem Host-System (VPS), nicht im Container selbst. Deshalb bleiben sie bei Updates (`docker compose up --build`) erhalten.

### Was ist ein Reverse Proxy?

Ein **Reverse Proxy** ist ein Vermittler. nginx empfängt alle eingehenden Anfragen und leitet sie je nach URL weiter:
- `/api/...` → Backend (FastAPI)
- Alles andere → statische Dateien (React-Build)

Vorteile: Nur ein Port (443) nach außen, nginx übernimmt SSL, Backend ist nicht direkt erreichbar.

### Was ist Hot-Reload?

Im Entwicklungsmodus erkennen Vite (Frontend) und Uvicorn (Backend) automatisch Dateiänderungen und aktualisieren sich, ohne dass man sie manuell neu starten muss. Das spart enorm Zeit beim Entwickeln.

### Was ist ein JWT (JSON Web Token)?

Ein **JWT** ist ein signierter Datencontainer. Er sieht aus wie drei Base64-Strings getrennt durch Punkte: `header.payload.signature`. Der Payload enthält z.B. `{"sub": "42", "exp": 1234567890}` — User-ID und Ablaufzeit. Die Signature garantiert, dass der Token nicht manipuliert wurde (ohne den `SECRET_KEY` kann man keine gültige Signature erstellen). Das Backend kann den Token verifizieren, **ohne** in die Datenbank schauen zu müssen.

### Was ist ein ORM (SQLAlchemy)?

Ein **ORM** (Object-Relational Mapper) ist eine Abstraktionsschicht über der Datenbank. Statt zu schreiben:
```sql
SELECT * FROM articles WHERE slug = 'mein-artikel'
```
schreibt man:
```python
db.query(models.Article).filter(models.Article.slug == slug).first()
```
SQLAlchemy übersetzt das in SQL, führt es aus und gibt Python-Objekte zurück. Vorteile: kein SQL-Injection-Risiko durch Parametrisierung, Datenbankwechsel wäre einfacher (z.B. von MySQL zu PostgreSQL).

### Was ist WebAssembly (WASM)?

**WebAssembly** ist ein binäres Format, das der Browser nativ ausführen kann — fast so schnell wie Maschinencode. Es ergänzt JavaScript für performance-kritische Aufgaben. v86 nutzt WASM für die CPU-Emulation: Die Emulation eines 8086-Prozessors bei Browsergeschwindigkeit wäre in JavaScript zu langsam — als WASM läuft es flüssig.

---

*Ende des Handbuchs*

*Dieses Handbuch deckt den Stand des Projekts zum Zeitpunkt der Fertigstellung (Juni 2026) ab. Bei zukünftigen Projekten sind die beschriebenen Konzepte (React/FastAPI/Docker-Grundstruktur) übertragbar — die konkreten Konfigurationen variieren je nach Projekt.*
