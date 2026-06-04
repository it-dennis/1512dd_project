import EmulatorScreen from '../components/EmulatorScreen';

export default function Emulator() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Amstrad PC1512-DD</h1>
        <p className="font-mono text-sm" style={{ color: 'rgba(30,167,88,0.70)' }}>
          Intel 8086 · 8 MHz · 640 KB RAM · CGA · MS-DOS
        </p>
      </div>

      <EmulatorScreen />

      <div className="mt-8 card">
        <h2 className="text-white font-bold mb-4 font-mono text-sm">
          <span className="text-phosphor">//</span> Bedienung
        </h2>
        <ul className="text-sm space-y-2 font-mono" style={{ color: 'rgba(170,255,204,0.60)' }}>
          <li>→ Klick auf den Bildschirm aktiviert Tastatureingaben</li>
          <li>→ F11 = Vollbild · F11 erneut = Vollbild verlassen</li>
          <li>→ Klick außerhalb gibt die Maus wieder frei</li>
        </ul>
      </div>

      <div className="mt-6 card">
        <h2 className="text-white font-bold mb-4 font-mono text-sm">
          <span className="text-phosphor">//</span> Software-Ausstattung
        </h2>
        <p className="font-mono text-xs mb-4" style={{ color: 'rgba(170,255,204,0.40)' }}>
          Das Festplatten-Image wird originalgetreu mit DOSBox-X aufgebaut — so wie der PC1512 damals ausgeliefert wurde.
        </p>
        <ul className="text-sm space-y-2 font-mono" style={{ color: 'rgba(170,255,204,0.60)' }}>
          <li>→ <span className="text-phosphor">MS-DOS 3.3</span> — Amstrad-Edition, Betriebssystem des Originals</li>
          <li>→ <span className="text-phosphor">GEM Desktop 2.0</span> — grafische Oberfläche, Fenster &amp; Icons</li>
          <li>→ <span className="text-phosphor">Norton Commander 2.0</span> — legendärer Dateimanager</li>
          <li>→ <span className="text-phosphor">Frogger</span> &nbsp;·&nbsp; <span className="text-phosphor">Microsoft Flight Simulator 3</span> &nbsp;·&nbsp; <span className="text-phosphor">GW-BASIC</span></li>
        </ul>
      </div>
    </div>
  );
}
