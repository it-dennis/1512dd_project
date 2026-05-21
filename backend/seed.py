from database import SessionLocal
import models
from auth import hash_password


CATEGORIES = [
    ("Hardware", "hardware"),
    ("Software", "software"),
    ("Geschichte", "geschichte"),
    ("Spiele", "spiele"),
]

ARTICLES = [
    {
        "title": "Der Amstrad PC1512-DD: Ein Meilenstein der PC-Geschichte",
        "slug": "amstrad-pc1512-dd-meilenstein",
        "category_slug": "geschichte",
        "excerpt": "Der Amstrad PC1512 revolutionierte 1986 den europäischen PC-Markt als erster wirklich erschwinglicher IBM-kompatibler Computer für Privathaushalte.",
        "body": """## Geschichte

Der Amstrad PC1512 wurde 1986 von Amstrad eingeführt und revolutionierte den europäischen PC-Markt. Mit einem Preis von unter 1000 Pfund war er der erste wirklich erschwingliche IBM-PC-kompatible Computer für Privathaushalte.

Amstrad-Gründer Alan Sugar wollte einen echten IBM-PC-Klon bauen, der für die breite Masse erschwinglich war. Die aggressive Preisgestaltung veränderte den europäischen Markt dauerhaft — bis dahin kosteten vergleichbare Geräte ein Vielfaches.

## Technische Daten

- **Prozessor:** Intel 8086 mit 8 MHz (Turbo) / 4 MHz (Normal)
- **RAM:** 512 KB, erweiterbar auf 640 KB
- **Grafik:** CGA-kompatibel, 320×200 (4 Farben) oder 640×200 (mono)
- **Laufwerke (DD-Version):** 2× 5,25" Diskettenlaufwerke à 360 KB
- **Betriebssystem:** MS-DOS 3.2 (Amstrad-Version)
- **Eingabe:** Maus inklusive — damals keine Selbstverständlichkeit

## Bedeutung für Europa

Während der IBM PC in Amerika schon verbreitet war, blieb er in Europa für viele unerschwinglich. Der PC1512 änderte das schlagartig. Er war der erste Computer, mit dem eine ganze Generation von Europäern das PC-Computing kennenlernte — darunter auch der Vater des Entwicklers dieser Seite.""",
    },
    {
        "title": "GEM Desktop: Die grafische Oberfläche des PC1512",
        "slug": "gem-desktop-grafische-oberflaeche",
        "category_slug": "software",
        "excerpt": "GEM Desktop war die grafische Benutzeroberfläche des PC1512 — Fenster, Icons und Maus, lange vor Windows.",
        "body": """## Was ist GEM?

GEM (Graphical Environment Manager) war eine grafische Benutzeroberfläche, entwickelt von Digital Research Inc. (DRI) im Jahr 1985. Amstrad lieferte den PC1512 standardmäßig mit GEM aus — das war einzigartig in dieser Preisklasse.

## GEM vs. Windows

Zeitgleich zu GEM entwickelte Microsoft Windows 1.0. GEM galt damals als die überlegene Implementierung: schneller, stabiler, und optisch an den Apple Macintosh angelehnt. Microsoft reagierte mit einer Klage gegen Digital Research, die DRI dazu zwang, GEM stark einzuschränken.

## GEM auf dem PC1512

GEM lief unter MS-DOS und bot:

- **Desktop** mit Dateiverwaltung per Maus
- **Fenster** mit Verschieben, Zoomen, Schließen
- **Icons** für Laufwerke, Ordner und Programme
- **Menüleiste** oben im Bildschirm (wie beim Mac)

Die mitgelieferte Amstrad-Maus war speziell für GEM entwickelt und kostete damals separat ein Vermögen — beim PC1512 war sie inklusive.

## Technisches

GEM nutzte die CGA-Grafikkarte mit 320×200 Pixel und 4 Farben. Im Monochrom-Modus waren 640×200 Pixel möglich. Die Performance auf dem 8086 war überraschend flüssig.""",
    },
    {
        "title": "MS-DOS 3.2 auf dem Amstrad PC1512",
        "slug": "ms-dos-32-amstrad-pc1512",
        "category_slug": "software",
        "excerpt": "MS-DOS 3.2 auf dem PC1512 — mit Amstrad-eigenen Erweiterungen für Maus, Taktfrequenz und mehr.",
        "body": """## MS-DOS auf dem PC1512

Amstrad lieferte den PC1512 mit einer angepassten Version von MS-DOS 3.2 aus. Diese Version enthielt eigene Treiber und Hilfsprogramme speziell für die Amstrad-Hardware.

## Amstrad-spezifische Befehle

- `MOUSE.COM` — aktiviert den Maustreiber im DOS-Modus
- `SPEED.COM` — wechselt zwischen 4 MHz (normal) und 8 MHz (Turbo)
- `CLOCK.COM` — setzt die Echtzeituhr

## Typische Nutzung

Der Alltag mit dem PC1512 sah oft so aus:

```
A:\\> mouse
Mouse driver installed.

A:\\> gem
```

GEM startete direkt nach dem Maustreiber. Wer kein GEM nutzte, arbeitete komplett im schwarzen DOS-Prompt — mit Befehlen wie `DIR`, `COPY`, `FORMAT`.

## Kompatibilität

Dank strikter IBM-Kompatibilität liefen fast alle MS-DOS-Programme problemlos auf dem PC1512. Flight Simulator, Frogger, Lotus 1-2-3, WordPerfect — alles lief.""",
    },
    {
        "title": "Frogger auf dem PC1512 — Klassiker der Spielgeschichte",
        "slug": "frogger-pc1512-klassiker",
        "category_slug": "spiele",
        "excerpt": "Frogger war eines der ersten Spiele, die viele PC1512-Besitzer installierten — ein Arcade-Klassiker in CGA-Farben.",
        "body": """## Frogger

Frogger erschien ursprünglich 1981 als Arcade-Automat von Konami. Die PC-Portierung brachte das Spiel auf IBM-kompatible Computer — und damit auch auf den Amstrad PC1512.

## Das Spielprinzip

Der Spieler steuert einen Frosch über eine belebte Straße und einen Fluss zum sicheren Ufer. Autos, Lastwagen, Krokodile und Schildkröten machen den Weg gefährlich.

## CGA auf dem PC1512

In CGA hatte das Spiel seine charakteristischen 4-Farben-Palette: Cyan, Magenta, Weiß und Schwarz — oder die alternative Palette mit Rot, Grün und Braun. Für die damalige Zeit war das farbenfroh und modern.

## Sound

Der PC Speaker lieferte die charakteristischen Töne: das Quaken des Frosches, die Fanfare beim Erreichen des Ziels, der traurige Ton beim Tod. Kein Stereo, kein AdLib — aber unverwechselbar.

## Heute im Emulator

Mit v86 im Browser läuft Frogger auf dem emulierten PC1512 genauso wie 1986 — mit originalem CGA-Look und PC-Speaker-Sound.""",
    },
]


def run_seed():
    db = SessionLocal()
    try:
        existing_admin = db.query(models.User).filter(models.User.email == "admin@pc1512.local").first()
        if existing_admin:
            if not existing_admin.is_verified:
                existing_admin.is_verified = True
                db.commit()
            return  # already seeded

        admin = models.User(
            email="admin@pc1512.local",
            username="admin",
            password_hash=hash_password("admin1512"),
            is_admin=True,
            is_verified=True,
        )
        db.add(admin)
        db.flush()

        cat_map = {}
        for name, slug in CATEGORIES:
            cat = models.Category(name=name, slug=slug)
            db.add(cat)
            db.flush()
            cat_map[slug] = cat.id

        for a in ARTICLES:
            article = models.Article(
                title=a["title"],
                slug=a["slug"],
                body=a["body"],
                excerpt=a["excerpt"],
                category_id=cat_map.get(a["category_slug"]),
                author_id=admin.id,
            )
            db.add(article)

        db.commit()
        print("Seed-Daten erfolgreich eingespielt.")
    except Exception as e:
        db.rollback()
        print(f"Seed fehlgeschlagen: {e}")
    finally:
        db.close()
