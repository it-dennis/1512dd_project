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
    desc: 'Wie kam es zum PC1512? Warum Schneider und auch Amstrad? Hä? Alles zur Geschichte und Technik findest du hier.',
  },
  {
    icon: '🖥',
    title: 'Originalgetreue Emulation',
    desc: 'Intel 8086, CGA-Grafik und MS-DOS 3.3 — genau wie damals. Ach, und GEM. Ja, GEM. Das ultracoole GUI von Digital Research. Mensch, du wirst es lieben.',
  },
];

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="relative border-b border-gray-800 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-950/20 to-transparent pointer-events-none" />
        <div className="max-w-6xl mx-auto px-4 py-24 relative">
          <p className="font-mono text-green-400 text-sm tracking-widest mb-4 uppercase">
            Schneider Amstrad PC1512-DD // Emulation · Infothek · Liebe
          </p>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Der PC
            <br />
            <span className="text-green-400">der alles veränderte.</span>
          </h1>
          <p className="text-gray-400 text-xl max-w-2xl mb-10 leading-relaxed">
            Die "Alles-aus-einer-Hand"-Strategie machte einen PC plötzlich bezahlbar für fast jeden.
            Der PC1512 war nicht nur ein Verkaufsschlager, sondern auch der Beginn einer neuen Ära in der Computerwelt. Erlebe die Faszination dieses Kultgeräts hautnah – direkt in deinem Browser.
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
            <span className="text-green-400">//</span> Technische Daten
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {SPECS.map(spec => (
              <div key={spec.label} className="card">
                <div className="text-green-400 font-mono text-xs uppercase tracking-wider mb-2">
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
          <span className="text-green-400">//</span> Was dich erwartet
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
