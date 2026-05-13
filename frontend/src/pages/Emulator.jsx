import EmulatorScreen from '../components/EmulatorScreen';

export default function Emulator() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Amstrad PC1512-DD</h1>
        <p className="text-gray-500 font-mono text-sm">
          Intel 8086 · 8 MHz · 640 KB RAM · CGA · MS-DOS
        </p>
      </div>

      <EmulatorScreen />

      <div className="mt-8 card">
        <h2 className="text-white font-bold mb-4 font-mono text-sm">
          <span className="text-amber-500">//</span> Bedienung
        </h2>
        <ul className="text-gray-400 text-sm space-y-2 font-mono">
          <li>→ Klick auf den Bildschirm aktiviert Tastatureingaben</li>
          <li>→ Klick außerhalb gibt die Maus wieder frei</li>
          <li>→ FreeDOS bootet automatisch nach dem Start</li>
          <li>→ Eigene Disk-Images: Dateien in <code className="text-amber-400">frontend/public/v86/</code> ablegen</li>
        </ul>
      </div>
    </div>
  );
}
