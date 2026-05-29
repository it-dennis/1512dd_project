import { Link } from 'react-router-dom';

const SPECS = [
  {
    label: 'Prozessor',
    value: 'Intel 8086',
    sub: '8 MHz Turbo',
    body: 'Der Amstrad PC-1512DD nutzte einen Intel 8086, einen 16-Bit-Prozessor, der zur frühen IBM-PC-kompatiblen Generation gehörte. Die Taktfrequenz von 8 MHz war für Mitte der 1980er Jahre alltagstauglich und schneller als viele ältere PC/XT-Systeme mit 4,77 MHz. Der „Turbo"-Modus bedeutete in der Praxis: Der Rechner konnte mit höherer Geschwindigkeit laufen, während für ältere Software oft ein langsamerer Kompatibilitätsmodus sinnvoll war.',
  },
  {
    label: 'Arbeitsspeicher',
    value: '512 KB RAM',
    sub: 'erweiterbar auf 640 KB',
    body: 'Mit 512 KB RAM war der PC-1512 für typische DOS-Anwendungen gut ausgestattet: Textverarbeitung, Tabellenkalkulation, einfache Datenbanken und viele frühe Spiele liefen damit. Die Erweiterung auf 640 KB war wichtig, weil DOS in klassischen PCs maximal 640 KB konventionellen Arbeitsspeicher direkt für Programme nutzte. Diese Grenze wurde später sprichwörtlich für die PC-Ära der 1980er Jahre.',
  },
  {
    label: 'Grafik',
    value: 'CGA',
    sub: '320 × 200 Pixel, 4 Farben',
    body: 'Die CGA-Grafik bot eine Auflösung von 320 × 200 Pixeln mit vier Farben gleichzeitig. Das wirkte aus heutiger Sicht sehr grob, war damals aber ausreichend für Diagramme, einfache Benutzeroberflächen und Spiele. Typisch waren kräftige, kontrastreiche Farbkombinationen. Neben Grafikmodi konnte CGA auch Text sehr klar darstellen, was für Bürosoftware besonders wichtig war.',
  },
  {
    label: 'Laufwerke',
    value: '2 × 5,25″',
    sub: 'Diskettenlaufwerke, je 360 KB',
    body: 'Die Variante „DD" steht für zwei Diskettenlaufwerke. Jedes 5,25-Zoll-Laufwerk konnte Disketten mit 360 KB speichern. Da keine Festplatte eingebaut war, wurde häufig eine Diskette für das Betriebssystem oder Programm und die zweite für Daten verwendet. Das Arbeiten mit zwei Laufwerken war deutlich komfortabler als mit nur einem, weil weniger Diskettenwechsel nötig waren.',
  },
];

export default function TechnischeDaten() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <p className="font-mono text-phosphor-muted text-xs tracking-widest mb-2 uppercase">
        Schneider Amstrad PC1512-DD
      </p>
      <h1 className="text-3xl font-bold text-white mb-2 font-mono">
        <span className="text-phosphor">//</span> Technische Daten
      </h1>
      <p className="mb-10 font-mono text-sm" style={{ color: 'rgba(170,255,204,0.60)' }}>
        Hardware-Spezifikationen und Hintergründe
      </p>

      <div className="space-y-6">
        {SPECS.map(spec => (
          <div key={spec.label} className="card">
            <div className="flex flex-wrap items-baseline gap-3 mb-3">
              <span className="text-phosphor font-mono text-xs uppercase tracking-wider">
                {spec.label}
              </span>
              <span className="text-white text-xl font-bold">{spec.value}</span>
              <span className="text-phosphor-muted text-sm">{spec.sub}</span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: 'rgba(170,255,204,0.70)' }}>
              {spec.body}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-8 card" style={{ borderColor: 'rgba(57,255,122,0.2)' }}>
        <h2 className="text-white font-bold text-lg mb-3 font-mono">
          <span className="text-phosphor">// </span>Einordnung
        </h2>
        <p className="text-sm leading-relaxed" style={{ color: 'rgba(170,255,204,0.70)' }}>
          Der Schneider/Amstrad PC-1512DD war ein günstiger, IBM-kompatibler PC für Büro, Schule und Heimgebrauch.
          Er machte PC-Technik für viele Nutzer erschwinglicher und war besonders in Europa verbreitet.
          Seine Stärke lag weniger in High-End-Leistung, sondern in einem kompletten, bezahlbaren PC-System
          für typische DOS-Anwendungen.
        </p>
      </div>

      <div className="mt-10 pt-8 border-t border-phosphor-muted/20 flex flex-wrap items-center justify-between gap-4">
        <p className="font-mono text-sm" style={{ color: 'rgba(170,255,204,0.50)' }}>
          Mehr zur Geschichte und Hintergründen des PC1512:
        </p>
        <Link to="/articles" className="btn-secondary text-sm px-5 py-2">
          Zur Infothek →
        </Link>
      </div>
    </div>
  );
}
