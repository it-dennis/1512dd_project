import { useEffect, useRef, useState } from 'react';

const EMULATOR_CONFIG = {
  bios: { url: '/v86/seabios.bin' },
  vga_bios: { url: '/v86/vgabios.bin' },
  fda: { url: '/v86/freedos722.img' },
  autostart: true,
  memory_size: 32 * 1024 * 1024,
  vga_memory_size: 2 * 1024 * 1024,
};

export default function EmulatorScreen() {
  const screenRef = useRef(null);
  const emulatorRef = useRef(null);
  const [status, setStatus] = useState('idle');
  const [started, setStarted] = useState(false);

  const startEmulator = () => {
    if (!window.V86Starter) {
      setStatus('error');
      return;
    }
    setStatus('loading');
    setStarted(true);

    emulatorRef.current = new window.V86Starter({
      ...EMULATOR_CONFIG,
      screen_container: screenRef.current,
    });

    emulatorRef.current.add_listener('emulator-ready', () => setStatus('ready'));
  };

  useEffect(() => {
    return () => {
      if (emulatorRef.current) emulatorRef.current.destroy();
    };
  }, []);

  const statusLabel = {
    idle: null,
    loading: 'Starte DOS...',
    ready: 'Bereit',
    error: 'v86 nicht gefunden — Binärdateien fehlen (siehe README)',
  }[status];

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Status bar */}
      {statusLabel && (
        <div className="flex items-center gap-2 self-start">
          <div className={`w-2 h-2 rounded-full ${
            status === 'ready' ? 'bg-green-500' :
            status === 'error' ? 'bg-red-500' :
            'bg-amber-500 animate-pulse'
          }`} />
          <span className="font-mono text-sm text-gray-400">{statusLabel}</span>
        </div>
      )}

      {/* Screen container */}
      <div
        ref={screenRef}
        className="border border-gray-700 rounded bg-black w-full"
        style={{ minHeight: started ? '400px' : '0' }}
      >
        <canvas style={{ display: 'block', width: '100%' }} />
      </div>

      {/* Start button */}
      {!started && (
        <button onClick={startEmulator} className="btn-primary text-base px-8 py-3">
          PC1512 starten
        </button>
      )}

      {started && status === 'ready' && (
        <p className="text-gray-600 font-mono text-xs">
          Klick auf den Bildschirm um Tastatureingaben zu aktivieren · F11 = Vollbild
        </p>
      )}
    </div>
  );
}
