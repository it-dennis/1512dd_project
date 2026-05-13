import { Link } from 'react-router-dom';

const SPECS = [
  { label: 'Prozessor', value: 'Intel 8086', sub: '8 MHz Turbo' },
  { label: 'RAM', value: '512 KB', sub: 'erweiterbar auf 640 KB' },
  { label: 'Grafik', value: 'CGA', sub: '320×200 · 4 Farben' },
  { label: 'Laufwerke', value: '2× 5,25"', sub: '360 KB je Diskette' },
];

const FEATURES = [
  {
    icon: '⌨',
    title: 'Browser-Emulator',
    desc: 'MS-DOS direkt im Browser via v86. Kein Download, kein Plugin — nur einloggen und loslegen.',
  },
  {
    icon: '📚',
    title: 'Infothek',
    desc: 'Artikel zur Geschichte des PC1512, zu GEM Desktop, MS-DOS und den Spielen der Ära.',
  },
  {
    icon: '🖥',
    title: 'Originalgetreu',
    desc: 'Intel 8086, CGA-Grafik, PC Speaker — emuliert wie 1986.',
  },
];

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="relative border-b border-gray-800 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-950/20 to-transparent pointer-events-none" />
        <div className="max-w-6xl mx-auto px-4 py-24 relative">
          <p className="font-mono text-amber-500 text-sm tracking-widest mb-4 uppercase">
            Amstrad · Schneider PC1512-DD · 1986
          </p>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Der erste PC
            <br />
            <span className="text-amber-400">meines Vaters.</span>
          </h1>
          <p className="text-gray-400 text-xl max-w-2xl mb-10 leading-relaxed">
            Eine Zeitreise in die Frühzeit des Personal Computing. Emuliere den Amstrad PC1512-DD
            direkt im Browser — mit MS-DOS und den Spielen von damals.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link to="/register" className="btn-primary text-base px-6 py-3">
              Konto erstellen & starten
            </Link>
            <Link to="/articles" className="btn-secondary text-base px-6 py-3">
              Infothek lesen
            </Link>
          </div>
        </div>
      </section>

      {/* Specs */}
      <section className="border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-4 py-16">
          <h2 className="text-2xl font-bold text-white mb-10 font-mono">
            <span className="text-amber-500">//</span> Technische Daten
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {SPECS.map(spec => (
              <div key={spec.label} className="card">
                <div className="text-amber-500 font-mono text-xs uppercase tracking-wider mb-2">
                  {spec.label}
                </div>
                <div className="text-white text-2xl font-bold">{spec.value}</div>
                <div className="text-gray-500 text-sm mt-1">{spec.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-white mb-10 font-mono">
          <span className="text-amber-500">//</span> Was dich erwartet
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {FEATURES.map(f => (
            <div key={f.title} className="card">
              <div className="text-4xl mb-4">{f.icon}</div>
              <h3 className="text-white font-bold text-lg mb-2">{f.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
