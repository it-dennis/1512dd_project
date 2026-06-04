import { useEffect, useRef, useState } from 'react';

const EMULATOR_CONFIG = {
  wasm_path: '/v86/v86.wasm',
  bios: { url: '/v86/seabios.bin' },
  vga_bios: { url: '/v86/vgabios.bin' },
  fda: { url: '/v86/freedos722.img' },
  autostart: true,
  memory_size: 32 * 1024 * 1024,
  vga_memory_size: 2 * 1024 * 1024,
};

export default function EmulatorScreen() {
  const screenRef = useRef(null);
  const containerRef = useRef(null);
  const emulatorRef = useRef(null);
  const [status, setStatus] = useState('idle');
  const [started, setStarted] = useState(false);

  const startEmulator = () => {
    if (!window.V86) {
      setStatus('error');
      return;
    }
    setStatus('loading');
    setStarted(true);

    emulatorRef.current = new window.V86({
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

  useEffect(() => {
    const handleKeydown = (e) => {
      if (e.key === 'F11') {
        e.preventDefault();
        if (!document.fullscreenElement) {
          containerRef.current?.requestFullscreen();
        } else {
          document.exitFullscreen();
        }
      }
    };
    // capture: true intercepts F11 before v86 processes it
    document.addEventListener('keydown', handleKeydown, true);
    return () => document.removeEventListener('keydown', handleKeydown, true);
  }, []);

  useEffect(() => {
    const onFullscreenChange = () => {
      const canvas = screenRef.current?.querySelector('canvas');
      if (!canvas) return;

      if (document.fullscreenElement) {
        // Use the canvas pixel dimensions (not CSS size) for correct scale calculation
        const cw = canvas.width || canvas.offsetWidth;
        const ch = canvas.height || canvas.offsetHeight;
        if (!cw || !ch) return;
        const fw = containerRef.current.offsetWidth;
        const fh = containerRef.current.offsetHeight;
        const scale = Math.min(fw / cw, fh / ch);
        canvas.style.transformOrigin = 'top left';
        canvas.style.transform = `translate(${(fw - cw * scale) / 2}px, ${(fh - ch * scale) / 2}px) scale(${scale})`;
      } else {
        canvas.style.transform = '';
        canvas.style.transformOrigin = '';
      }
    };

    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  const statusLabel = {
    idle: null,
    loading: 'Starte DOS...',
    ready: 'Bereit',
    error: 'v86 nicht gefunden — Binärdateien fehlen (siehe README)',
  }[status];

  return (
    <div ref={containerRef} className="flex flex-col items-center gap-4 bg-crt-black">
      {/* Status bar */}
      {statusLabel && (
        <div className="flex items-center gap-2 self-start">
          <div className={`w-2 h-2 rounded-full ${
            status === 'ready' ? 'bg-phosphor' :
            status === 'error' ? 'bg-red-500' :
            'bg-phosphor animate-pulse'
          }`} />
          <span className="font-mono text-sm" style={{ color: 'rgba(170,255,204,0.60)' }}>{statusLabel}</span>
        </div>
      )}

      {/* Screen container — v86 requires exactly: first a div (text mode), then a canvas (VGA) */}
      <div
        ref={screenRef}
        className="border border-phosphor-muted/30 rounded bg-crt-black w-full"
        style={{ minHeight: started ? '400px' : '0' }}
      >
        <div style={{ whiteSpace: 'pre', font: '14px monospace', lineHeight: '14px' }} />
        <canvas style={{ display: 'block', width: '100%' }} />
      </div>

      {/* Start button */}
      {!started && (
        <button onClick={startEmulator} className="btn-primary text-base px-8 py-3">
          PC1512 starten
        </button>
      )}

      {started && status === 'ready' && (
        <p className="font-mono text-xs" style={{ color: 'rgba(30,167,88,0.50)' }}>
          Klick auf den Bildschirm um Tastatureingaben zu aktivieren · F11 = Vollbild
        </p>
      )}
    </div>
  );
}
