# Projektplan – Amstrad PC1512-DD Emulator

---

## 🔴 Hoch – MS-DOS 3.2 / 5.0 + GEM einbinden

### Ziel
Statt FreeDOS soll der Emulator ein echtes MS-DOS 3.2 (oder 5.0) booten –
idealerweise mit vorinstalliertem GEM Desktop.

### Aktueller Stand
- Emulator bootet via `frontend/public/v86/freedos722.img` (Floppy-Image)
- v86-Config steht in `frontend/src/components/EmulatorScreen.jsx` → `EMULATOR_CONFIG`
- Alle Disk-Images in `frontend/public/v86/` ablegen

### Schritte

#### 1. Disk-Image beschaffen
- MS-DOS 3.2 + GEM: vorgefertigtes HDD-Image von archive.org herunterladen
  (Suchbegriff: "Amstrad PC1512 HDD image" oder "MS-DOS 3.2 GEM v86")
- Alternativ: Floppy-Images (Boot-Disk + GEM-Disk) einzeln herunterladen
- Format muss kompatibel sein: `.img` (raw disk image)

#### 2. Image ablegen
```
frontend/public/v86/msdos.img        ← HDD-Image (empfohlen)
```
oder bei Floppy-Lösung:
```
frontend/public/v86/msdos_boot.img   ← Boot-Floppy
frontend/public/v86/gem.img          ← GEM-Disk
```

#### 3. EmulatorScreen.jsx anpassen
Datei: `frontend/src/components/EmulatorScreen.jsx`

HDD-Variante (empfohlen):
```js
const EMULATOR_CONFIG = {
  wasm_path: '/v86/v86.wasm',
  bios: { url: '/v86/seabios.bin' },
  vga_bios: { url: '/v86/vgabios.bin' },
  hda: { url: '/v86/msdos.img', async: true },   // ← HDD statt fda
  autostart: true,
  memory_size: 32 * 1024 * 1024,
  vga_memory_size: 2 * 1024 * 1024,
};
```

Floppy-Variante:
```js
fda: { url: '/v86/msdos_boot.img' },
fdb: { url: '/v86/gem.img' },
```

#### 4. Text in Emulator.jsx aktualisieren
Datei: `frontend/src/pages/Emulator.jsx` – Zeile 9:
```
Intel 8086 · 8 MHz · 640 KB RAM · CGA · MS-DOS 3.2 + GEM
```
Und Bedienhinweis anpassen (FreeDOS → MS-DOS).

#### 5. Testen & deployen
```bash
# Lokal testen mit npm run dev (Backend muss nicht laufen)
# Dann:
git add frontend/public/v86/ frontend/src/components/EmulatorScreen.jsx frontend/src/pages/Emulator.jsx
git commit -m "Emulator: MS-DOS 3.2 + GEM Image eingebunden"
git push

# VPS:
git pull
docker compose restart frontend
```

> **Hinweis:** HDD-Images können groß sein (20–200 MB). Bei `async: true`
> lädt v86 den Image-Inhalt bei Bedarf nach — das ist für große Images wichtig.

---

## 🟡 Mittel – Port 3306 (MySQL) in VPS-Firewall schließen

### Ziel
MySQL ist aktuell von außen erreichbar (Port 3306 offen). Das ist ein Sicherheitsrisiko.

### Schritte

Auf dem VPS ausführen:
```bash
ufw allow ssh        # SSH vorher freigeben – sonst sperrt man sich aus!
ufw allow 80
ufw allow 443
ufw deny 3306
ufw enable
ufw status
```

Danach docker-compose.yml anpassen – den Port-Export für MySQL entfernen,
da er nur intern gebraucht wird:

Datei: `docker-compose.yml`
```yaml
# Diese Zeile entfernen oder auskommentieren:
# ports:
#   - "3306:3306"
```

```bash
git add docker-compose.yml
git commit -m "MySQL-Port nicht mehr nach außen exposen"
git push

# VPS:
git pull
docker compose up -d
```

---

## 🟢 Niedrig – Artikel-Editor für Admin im Frontend

### Ziel
Admins sollen Artikel direkt im Browser erstellen und bearbeiten können,
ohne `seed.py` auf dem VPS anfassen zu müssen.

### Schritte

#### 1. Admin-Route anlegen
Datei: `frontend/src/App.jsx`
```jsx
import AdminArticles from './pages/AdminArticles';
// Route hinzufügen (nur für eingeloggte Admins):
<Route path="/admin/articles" element={<AdminArticles />} />
```

#### 2. Seite AdminArticles.jsx erstellen
`frontend/src/pages/AdminArticles.jsx`
- Liste aller Artikel mit Bearbeiten/Löschen-Buttons
- Formular: Titel, Slug, Kategorie, Excerpt, Body (Markdown-Textarea)
- API-Calls: `articlesApi.create()`, `articlesApi.update()`, `articlesApi.remove()`
- Zugriff nur wenn `user.is_admin === true` (aus Auth-Context)

#### 3. Link im Navbar für Admins
Datei: `frontend/src/components/Navbar.jsx` (oder ähnlich)
- Nur anzeigen wenn User eingeloggt und Admin ist

---

## 🟢 Niedrig – Kategorie-Filter auf Artikelseite

### Status
**Bereits implementiert.** Die Kategorie-Filter-Buttons (Alle / Geschichte / Hardware / Software)
sind in `frontend/src/pages/Articles.jsx` vorhanden und funktionieren.

Kein weiterer Handlungsbedarf — es sei denn, ein anderes Verhalten ist gewünscht
(z.B. Filter per URL-Parameter, Dropdown statt Buttons).

---

## Reihenfolge für morgen

1. Port 3306 schließen (5 Minuten, reines VPS-Thema)
2. MS-DOS / GEM Image suchen und einbinden (Hauptaufgabe)
3. Artikel-Editor (nur wenn Zeit und Lust)
