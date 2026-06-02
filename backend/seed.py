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
        "title": "Der Tag, an dem der PC erschwinglich wurde",
        "slug": "der-tag-an-dem-der-pc-erschwinglich-wurde",
        "category_slug": "geschichte",
        "excerpt": "London, 2. September 1986: Alan Sugar nennt seinen Preis – und ein Raunen geht durch den Saal. £399 für einen IBM-kompatiblen PC.",
        "body": """## London, 2. September 1986

Queen Elizabeth Conference Centre, Westminster. Rund 1.200 Journalisten, Händler und Branchenvertreter waren gekommen – darunter Gäste aus Deutschland, Frankreich und Spanien mit Kopfhörern für Simultanübersetzung. Alan Sugar, Gründer von Amstrad, hatte monatelang geschwiegen. Kein Vorabbericht, keine Andeutung. Nur ein Termin.

Nach einer Präsentation, die zeigte, dass ein durchschnittlicher IBM-kompatibler PC damals rund £2.000 kostete, nannte Sugar seinen Preis: **£399 für das Basismodell.**

Im Saal war für einen Moment Stille – dann ein Raunen der Verblüffung. Die Q&A-Session danach dauerte laut Sugar über eine Stunde; die Journalisten konnten nicht aufhören zu fragen.

## Der deutsche Markt

Das Modell mit zwei Diskettenlaufwerken und Farbmonitor, das den Vätern dieser Seite auf dem Schreibtisch stand, kostete in Deutschland **2.999 DM** – deutlich günstiger als jede vergleichbare Maschine.

In Deutschland wurden laut Schneider-Aktiv innerhalb weniger Monate **40.000 Geräte** verkauft. Lieferengpässe folgten.""",
    },
    {
        "title": 'Projekt „AIRO" – Die geheime Entstehungsgeschichte',
        "slug": "projekt-airo-entstehungsgeschichte",
        "category_slug": "geschichte",
        "excerpt": "Intern hieß das Projekt anders als offiziell. Die Geschichte hinter der Entwicklung des PC1512 – VLSI-Chips, ein abgelehnter BIOS-Auftrag und eine Abkürzung, über die Amstrad-Veteranen bis heute streiten.",
        "body": """## Ein Name, zwei Versionen

Der offizielle Name war PC-1512. Intern hieß das Projekt anders.

Ob es „AERO" stand – weil das Gerät zu dem Preis aus den Regalen fliegen würde – oder „AIRO" für *Amstrad's IBM Rip-Off*: Selbst unter den damaligen Amstrad-Mitarbeitern wird diese Frage bis heute diskutiert.

## Die Entwicklung

Fest steht: Die Entwicklung begann in der zweiten Hälfte 1985. Amstrads Ingenieure öffneten einen originalen IBM PC und stellten fest, dass er aus teuren Einzelkomponenten auf einem großen Motherboard bestand. Das war die Erkenntnis, die alles änderte: Mit eigenen VLSI-Chips ließ sich dieselbe Leistung für einen Bruchteil des Preises realisieren.

## Wer das BIOS schrieb

Amstrad beauftragte **MEJ Electronics** mit der Nachentwicklung des IBM-BIOS – das Unternehmen, das zuvor bereits die Hardware für die CPC- und PCW-Reihe realisiert hatte.

**Locomotive Software**, die Schöpfer des CPC-BASICs, lehnten den Auftrag ab – aus Angst vor IBM-Klagen.

## Kein Klon

Das Ergebnis war kein Klon, sondern eine eigenständige Konstruktion: eigene VLSI-Chips, eigenes BIOS, sogar ein eigenes Tastaturprotokoll – absichtlich inkompatibel zum IBM-Standard.""",
    },
    {
        "title": "Schneller als das Original – warum der 8086 einen Unterschied macht",
        "slug": "schneller-als-das-original-8086",
        "category_slug": "hardware",
        "excerpt": "IBM verbaute aus Kostengründen den 8088. Der PC-1512 bekam den echten 16-Bit-Prozessor 8086 – und lief damit spürbar schneller als sein teures Vorbild.",
        "body": """## Der Kompromiss im IBM PC

IBM hatte beim ersten PC-Modell 1981 den **Intel 8088** verbaut – aus Kostengründen. Der 8088 arbeitet zwar mit 16-Bit-Registern intern, hat aber nur einen 8-Bit-Datenbus: Er sendet Daten byteweise und ist dadurch langsamer als er könnte.

## Was der PC-1512 anders machte

Der Schneider PC-1512 bekam den **Intel 8086** – den „echten" 16-Bit-Prozessor mit vollem 16-Bit-Datenbus. Dazu lief er mit **8 MHz** statt der 4,77 MHz des IBM-Originals.

Das Schneider-Aktiv-Magazin von Oktober 1986 schrieb es deutlich:

> „Der Amstrad/Schneider PC-1512 übertrifft die Auflösung und Farbdarstellung des IBM."

Und: Der 1512 lief spürbar schneller als sein teures Vorbild.

## Erweiterungsmöglichkeiten

- Der Prozessor konnte gegen einen **NEC V30** ausgetauscht werden, der zusätzlich den 80186-Befehlssatz beherrschte.
- Ein **Intel 8087 FPU**-Coprozessor für Fließkommaberechnungen ließ sich nachrüsten – ein Sockel dafür war bereits auf dem Mainboard vorgesehen.""",
    },
    {
        "title": "GEM – die vergessene Benutzeroberfläche vor Windows",
        "slug": "gem-vergessene-benutzeroberflaeche",
        "category_slug": "software",
        "excerpt": '1986 kannte kaum jemand in deutschen Wohnzimmern das Wort „grafische Benutzeroberfläche". Der PC-1512 brachte GEM mit – und für viele war es der erste Computer ohne Kommandozeile.',
        "body": """## Ein Desktop im Wohnzimmer

1986 kannte kaum jemand in deutschen Wohnzimmern das Wort „grafische Benutzeroberfläche". Windows existierte, war aber bedeutungslos. Der Macintosh kostete ein Vermögen.

Der Schneider PC-1512 brachte **GEM** mit – den *Graphical Environment Manager* von Digital Research. Wer das Gerät einschaltete und DOS Plus startete, sah: ein Desktop mit Symbolen, Fenstern, Diskettenstationen – und konnte alles mit der beiliegenden Maus steuern.

Für viele britische und deutsche Käufer war dies der erste Computer, der keine Kommandozeile verlangte.

## Der Apple-Prozess und seine Folgen

Was die meisten nicht wussten: GEM war bereits kurz vor dem Erscheinen juristisch beschnitten worden. Apple hatte Digital Research wegen Ähnlichkeiten mit dem Mac-Interface verklagt. Das Ergebnis war **GEM Desktop 2.0** (März 1986): Überlappende Fenster wurden entfernt, der Desktop zeigte nur noch zwei fixe Fenster, die Animationen beim Öffnen und Schließen fielen weg.

Der 1512 bekam also bereits die „entschärfte" Version – dennoch war sie für 1986 eine Sensation.

## Mitgelieferte Software

- **GEM Desktop 2.0** – Dateimanager, Uhr, Taschenrechner, Screenshot-Funktion
- **GEM Paint 1.0** – Malprogramm
- **Locomotive BASIC 2** v1.12 – als GEM-integrierte IDE
- **MS-DOS 3.2** und **DOS Plus 1.2** auf separaten Disketten""",
    },
    {
        "title": "Digital Research – die andere Seite der DOS-Geschichte",
        "slug": "digital-research-dos-geschichte",
        "category_slug": "software",
        "excerpt": "Gary Kildall erfand CP/M. IBM kam zu ihm – und die Verhandlungen scheiterten. Microsoft bekam den Auftrag. Und dann kam Amstrad.",
        "body": """## Eine Geschichte, die anders hätte enden können

**Digital Research** – gegründet von Gary Kildall – hatte mit CP/M in den 1970ern das dominierende Betriebssystem für Heimcomputer geschaffen. Als IBM 1980 ein OS für den neuen PC suchte, kam man zu Kildall. Die Geschichte nahm eine Wendung: Die Verhandlungen scheiterten, IBM wandte sich an Microsoft – und der Rest ist bekannt.

## Die zweite Chance

Als Sugar Microsoft wegen einer DOS-Lizenz kontaktierte, war ihm der Preis zu hoch. Digital Research erfuhr davon und brachte sofort seine volle Unterstützung in das Amstrad-Projekt ein – in der Hoffnung, mit dem 1512 endlich Microsoft Boden abzugewinnen.

**DOS Plus** war MS-DOS-kompatibel, konnte aber zusätzlich CP/M-Disketten lesen – ein echter Vorteil für alle, die vom Schneider CPC oder Joyce umgestiegen waren. In der Praxis hatte es aber Schwächen: Deutsche Befehlsübersetzungen enthielten Fehler, manche Systembefehle funktionierten nicht zuverlässig.

## Das Ende der Hoffnung

Das Happy End blieb für Digital Research aus: Sugar entschied sich kurz vor dem Launch, auch **MS-DOS 3.2** beizulegen. Damit wurden beide Systeme zur Wahl gestellt – und MS-DOS gewann den Alltag.""",
    },
    {
        "title": "Die Stille als Verkaufsargument",
        "slug": "die-stille-als-verkaufsargument",
        "category_slug": "hardware",
        "excerpt": "Wer 1986 einen PC einschaltete, hörte ihn. Der PC-1512 war anders: kein Lüfter, kein Brummen. Das Netzteil steckte im Monitor – und das hatte Konsequenzen.",
        "body": """## PCs, die man hörte

Wer 1986 einen PC einschaltete, hörte ihn. Lüfter, surrende Festplatten, brummende Netzteile – PC-Lärm war normal.

Der Schneider PC-1512 war anders. Das **Netzteil befand sich im Monitor**, der durch Konvektion kühlte. Der Rechner selbst erzeugte so wenig Wärme, dass kein Lüfter nötig war – das Gehäuse blieb leise.

Schneider-Aktiv 10/86 nannte es ausdrücklich unter „Besonderheiten":

> „Weder Rechner noch Monitor haben einen Lüfter (braucht der PC-1512 nicht)."

## Der technische Hintergrund

Das proprietäre VLSI-Design produzierte weniger Abwärme als IBMs Einzelkomponenten-Ansatz. Das hatte eine praktische Konsequenz: Das Netzteil im Monitor bedeutete auch, dass man den originalen Amstrad/Schneider-Monitor **nicht einfach gegen ein Fremdgerät tauschen konnte** – denn dann fehlte dem Rechner die Stromversorgung.

## Der Nachfolger

Beim **PC 1640** (ECD-Modell, 1987) kehrte der Lüfter übrigens zurück – diesmal in den Monitor integriert. EGA-Grafik erzeugt mehr Wärme.""",
    },
    {
        "title": "Was in der Schachtel steckte – das vollständige Paket",
        "slug": "lieferumfang-das-vollstaendige-paket",
        "category_slug": "hardware",
        "excerpt": "Anders als IBM-Rechner war der PC-1512 ein Komplettsystem: Monitor, Maus, Software, Handbuch – alles dabei. Ein Überblick über den vollständigen Lieferumfang.",
        "body": """## Ein System, nicht ein Bausatz

Anders als IBM-Rechner, bei denen Monitor, Maus und Software separat gekauft werden mussten, war der Schneider PC-1512 ein Komplettsystem. Der Schneider-Aktiv-Bericht von 1986 listet den Inhalt detailliert auf.

## Hardware

- Rechner (372 × 384 × 135 mm, 6,05–7,75 kg je nach Ausstattung)
- Tastatur mit 85 Tasten im IBM-Look, zwei frei programmierbare Sondertasten, beleuchtet
- Maus (MS-kompatibel, Anschluss an der Tastatur über Mini-D-Stecker)
- Monitor (13" Mono oder 14" Farbe – mit eingebautem Netzteil)
- 3 IBM-kompatible ISA-Erweiterungsslots
- Parallel-, Seriell- (RS-232), Game- und Lightpen-Anschluss
- Batteriegepufferte Echtzeituhr
- 50 KB RAM-Utility für Systemkonfiguration (Farbe, Tastaturbelegung, Maus, Laufwerke, RAM-Disk)
- Sockel für Intel 8087 FPU

## Software

- MS-DOS 3.2 (mit deutschem Handbuch)
- DOS Plus 1.2 (mit deutschem Handbuch)
- GEM Desktop 2.0
- GEM Paint 1.0
- Locomotive BASIC 2 v1.12
- Doodle (einfaches Malprogramm)

## Spielepaket

**Amstrad PC Games Collection:** Bruce Lee, The Dam Busters, Tag Team Wrestling und Psi-5 Trading Company – auf drei Disketten in einer Klappbox.

## Handbuch

Ca. **700 Seiten** auf Deutsch.""",
    },
    {
        "title": "Schneider – ein Name, zwei Firmen",
        "slug": "schneider-ein-name-zwei-firmen",
        "category_slug": "geschichte",
        "excerpt": 'In Deutschland hieß das Gerät nicht „Amstrad", sondern „Schneider". Warum – und was das für Käufer bedeutete.',
        "body": """## Ein britisches Gerät mit deutschem Namen

In Deutschland hieß das Gerät nicht „Amstrad", sondern „Schneider". Das war kein Zufall, sondern Strategie.

Die **Schneider Computer Division** – geführt von Albert und Bernhard Schneider – vertrieb seit dem CPC 464 (1984) die Amstrad-Computer in Deutschland, Österreich und der Schweiz unter eigenem Namen. Während in England „Amstrad PC1512" auf der Verpackung stand, lautete der deutsche Name: **„Schneider Systemeinheit by Amstrad"**.

Schneider-Aktiv kommentierte das in der Oktober-Ausgabe 1986 nüchtern: Der Zusatz „by Amstrad" machte deutlich, dass Schneider kein eigenentwickeltes Produkt, sondern ein fertiges Amstrad-Gerät vertrieb.

## Vorteile für Käufer

Diese Konstruktion hatte Vorteile: Schneider verfügte über ein gut ausgebautes Händlernetz in der DACH-Region, und Käufer erhielten ein ca. 700-seitiges **deutsches Handbuch** sowie deutschen Support – während das britische Original in englischer Sprache ausgeliefert wurde.

## Preise im deutschen Handel

- **PC-1512 SD + Monochrommonitor** – 1.999 DM
- **PC-1512 SD + Farbmonitor** – 2.499 DM
- **PC-1512 DD + Monochrommonitor** – 2.499 DM
- **PC-1512 DD + Farbmonitor** – 2.999 DM
- **Mit 10-MB-Festplatte** – ab 2.999 DM
- **Mit 20-MB-Festplatte** – ab 3.999 DM""",
    },
    {
        "title": "16 Farben bei 640×200 – der proprietäre Grafikmodus",
        "slug": "16-farben-proprietaerer-grafikmodus",
        "category_slug": "hardware",
        "excerpt": "Standard-CGA bot 4 Farben bei 320×200 oder 2 Farben bei 640×200. Der PC-1512 konnte mehr – und das war kein IBM-Standard.",
        "body": """## Die Grenzen von Standard-CGA

Standard-CGA-Grafik 1986: entweder 4 Farben bei 320×200 Pixeln, oder 2 Farben bei 640×200. Eine echte Einschränkung für alles, was scharf und bunt sein sollte.

## Was der PC-1512 konnte

Der PC-1512 bot einen erweiterten Modus: **16 Farben gleichzeitig bei 640×200 Pixeln** – mehr als das CGA-Original. Dieser Modus war nicht IBM-kompatibel, sondern eine Eigenentwicklung von Amstrad.

GEM nutzte ihn. Einzelne Spiele wurden dafür angepasst – etwa Infogrames' *Astérix chez Rahazade*.

## Der proprietäre Ausgang

Der Grafikausgang des Rechners war analog mit **Composite-Sync** – ein proprietäres Signal, das speziell auf die Amstrad/Schneider-Monitore ausgelegt war. Das machte den Anschluss eines Fremdmonitors kompliziert – und raubte dann auch noch die Stromversorgung.

## Textdarstellung

- 40×25 oder 80×25 Zeichen
- Jeweils mit 16 Farben""",
    },
    {
        "title": "Kompatibilität – was lief, was nicht",
        "slug": "kompatibilitaet-was-lief-was-nicht",
        "category_slug": "software",
        "excerpt": "Schneider-Aktiv testete im September 1986 ausgiebig, was auf dem PC-1512 läuft. Das Ergebnis war beeindruckend – mit einer bekannten Ausnahme.",
        "body": """## Der Praxistest

Schneider-Aktiv testete im September 1986 ausgiebig, was auf dem PC-1512 läuft. Das Ergebnis war beeindruckend – mit einer bekannten Ausnahme.

## Was problemlos lief

Cyrus II Chess, Summer Games II, Winter Games, Microsoft Flugsimulator (neue Version), Open Access, Lotus 1-2-3, WordStar, Sidekick, Homebase, PC Write, Supercalc 3, Arcnet, WordPerfect 5.1

## Was nicht lief

Eine **alte Version des Microsoft Flight Simulators**, die explizit die originale IBM-Farbkarte verlangte.

## Die Ursachen

Die Inkompatibilität lag im **proprietären Tastaturprotokoll**: Eine Standard-IBM-Tastatur passte nicht. Außerdem hatten Erweiterungskarten mit eigenen Monitoren ein Problem – wer z.B. eine EGA-Karte einbaute, benötigte einen anderen Monitor, verlor damit aber das eingebaute Netzteil und musste eine separate Stromversorgung nachrüsten.

## Die ISA-Slots

Drei ISA-Slots standen zur Verfügung – weniger als die 8 Slots mancher Konkurrenzrechner, aber laut Magazin ausreichend, da **Schnittstellen und Floppy-Controller bereits auf dem Mainboard integriert** waren.""",
    },
]


def run_seed():
    db = SessionLocal()
    try:
        # Admin-User anlegen falls nicht vorhanden
        admin = db.query(models.User).filter(models.User.email == "admin@retrokauz.de").first()
        if not admin:
            admin = models.User(
                email="admin@retrokauz.de",
                username="admin",
                password_hash=hash_password("admin1512"),
                is_admin=True,
                is_verified=True,
            )
            db.add(admin)
            db.flush()
        elif not admin.is_verified:
            admin.is_verified = True

        # Kategorien anlegen falls nicht vorhanden
        cat_map = {}
        for name, slug in CATEGORIES:
            cat = db.query(models.Category).filter(models.Category.slug == slug).first()
            if not cat:
                cat = models.Category(name=name, slug=slug)
                db.add(cat)
                db.flush()
            cat_map[slug] = cat.id

        # Artikel upserten (anlegen oder aktualisieren)
        for a in ARTICLES:
            existing = db.query(models.Article).filter(models.Article.slug == a["slug"]).first()
            if existing:
                existing.title = a["title"]
                existing.body = a["body"]
                existing.excerpt = a["excerpt"]
                existing.category_id = cat_map.get(a["category_slug"])
            else:
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
